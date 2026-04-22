import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import routes from './routes.js';
import simulation from './simulation.js';
import alertEngine from './alertEngine.js';

const app = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);
const wss = new WebSocketServer({ server });

// Initialize systems with the WebSocket server instance
simulation.init(wss, alertEngine);
alertEngine.init(wss);

// Mount API routes
app.use('/api', routes(simulation, alertEngine));

// Handle WebSockets connections
wss.on('connection', (ws) => {
    // Send immediate state sync on new connection
    ws.send(JSON.stringify({
        type: 'INITIAL_STATE',
        simulation: simulation.getState(),
        alerts: alertEngine.getAlerts()
    }));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`[Backend] Server running on http://localhost:${PORT}`);
    simulation.start(); // Kick off the sim
});
