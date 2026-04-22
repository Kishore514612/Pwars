const phases = ['Pre-Match', 'First Half', 'Half-Time', 'Second Half', 'Post-Match'];
const PHASE_DURATION_MS = 30000; // 30 seconds per phase
const TICK_RATE_MS = 2000; // update stats every 2s

class Simulation {
    constructor() {
        this.phaseIndex = 0;
        this.timeRemaining = PHASE_DURATION_MS / 1000;
        this.isPaused = false;
        this.interval = null;
        this.clockInterval = null;
        this.wss = null;
        this.alertEngine = null;

        this.serviceRates = { // Service rates -> people processed per minute
            Entry: 50,
            Exit: 50,
            Food: 20,
            Restroom: 30,
            Seating: 1000 // Seats act as sinks
        };

        this.zones = [
            { id: 'Gate_A', name: 'Gate A', type: 'Entry', capacity: 200, count: 0, team: 'Alpha' },
            { id: 'Gate_B', name: 'Gate B', type: 'Entry', capacity: 200, count: 0, team: 'Alpha' },
            { id: 'Gate_C', name: 'Gate C', type: 'Entry', capacity: 200, count: 0, team: 'Beta' },
            { id: 'Gate_D', name: 'Gate D', type: 'Entry', capacity: 200, count: 0, team: 'Beta' },
            { id: 'FC_1', name: 'FC-1', type: 'Food', capacity: 150, count: 0, team: 'Charlie' },
            { id: 'FC_2', name: 'FC-2', type: 'Food', capacity: 150, count: 0, team: 'Charlie' },
            { id: 'FC_3', name: 'FC-3', type: 'Food', capacity: 150, count: 0, team: 'Delta' },
            { id: 'R_1', name: 'R-1', type: 'Restroom', capacity: 100, count: 0, team: 'Echo' },
            { id: 'R_2', name: 'R-2', type: 'Restroom', capacity: 100, count: 0, team: 'Echo' },
            { id: 'North_Stand', name: 'North Stand', type: 'Seating', capacity: 5000, count: 0, team: 'Foxtrot' },
            { id: 'South_Stand', name: 'South Stand', type: 'Seating', capacity: 5000, count: 0, team: 'Foxtrot' },
            { id: 'East_Stand', name: 'East Stand', type: 'Seating', capacity: 5000, count: 0, team: 'Golf' },
            { id: 'West_Stand', name: 'West Stand', type: 'Seating', capacity: 5000, count: 0, team: 'Golf' },
            { id: 'EX_A', name: 'EX-A', type: 'Exit', capacity: 300, count: 0, team: 'Hotel' },
            { id: 'EX_B', name: 'EX-B', type: 'Exit', capacity: 300, count: 0, team: 'Hotel' }
        ];
    }

    init(wss, alertEngine) {
        this.wss = wss;
        this.alertEngine = alertEngine;
    }

    start() {
        if (!this.interval) {
            this.interval = setInterval(() => this.tick(), TICK_RATE_MS);
            this.clockInterval = setInterval(() => this.tickClock(), 1000);
        }
    }

    tickClock() {
        if (this.isPaused) return;
        this.timeRemaining--;
        if (this.timeRemaining <= 0) {
            this.phaseIndex = (this.phaseIndex + 1) % phases.length;
            this.timeRemaining = PHASE_DURATION_MS / 1000;
        }
        this.broadcastState();
    }

    tick() {
        if (this.isPaused) return;

        const phase = phases[this.phaseIndex];
        
        // Simulating the realistic flow based on match phase
        this.zones.forEach(zone => {
            let targetCount = zone.count;
            switch (phase) {
                case 'Pre-Match':
                    if (zone.type === 'Entry') targetCount += Math.floor(Math.random() * 40);
                    if (zone.type === 'Seating') targetCount += Math.floor(Math.random() * 200);
                    if (zone.type === 'Food' || zone.type === 'Restroom') targetCount += Math.floor(Math.random() * 10);
                    if (zone.type === 'Exit') targetCount = Math.max(0, targetCount - 10);
                    break;
                case 'First Half':
                case 'Second Half':
                    if (zone.type === 'Entry') targetCount = Math.max(0, targetCount - 50);
                    if (zone.type === 'Seating') targetCount = Math.min(zone.capacity, targetCount + 50);
                    if (zone.type === 'Food' || zone.type === 'Restroom') targetCount = Math.max(0, targetCount - 15);
                    break;
                case 'Half-Time':
                    if (zone.type === 'Food') targetCount += Math.floor(Math.random() * 60);
                    if (zone.type === 'Restroom') targetCount += Math.floor(Math.random() * 40);
                    if (zone.type === 'Seating') targetCount = Math.max(0, targetCount - 100);
                    break;
                case 'Post-Match':
                    if (zone.type === 'Seating') targetCount = Math.max(0, targetCount - 300);
                    if (zone.type === 'Exit') targetCount += Math.floor(Math.random() * 100);
                    if (zone.type === 'Food' || zone.type === 'Restroom') targetCount = Math.max(0, targetCount - 20);
                    break;
            }

            // Provide some randomness/fluctuation
            targetCount += Math.floor(Math.random() * 10) - 5;
            if (targetCount < 0) targetCount = 0;
            
            zone.count = targetCount;
        });

        // Trigger analysis engine
        this.alertEngine.processZones(this.zones);
        this.broadcastState();
    }

    broadcastState() {
        if (!this.wss) return;
        const msg = JSON.stringify({ type: 'UPDATE', simulation: this.getState() });
        this.wss.clients.forEach(client => {
            if (client.readyState === 1) client.send(msg);
        });
    }

    getState() {
        const enrichedZones = this.zones.map(z => {
            const density = z.count / z.capacity;
            const waitTime = this.serviceRates[z.type] ? (z.count / this.serviceRates[z.type]) : 0;
            return {
                ...z,
                density,
                waitTime: waitTime.toFixed(1)
            };
        });

        return {
            phase: phases[this.phaseIndex],
            timeRemaining: this.timeRemaining,
            isPaused: this.isPaused,
            zones: enrichedZones
        };
    }

    setZoneCount(id, count) {
        const zone = this.zones.find(z => z.id === id);
        if (zone) zone.count = count;
        this.broadcastState();
    }

    setPhase(phaseName) {
        const idx = phases.indexOf(phaseName);
        if (idx !== -1) {
            this.phaseIndex = idx;
            this.timeRemaining = PHASE_DURATION_MS / 1000;
            this.broadcastState();
        }
    }

    pauseToggle() {
        this.isPaused = !this.isPaused;
        this.broadcastState();
    }

    reset() {
        this.phaseIndex = 0;
        this.timeRemaining = PHASE_DURATION_MS / 1000;
        this.isPaused = false;
        this.zones.forEach(z => z.count = 0);
        this.alertEngine.clearAlerts();
        this.broadcastState();
    }
}

export default new Simulation();
