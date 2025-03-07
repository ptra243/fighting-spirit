import React, {useEffect, useState} from 'react';
import '../../styles/BattleScreenStyles.css';
import {CharacterCard} from "./CharacterCard";
import {ActionsList} from "./ActionsList";
import {BuffsList} from "./BuffsList";
import {BattleLogView} from "./BattleLogView";
import { useSelector, useDispatch } from 'react-redux';
import { BattleState } from '../../BattleManager';
import {setGameStage, updatePlayerState} from '../../store/gameSlice';
import {useAppSelector} from "../../store/hooks/hooks";
import {selectAICharacter, selectPlayerCharacter} from "../../store/characterSlice";


export const BattleScreen: React.FC<{
    onBattleEnd: () => void;
}> = ({onBattleEnd}) => {
    const dispatch = useDispatch();

    const battleManager = useAppSelector((state) => state.game.battleManager);
    const player = useAppSelector(selectPlayerCharacter);
    const ai = useAppSelector(selectAICharacter);

    useEffect(() => {
        if (battleManager?.getBattleState() === BattleState.ENDED) {
            dispatch(setGameStage('POST_BATTLE'));
        }
    }, [battleManager, player, dispatch]);

    // Add state to track pause status
    const [isPaused, setIsPaused] = useState(false);
    const handlePauseToggle = () => {
        battleManager.togglePause();
        setIsPaused(battleManager.isPausedState());
    };

    if (!battleManager || !player) {
        return <div>Loading battle...</div>;
    }

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
                    <BattleLogView entries={battleManager.getBattleLog()}/>
                </div>

                <div className="ai-side">
                    <BuffsList character={ai}/>
                    <ActionsList isPlayer={false}
                    />
                </div>
            </div>
        </div>
    );
};
