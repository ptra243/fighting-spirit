import React from 'react';
import {initializeGame, initializeGameAndCharacter, setGameStage} from './store/gameSlice';
import { loadNextBattle } from './store/gameThunks';
import { BattleEndScreen } from './components/BattleEndScreen/BattleEndScreen';
import { BattleScreen } from './components/Battle/BattleScreen';
import { PreparationScreen } from './components/Preparation/PreparationScreenComponent';
import { TravelScreen } from './components/Travel/TravelScreen';
import {Character} from "./types/Character/Character";
import {useAppDispatch, useAppSelector} from "./store/hooks/hooks";
import {Player} from "./types/Player/Player";

export const App: React.FC = () => {
    const dispatch = useAppDispatch();
    const { gameStage, battleManager } = useAppSelector(state => state.game);

    dispatch(initializeGameAndCharacter());
    const handleStartBattle = async () => {
        if (battleManager?.canStartBattle().length === 0) {
            dispatch(setGameStage('BATTLE'));
            battleManager.startBattle();
        }
    };

    const handleTravel = async (selectedCard: any) => {
        await dispatch(loadNextBattle());
        dispatch(setGameStage('PREPARE'));
    };

    const handleGameReset = () => {
        // TODO: Add reset action to Redux
        dispatch(setGameStage('CLASS_SELECTION'));
    };

    const handlePostBattle = () => {
        if (battleManager && !battleManager.isPlayerVictorious()) {
            handleGameReset();
        } else {
            dispatch(setGameStage('POST_BATTLE'));
        }
    };

    const handleClassSelection = (character: Character) => {
        // TODO: Add setPlayer action to Redux
        dispatch(setGameStage('TRAVEL'));
    };

    const handleTravelComplete = () => {
        dispatch(setGameStage('PREPARE'));
    };

    return (
        <div>
            {gameStage === 'TRAVEL' && (
                <TravelScreen onContinueToBattle={handleTravelComplete} />
            )}

            {gameStage === 'PREPARE' && (
                <PreparationScreen onStartBattle={handleStartBattle} />
            )}

            {gameStage === 'BATTLE' && (
                <BattleScreen onBattleEnd={handlePostBattle} />
            )}

            {gameStage === 'POST_BATTLE' && (
                <BattleEndScreen onContinue={handleTravel} />
            )}
        </div>
    );
};
