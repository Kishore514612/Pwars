import { Router } from 'express';

export default function(simulation, alertEngine) {
    const router = Router();

    router.post('/override/zone', (req, res) => {
        const { zoneId, count } = req.body;
        simulation.setZoneCount(zoneId, count);
        res.json({ success: true });
    });

    router.post('/override/pause', (req, res) => {
        simulation.pauseToggle();
        res.json({ success: true, isPaused: simulation.isPaused });
    });

    router.post('/override/reset', (req, res) => {
        simulation.reset();
        res.json({ success: true });
    });

    router.post('/override/phase', (req, res) => {
        const { phase } = req.body;
        simulation.setPhase(phase);
        res.json({ success: true });
    });

    router.post('/alerts/:id/acknowledge', (req, res) => {
        alertEngine.acknowledgeAlert(parseInt(req.params.id, 10));
        res.json({ success: true });
    });

    return router;
}
