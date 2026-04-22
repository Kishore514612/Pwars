import React from 'react';

function StaffPanel({ zones, alerts }) {
    // Collect unique operational teams
    const teams = [...new Set(zones.map(z => z.team))];
    
    // Evaluate operational load visually
    const teamData = teams.map(teamName => {
        const teamZones = zones.filter(z => z.team === teamName);
        let status = 'Normal';
        
        teamZones.forEach(z => {
            const activeAlert = alerts.find(a => a.zoneId === z.id && a.status === 'Active');
            if (activeAlert) {
                status = 'Action Required';
            } else if (status !== 'Action Required' && z.density >= 0.75) {
                status = 'Monitoring';
            }
        });

        return {
            name: teamName,
            zones: teamZones.map(z => z.name).join(', '),
            status
        };
    });

    return (
        <div className="scroll-area">
            <table className="staff-table">
                <thead>
                    <tr>
                        <th>Team Unit</th>
                        <th>Coverage Area</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {teamData.map(team => (
                        <tr key={team.name} className={team.status === 'Action Required' ? 'action-required staff-row' : 'staff-row'}>
                            <td style={{fontWeight: 700}}>Team {team.name}</td>
                            <td style={{fontSize: '0.75rem', color: '#94A3B8'}}>{team.zones}</td>
                            <td>
                                <span className={`status-badge status-${team.status.split(' ')[0]}`}>
                                    {team.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default StaffPanel;
