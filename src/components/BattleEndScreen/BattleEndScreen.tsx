// components/BattleEndScreen.tsx
import {Action} from "../../types/Actions/Action";

// BattleEndScreen.tsx
import React, { useState } from 'react';
import "../../styles/BattleEndScreenStyles.css";
import { Character } from "../../types/Character/Character";
import { BattleLog } from "../../types/Battle/BattleLog";
import { ActionCard } from '../Cards/ActionCardComponent';

interface BattleEndScreenProps {
    winner: Character;
    battleLog: BattleLog;
    onContinue: (selectedCard?: Action) => void;
    isVictorious: boolean;
    opponent: Character; // Add this prop to access opponent's cards
}

export const BattleEndScreen: React.FC<BattleEndScreenProps> = ({
                                                                    winner,
                                                                    battleLog,
                                                                    onContinue,
                                                                    isVictorious,
                                                                    opponent
                                                                }) => {
    const [selectedCard, setSelectedCard] = useState<Action | null>(null);
    const summary = battleLog.getSummary();

    const handleContinue = () => {
        onContinue(selectedCard || undefined);
    };

    return (
        <div className="battle-end-screen">
            <div className={`battle-banner ${isVictorious ? 'victory' : 'defeat'}`}>
                {isVictorious ? 'VICTORY!' : 'DEFEAT!'}
            </div>

            <h2>{winner.name} Wins!</h2>

            {isVictorious && (
                <div className="card-selection">
                    <h3>Choose a card to add to your deck</h3>
                    <div className="opponent-cards">
                        {opponent.actions.map((card, index) => (
                            <div
                                key={index}
                                className={`card-option ${selectedCard === card ? 'selected' : ''}`}
                                onClick={() => setSelectedCard(card)}
                            >
                                <ActionCard action={card} ></ActionCard>

                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="battle-summary">
                <div className="summary-stats">
                    <div>Total Turns: {summary.totalTurns}</div>
                    <div>Total Damage: {summary.totalDamageDealt}</div>
                    <div>Total Healing: {summary.totalHealing}</div>
                    <div>Most Damage in One Turn: {summary.mostDamageInOneTurn}</div>
                    <div>Longest Buff Duration: {summary.longestBuff}</div>
                    {summary.killingBlow && (
                        <div>Killing Blow: {summary.killingBlow.message}</div>
                    )}
                </div>
            </div>

            <div className="battle-log">
                {battleLog.getEntries().map((entry, index) => (
                <div key={index} className={`log-entry ${entry.type}`}>
                    <span className="turn">Turn {entry.turn}</span>
                    <span className="message">{entry.message}</span>
                </div>
            ))}
            </div>

            <button
                className="continue-button"
                onClick={handleContinue}
                disabled={isVictorious && !selectedCard}
            >
                {isVictorious ? 'Choose Card & Continue' : 'Continue'}
            </button>
        </div>
    );
};