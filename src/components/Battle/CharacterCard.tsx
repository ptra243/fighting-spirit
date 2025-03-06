import React, {useEffect, useState} from 'react';
import {useBattleManager} from "../../context/BattleManagerContext";
import '../../styles/Battle/CharacterCard.css'

interface CharacterCardProps {
    isPlayer: boolean;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({isPlayer}) => {
    const {playerState, aiState, battleConfig} = useBattleManager();

    const [speedBarWidth, setSpeedBarWidth] = useState(0);
    const [character, setCharacter] = useState(isPlayer ? playerState : aiState);

    const getPercentage = (current: number, max: number) => (current / max) * 100;

    useEffect(() => {
        // Reset animation when counter resets
        if (character.stats.actionCounter === 0) {
            setSpeedBarWidth(0);
        }

        // Animate to the current counter value
        setSpeedBarWidth(character.stats.actionCounter);
    }, [character.stats.actionCounter]);

    useEffect(() => {
        setCharacter(isPlayer ? playerState : aiState);
    }, [playerState, aiState]);
    return (
        <div className={`character-card ${isPlayer ? 'player-card' : 'ai-card'}`}>
            <h2>{character.name}</h2>

            <div className="stat-bars">
                <div className="bar-container">
                    <label>HP</label>
                    <div className="bar-background">
                        <div
                            className="bar hp-bar"
                            style={{
                                width: `${getPercentage(
                                    character.stats.hitPoints,
                                    character.stats.maxHitPoints
                                )}%`
                            }}
                        >
                            {character.stats.hitPoints}/{character.stats.maxHitPoints}
                        </div>
                    </div>
                </div>

                <div className="bar-container">
                    <label>Energy</label>
                    <div className="bar-background">
                        <div
                            className="bar energy-bar"
                            style={{
                                width: `${getPercentage(
                                    character.stats.energy,
                                    character.stats.maxEnergy
                                )}%`
                            }}
                        >
                            {character.stats.energy}/{character.stats.maxEnergy}
                        </div>
                    </div>
                </div>

                {character.stats.shield > 0 && (
                    <div className="bar-container">
                        <label>Shield</label>
                        <div className="bar-background">
                            <div
                                className="bar shield-bar"
                                style={{width: '100%'}}
                            >
                                {character.stats.shield}
                            </div>
                        </div>
                    </div>
                )}
                <div className="bar-container">
                    <label>Speed ({character.stats.speed})</label>
                    <div className="bar-background">
                        <div
                            className="bar speed-bar"
                            style={{
                                width: `${speedBarWidth}%`,
                                transition: `width ${battleConfig.TURN_INTERVAL_MS}ms linear`
                            }}
                        >
                            {Math.floor(character.stats.actionCounter)}
                        </div>
                    </div>
                </div>

            </div>

            <div className="character-stats">
                <div className="stat">
                    <span>Attack:</span> {character.stats.attack}
                </div>
                <div className="stat">
                    <span>Defence:</span> {character.stats.defence}
                </div>
            </div>
        </div>
    );
};
