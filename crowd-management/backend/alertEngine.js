class AlertEngine {
    constructor() {
        this.alerts = [];
        this.alertIdCounter = 1;
        this.wss = null;
    }

    init(wss) {
        this.wss = wss;
    }

    processZones(zones) {
        let alertsModified = false;

        zones.forEach(zone => {
            const density = zone.count / zone.capacity;
            const densityPercent = Math.round(density * 100);
            
            const existingAlert = this.alerts.find(a => a.zoneId === zone.id && a.status !== 'Resolved');
            
            if (densityPercent >= 80) {
                if (!existingAlert) {
                    // Trigger a new alert
                    const recommendation = this.findRecommendation(zone, zones);
                    const isCritical = densityPercent >= 90;

                    this.alerts.unshift({
                        id: this.alertIdCounter++,
                        zoneId: zone.id,
                        zoneName: zone.name,
                        density: densityPercent,
                        severity: isCritical ? 'Critical' : 'Warning',
                        recommendation,
                        status: 'Active',
                        timestamp: new Date().toISOString()
                    });
                    alertsModified = true;
                } else {
                    // Update existing alert parameters
                    if (existingAlert.density !== densityPercent) {
                        existingAlert.density = densityPercent;
                        existingAlert.severity = densityPercent >= 90 ? 'Critical' : 'Warning';
                        alertsModified = true;
                    }
                }
            } else if (existingAlert) {
                // Auto-resolve when things settle down
                existingAlert.status = 'Resolved';
                alertsModified = true;
            }
        });

        // Broadcast to clients dynamically via socket if modified
        if (alertsModified && this.wss) {
            this.broadcastAlerts();
        }
    }

    findRecommendation(crowdedZone, allZones) {
        // Recommendations look for similar zone types with lowest density
        const sameTypeZones = allZones.filter(z => z.type === crowdedZone.type && z.id !== crowdedZone.id);
        if (sameTypeZones.length === 0) return 'No alternatives available.';
        
        const bestAlternative = sameTypeZones.reduce((best, current) => {
            const currentDensity = current.count / current.capacity;
            const bestDensity = best.count / best.capacity;
            return currentDensity < bestDensity ? current : best;
        });

        const bestAltDensity = Math.round((bestAlternative.count / bestAlternative.capacity) * 100);
        return `Redirect to ${bestAlternative.name} (currently at ${bestAltDensity}%).`;
    }

    acknowledgeAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert && alert.status === 'Active') {
            alert.status = 'Handled';
            this.broadcastAlerts();
        }
    }

    getAlerts() {
        return this.alerts;
    }

    clearAlerts() {
        this.alerts = [];
        this.broadcastAlerts();
    }

    broadcastAlerts() {
        if (!this.wss) return;
        const msg = JSON.stringify({ type: 'ALERTS', alerts: this.alerts });
        this.wss.clients.forEach(client => {
            if (client.readyState === 1) client.send(msg);
        });
    }
}

export default new AlertEngine();
