import React, {useEffect, useMemo, useState} from 'react';
import '../../styles/Battle/CharacterCard.css'
import {useDispatch, useSelector} from "react-redux";
import {selectAICharacter, selectPlayerCharacter, setAICharacter, setPlayerCharacter} from "../../store/characterSlice";
import {useBattleManager} from "../../store/hooks/hooks";
import {AppDispatch} from "../../store/store";

interface CharacterCardProps {
    isPlayer: boolean;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({isPlayer}) => {
    const {battleConfig} = useBattleManager();

    const dispatch = useDispatch<AppDispatch>();

    const playerState = useSelector(selectPlayerCharacter);
    const aiState = useSelector(selectAICharacter);
    const characterState = useMemo(() => isPlayer ? playerState : aiState, [isPlayer, playerState, aiState]);

    const [speedBarWidth, setSpeedBarWidth] = useState(0);


    const getPercentage = (current: number, max: number) => (current / max) * 100;

    useEffect(() => {
        // Reset animation when counter resets
        if (characterState.stats.actionCounter === 0) {
            setSpeedBarWidth(0);
        }

        // Animate to the current counter value
        setSpeedBarWidth(characterState.stats.actionCounter);
    }, [characterState.stats.actionCounter]);

    //
    // useEffect(() => {
    //     const action = isPlayer ? setPlayerCharacter : setAICharacter;
    //     dispatch(action(characterState));
    // }, [characterState, isPlayer, dispatch]);


    return (
        <div className={`character-card ${isPlayer ? 'player-card' : 'ai-card'}`}>
            <h2>{characterState.name}</h2>

            <div className="stat-bars">
                <div className="bar-container">
                    <label>HP</label>
                    <div className="bar-background">
                        <div
                            className="bar hp-bar"
                            style={{
                                width: `${getPercentage(
                                    characterState.stats.hitPoints,
                                    characterState.stats.maxHitPoints
                                )}%`
                            }}
                        >
                            {characterState.stats.hitPoints}/{characterState.stats.maxHitPoints}
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
                                    characterState.stats.energy,
                                    characterState.stats.maxEnergy
                                )}%`
                            }}
                        >
                            {characterState.stats.energy}/{characterState.stats.maxEnergy}
                        </div>
                    </div>
                </div>

                {characterState.stats.shield > 0 && (
                    <div className="bar-container">
                        <label>Shield</label>
                        <div className="bar-background">
                            <div
                                className="bar shield-bar"
                                style={{width: '100%'}}
                            >
                                {characterState.stats.shield}
                            </div>
                        </div>
                    </div>
                )}
                <div className="bar-container">
                    <label>Speed ({characterState.stats.speed})</label>
                    <div className="bar-background">
                        <div
                            className="bar speed-bar"
                            style={{
                                width: `${speedBarWidth}%`,
                                transition: `width ${battleConfig.TURN_INTERVAL_MS}ms linear`
                            }}
                        >
                            {Math.floor(characterState.stats.actionCounter)}
                        </div>
                    </div>
                </div>

            </div>

            <div className="character-stats">
                <div className="stat">
                    <span>Attack:</span> {characterState.stats.attack}
                </div>
                <div className="stat">
                    <span>Defence:</span> {characterState.stats.defence}
                </div>
            </div>
        </div>
    );
};
