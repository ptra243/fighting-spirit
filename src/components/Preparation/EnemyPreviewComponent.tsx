import React from 'react';
import {StatItem} from "./StatItemComponent";

interface EnemyPreviewProps {
    aiStats: any; // Replace 'any' with proper type from your battle manager
    onStartBattle: () => void;
}

export const EnemyPreview: React.FC<EnemyPreviewProps> = ({aiStats, onStartBattle}) => (
    <div className="enemy-sidebar">
        <div className="enemy-preview">
            <h2>Next Opponent</h2>
            <img src={aiStats.sprite} alt={`${aiStats.name} sprite`} className="enemy-sprite"/>
            <h3>{aiStats.name}</h3>
            <div className="stats-section">
                <h3 className="section-header">Character Statistics</h3>
                <div className="stats-grid">
                    <StatItem label="HP" value={aiStats.stats.maxHitPoints}/>
                    <StatItem label="Attack" value={aiStats.stats.attack}/>
                    <StatItem label="Defence" value={aiStats.stats.defence}/>
                </div>
            </div>
            <div className="enemy-actions">
                <h3>Chosen Actions</h3>
                <ul>
                    {aiStats.chosenActions.map((action: any, index: number) => (
                        <li key={index}>{action.name}</li>
                    ))}
                </ul>
            </div>
        </div>
        <div className="battle-button-container">
            <button className="start-battle-button" onClick={onStartBattle}>
                Start Battle
            </button>
        </div>
    </div>
);