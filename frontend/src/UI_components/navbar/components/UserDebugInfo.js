import React, { useState } from 'react';

const UserDebugInfo = ({ user }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!user) return null;

    return (
        <div style={{ 
            position: 'fixed', 
            top: '60px', 
            right: '10px', 
            background: 'rgba(0,0,0,0.8)', 
            color: 'white', 
            padding: '10px', 
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 1000,
            maxWidth: '300px'
        }}>
            <div 
                onClick={() => setIsExpanded(!isExpanded)}
                style={{ cursor: 'pointer', fontWeight: 'bold' }}
            >
                🐛 Debug User Data (Click to {isExpanded ? 'hide' : 'show'})
            </div>
            
            {isExpanded && (
                <pre style={{ 
                    fontSize: '10px', 
                    whiteSpace: 'pre-wrap', 
                    marginTop: '5px',
                    maxHeight: '400px',
                    overflow: 'auto'
                }}>
                    {JSON.stringify(user, null, 2)}
                </pre>
            )}
        </div>
    );
};

export default UserDebugInfo;
