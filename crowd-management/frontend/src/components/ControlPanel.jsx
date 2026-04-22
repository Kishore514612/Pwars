import React, { useState } from 'react';

function ControlPanel({ zones, isPaused, currentPhase }) {
    const [selectedZone, setSelectedZone] = useState('');
    const [manualCount, setManualCount] = useState('');

    const phases = ['Pre-Match', 'First Half', 'Half-Time', 'Second Half', 'Post-Match'];

    const handleOverrideCount = async () => {
        if (!selectedZone || !manualCount) return;
        await fetch('http://localhost:3001/api/override/zone', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ zoneId: selectedZone, count: parseInt(manualCount, 10) })
        });
        setManualCount('');
    };

    const togglePause = async () => {
        await fetch('http://localhost:3001/api/override/pause', { method: 'POST' });
    };

    const resetSim = async () => {
        await fetch('http://localhost:3001/api/override/reset', { method: 'POST' });
    };

    const changePhase = async (e) => {
        const phase = e.target.value;
        await fetch('http://localhost:3001/api/override/phase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phase })
        });
    };

    return (
        <div>
            <div className="control-group">
                <label>Master Simulation State</label>
                <div className="btn-group">
                    <button className={`btn ${isPaused ? 'btn-success' : 'btn-danger'}`} onClick={togglePause}>
                        {isPaused ? '▶ Resume System' : '⏸ Pause System'}
                    </button>
                    <button className="btn" style={{backgroundColor: '#334155', color: '#fff'}} onClick={resetSim}>
                        ⟲ Reset Defaults
                    </button>
                </div>
            </div>

            <div className="control-group">
                <label>Timeline Override (Jump Phase)</label>
                <select value={currentPhase} onChange={changePhase}>
                    {phases.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>

            <div className="control-group" style={{marginTop: '30px', borderTop: '1px solid #1E293B', paddingTop: '20px'}}>
                <label>Inject Anomaly / Sudden Surge</label>
                <select value={selectedZone} onChange={e => setSelectedZone(e.target.value)}>
                    <option value="">-- Target Specific Zone --</option>
                    {zones.map(z => <option key={z.id} value={z.id}>{z.name} (Max: {z.capacity})</option>)}
                </select>
                <input 
                    type="number" 
                    placeholder="Input exact headcount limit..." 
                    value={manualCount} 
                    onChange={e => setManualCount(e.target.value)}
                />
                <button className="btn btn-primary" style={{width: '100%', padding: '12px', fontSize: '0.9rem'}} onClick={handleOverrideCount}>
                    Deploy Override Settings
                </button>
            </div>
            
            <div style={{marginTop: '20px', padding: '15px', backgroundColor: 'rgba(56, 189, 248, 0.05)', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)'}}>
                <p style={{fontSize: '0.75rem', color: '#38BDF8', margin: 0}}>
                    <strong>Demo Note:</strong> Use the controls above to fast-track through match phases or manually pump up zone populations past 80% to trigger the smart routing alerts!
                </p>
            </div>
        </div>
    );
}

export default ControlPanel;
