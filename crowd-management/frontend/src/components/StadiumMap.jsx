import React from 'react';

const getDensityColorClass = (density) => {
    if (density < 0.5) return 'bg-green';
    if (density < 0.75) return 'bg-yellow';
    if (density < 0.9) return 'bg-orange';
    return 'bg-red';
};

const getDensityColorHex = (density) => {
    if (density < 0.5) return '#10B981';
    if (density < 0.75) return '#F59E0B';
    if (density < 0.9) return '#F97316';
    return '#EF4444';
};

function StadiumMap({ zones }) {
    if (!zones.length) return <div className="stadium-grid">Loading zones...</div>;

    return (
        <div className="stadium-grid">
            {zones.map(zone => {
                const densityClass = getDensityColorClass(zone.density);
                const fillPercent = Math.min(100, Math.round(zone.density * 100));
                
                return (
                    <div key={zone.id} className={`stadium-zone zone-${zone.type} ${densityClass}`}>
                        {/* The rising background color based on density fill */}
                        <div 
                            className="fill-bar-bg" 
                            style={{ 
                                height: `${fillPercent}%`, 
                                color: getDensityColorHex(zone.density)
                            }} 
                        />
                        
                        <h3>{zone.name}</h3>
                        <div className="fill-tag">{fillPercent}%</div>
                        
                        <div className="zone-stats">
                            <span>{zone.count} / {zone.capacity}</span>
                            {/* Display wait times only for areas where queues matter */}
                            {zone.waitTime > 0 && zone.type !== 'Seating' && (
                                <span className="wait-tag">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                    ~{zone.waitTime}m wait
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default StadiumMap;
