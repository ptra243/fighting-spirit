import React, {useState} from 'react';
import "../../styles/BattleEndScreenStyles.css";
import {ActionCard} from '../Cards/ActionCardComponent';
import {Action} from "../../types/Actions/Action";
import {StatItem} from "../Preparation/StatItemComponent";
import {useBattleManager} from "../../context/BattleManagerContext";

interface BattleEndScreenProps {
    onContinue: (selectedCard?: Action) => void;
}

export const BattleEndScreen: React.FC<BattleEndScreenProps> = ({onContinue}) => {
    const {battleManager, setPlayerActions, aiState,} = useBattleManager();
    const [selectedCard, setSelectedCard] = useState<Action | null>(null);

    const battleLog = battleManager.getBattleLog();
    const summary = battleLog.getSummary();
    const winner = battleManager.getWinner();
    const opponent = aiState;
    const isVictorious = battleManager.isPlayerVictorious();

    const handleContinue = () => {
        let playerActions = battleManager.player.actions;
        playerActions.push(selectedCard);
        setPlayerActions(playerActions)
        onContinue(selectedCard || undefined);
    };


    const [expandedDetails, setExpandedDetails] = useState(false);

    const toggleDetails = () => {
        setExpandedDetails(prev => !prev);
    };

    return (
        <div className="battle-end-screen">
            <div className="main-content">
                <div className="player-section">
                    <div className={`battle-banner ${isVictorious ? 'victory' : 'defeat'}`}>
                        <h1>{isVictorious ? 'VICTORY!' : 'DEFEAT!'}</h1>
                    </div>

                    {isVictorious && (
                        <div className="action-selection">
                            <h3 className="section-header">Choose Your Reward</h3>
                            <div className="selection-content">
                                <div className="cards-grid">
                                    {opponent.actions.map((card, index) => (
                                        <div
                                            key={index}
                                            className={`card-container ${selectedCard === card ? 'selected' : ''}`}
                                            onClick={() => setSelectedCard(card)}
                                        >
                                            <ActionCard action={card}/>
                                        </div>
                                    ))}
                                </div>
                                <div className="selection-sidebar">
                                    <p>{selectedCard ? 'Card Selected' : 'No Card Selected'}</p>
                                    <button className="continue-button" onClick={handleContinue}>
                                        Continue
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="expandable-section">
                        <button className="expand-button" onClick={toggleDetails}>
                            {expandedDetails ? '▼' : '▶'} Battle Details
                        </button>
                        {expandedDetails && (
                            <div className="battle-details">
                                <h3 className="section-header">Battle Summary</h3>
                                <div>
                                    <div className="stats-grid">
                                        <StatItem label="Total Turns" value={summary.totalTurns}/>
                                        <StatItem label="Total Damage" value={summary.totalDamageDealt}/>
                                        <StatItem label="Total Healing" value={summary.totalHealing}/>
                                        <StatItem label="Max Damage/Turn" value={summary.mostDamageInOneTurn}/>
                                        <StatItem label="Longest Buff" value={summary.longestBuff}/>
                                        {summary.killingBlow && (
                                            <div className="killing-blow-stat">
                                                <span className="label">Killing Blow:</span>
                                                <span className="value">{summary.killingBlow.message}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="battle-log-section">
                                    <h3 className="section-header">Battle Log</h3>
                                    <div className="battle-log">
                                        {battleLog.getEntries().map((entry, index) => (
                                            <div key={index} className={`log-entry ${entry.type}`}>
                                                <span className="turn">Turn {entry.turn}</span>
                                                <span className="message">{entry.message}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};



