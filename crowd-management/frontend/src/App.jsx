import React, { useState, useEffect } from 'react';
import StadiumMap from './components/StadiumMap';
import AlertFeed from './components/AlertFeed';
import StaffPanel from './components/StaffPanel';
import ControlPanel from './components/ControlPanel';

const WS_URL = 'ws://localhost:3001';

function App() {
  const [simulationParams, setSimulationParams] = useState({
    phase: 'Pre-Match',
    timeRemaining: 30,
    isPaused: false,
    zones: []
  });
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    let ws = new WebSocket(WS_URL);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'INITIAL_STATE') {
        setSimulationParams(data.simulation);
        setAlerts(data.alerts);
      } else if (data.type === 'UPDATE') {
        setSimulationParams(data.simulation);
      } else if (data.type === 'ALERTS') {
        setAlerts(data.alerts);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleAcknowledge = async (alertId) => {
    await fetch(`http://localhost:3001/api/alerts/${alertId}/acknowledge`, { method: 'POST' });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="dashboard-container">
      {/* Top Header */}
      <header className="header">
        <h1>VenueCrowd Live</h1>
        <div className="match-clock">
          <div className="phase-badge">
            {simulationParams.isPaused ? 'PAUSED' : simulationParams.phase}
          </div>
          <div className="time">{formatTime(simulationParams.timeRemaining)}</div>
        </div>
      </header>

      {/* Left Pane: Alerts & Staff */}
      <div className="left-pane">
        <div className="panel" style={{ flex: 1 }}>
          <h2 className="panel-title">Smart Alerts</h2>
          <AlertFeed alerts={alerts} onAcknowledge={handleAcknowledge} />
        </div>
        <div className="panel" style={{ flex: 1 }}>
          <h2 className="panel-title">Staff Teams</h2>
          <StaffPanel zones={simulationParams.zones} alerts={alerts} />
        </div>
      </div>

      {/* Center Pane: Stadium Map Visualizer */}
      <div className="map-container">
         <StadiumMap zones={simulationParams.zones} />
      </div>

      {/* Right Pane: Controls Panel */}
      <div className="right-pane">
        <div className="panel">
          <h2 className="panel-title">Override Controls</h2>
          <ControlPanel 
            zones={simulationParams.zones} 
            isPaused={simulationParams.isPaused} 
            currentPhase={simulationParams.phase}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
