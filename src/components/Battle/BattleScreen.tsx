import React, {useEffect, useState} from 'react';
import '../../styles/BattleScreenStyles.css';
import {useBattleManager} from "../../context/BattleManagerContext";
import {CharacterCard} from "./CharacterCard";
import {ActionsList} from "./ActionsList";
import {BuffsList} from "./BuffsList";
import {BattleLogView} from "./BattleLogView";
import {BattleState} from "../../BattleManager";

export const BattleScreen: React.FC<{
    onBattleEnd: () => void;
}> = ({onBattleEnd}) => {
    const {
        battleManager,
        playerState,
        aiState,
        logs,
        setPlayerActions
    } = useBattleManager();
    const [player, setPlayer] = useState(playerState);
    useEffect(() => {
        if (battleManager.getBattleState() === BattleState.ENDED) {
            onBattleEnd();
        }
    }, [battleManager.getBattleState()]);
    // Add state to track pause status
    const [isPaused, setIsPaused] = useState(false);
    const handlePauseToggle = () => {
        battleManager.togglePause();
        setIsPaused(battleManager.isPausedState());
    };

    return (
        <div className="battle-screen">
            <div className="battle-layout">
                <div className="battle-controls">
                    <button
                        className="pause-button"
                        onClick={handlePauseToggle}
                    >
                        {isPaused ? "Resume" : "Pause"}
                    </button>
                </div>

                <div className="player-side">
                    <BuffsList character={player}/>
                    <ActionsList isPlayer={true}
                    />
                </div>

                <div className="battle-board">
                    <div className="characters-container">
                        <CharacterCard isPlayer={true}/>
                        <CharacterCard isPlayer={false}/>
                    </div>
                    {/* Battle log now takes full width */}
                    <BattleLogView entries={logs}/>
                </div>

                <div className="ai-side">
                    <BuffsList character={aiState}/>
                    <ActionsList isPlayer={false}
                    />
                </div>
            </div>
        </div>
    );
};
