import React from 'react';

function AlertFeed({ alerts, onAcknowledge }) {
    if (alerts.length === 0) {
        return (
            <div className="scroll-area flex-center" style={{padding: '20px', textAlign: 'center'}}>
                <p style={{color: '#10B981', fontSize: '0.9rem', fontWeight: 600}}>✓ All systems functional. Venue is optimal.</p>
            </div>
        );
    }

    return (
        <div className="scroll-area">
            {alerts.map(alert => (
                <div key={alert.id} className={`alert-card ${alert.status === 'Resolved' ? 'Resolved' : alert.severity}`}>
                    <div className="alert-header">
                        <span className="alert-zone">{alert.zoneName} ({alert.density}%)</span>
                        <span className="alert-time">
                            {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    {alert.status === 'Resolved' ? (
                        <div className="alert-desc" style={{ color: '#10B981', fontWeight: 600 }}>Resolved below threshold.</div>
                    ) : (
                        <>
                            <div className="alert-desc">
                                <strong>{alert.severity === 'Critical' ? 'Critical Action Required! ' : 'High Density Warning. '}</strong>
                                {alert.recommendation}
                            </div>
                            {alert.status === 'Active' && (
                                <button className="btn btn-primary" onClick={() => onAcknowledge(alert.id)}>
                                    Acknowledge Command
                                </button>
                            )}
                            {alert.status === 'Handled' && (
                                <span style={{fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600}}>✓ Acknowledged & Dispatching Team</span>
                            )}
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}

export default AlertFeed;
