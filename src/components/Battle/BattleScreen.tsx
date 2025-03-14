import React, { useEffect } from 'react';
import '../../styles/BattleScreenStyles.css';
import { CharacterCard } from "./CharacterCard";
import { ActionsList } from "./ActionsList";
import { BuffsList } from "./BuffsList";
import { BattleLogView } from "./BattleLogView";
import { useDispatch } from 'react-redux';
import { BattleState } from '../../store/battle/enums';
import { setGameStage } from '../../store/game/gameSlice';
import { useBattle } from '../../store/hooks/useBattle';

export const BattleScreen: React.FC<{
    onBattleEnd: () => void;
}> = ({ onBattleEnd }) => {
    const dispatch = useDispatch();
    const {
        battleState,
        isPaused,
        playerCharacter: player,
        aiCharacter: ai,
        togglePause,
        getBattleLog
    } = useBattle();

    useEffect(() => {
        if (battleState === BattleState.ENDED) {
            dispatch(setGameStage('POST_BATTLE'));
        }
    }, [battleState, dispatch]);

    if (!player || !ai) {
        return <div>Loading battle...</div>;
    }

    return (
        <div className="battle-screen">
            <div className="battle-layout">
                <div className="battle-controls">
                    <button
                        className="pause-button"
                        onClick={togglePause}
                    >
                        {isPaused ? "Resume" : "Pause"}
                    </button>
                </div>

                <div className="player-side">
                    <BuffsList character={player}/>
                    <ActionsList isPlayer={true}/>
                </div>

                <div className="battle-board">
                    <div className="characters-container">
                        <CharacterCard isPlayer={true}/>
                        <CharacterCard isPlayer={false}/>
                    </div>
                    <BattleLogView entries={getBattleLog()}/>
                </div>

                <div className="ai-side">
                    <BuffsList character={ai}/>
                    <ActionsList isPlayer={false}/>
                </div>
            </div>
        </div>
    );
};
