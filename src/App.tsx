import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks/hooks';
import { BattleEndScreen } from './components/BattleEndScreen/BattleEndScreen';
import { BattleScreen } from './components/Battle/BattleScreen';
import { PreparationScreenComponent } from './components/Preparation/PreparationScreenComponent';
import { TravelScreen } from './components/Travel/TravelScreen';
import { selectGameStage, setGameStage } from './store/game/gameSlice';
import { startNewGame } from './store/game/gameThunks';

export const App: React.FC = () => {
    const dispatch = useAppDispatch();
    const gameStage = useAppSelector(selectGameStage);

    // Initialize game when app starts
    useEffect(() => {
        dispatch(setGameStage('TRAVEL'));
    }, [dispatch]);

    const handleTravelComplete = () => {
        dispatch(startNewGame());
        dispatch(setGameStage('PREPARE'));
    };

    const handleBattleEnd = () => {
        dispatch(setGameStage('POST_BATTLE'));
    };

    const handleContinue = () => {
        dispatch(setGameStage('TRAVEL'));
    };

    return (
        <div className="App">
            {gameStage === 'TRAVEL' && <TravelScreen onContinueToBattle={handleTravelComplete} />}
            {gameStage === 'PREPARE' && <PreparationScreenComponent />}
            {gameStage === 'BATTLE' && <BattleScreen onBattleEnd={handleBattleEnd} />}
            {gameStage === 'POST_BATTLE' && <BattleEndScreen onContinue={handleContinue} />}
        </div>
    );
};
