import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { selectPlayerCharacter, selectAICharacter } from '../character/characterSelectors';
import { BattleState } from '../battle/enums';
import { startBattle, endBattle, toggleTurn, pauseBattle, resumeBattle } from '../battle/battleSlice';
import { executeActionThunk } from '../battle/battleThunks';
import { IActionBehaviour } from '../../types/Actions/Behaviours/BehaviourUnion';
import { BattleLog } from '../../types/Battle/BattleLog';

export const useBattle = () => {
    const dispatch = useAppDispatch();
    
    const battleState = useAppSelector(state => state.battle.battleState);
    const currentTurn = useAppSelector(state => state.battle.currentTurn);
    const turnCount = useAppSelector(state => state.battle.turnCount);
    const isPaused = useAppSelector(state => state.battle.isPaused);
    const battleLogEntries = useAppSelector(state => state.battle.battleLogEntries);
    const playerCharacter = useAppSelector(selectPlayerCharacter);
    const aiCharacter = useAppSelector(selectAICharacter);

    const start = useCallback(() => {
        dispatch(startBattle());
    }, [dispatch]);

    const end = useCallback(() => {
        dispatch(endBattle());
    }, [dispatch]);

    const togglePause = useCallback(() => {
        if (isPaused) {
            dispatch(resumeBattle());
        } else {
            dispatch(pauseBattle());
        }
    }, [dispatch, isPaused]);

    const executeAction = useCallback((behaviours: IActionBehaviour[], energyCost: number) => {
        dispatch(executeActionThunk({ behaviours, energyCost }));
    }, [dispatch]);

    const getBattleLog = useCallback(() => {
        const log = new BattleLog([]);
        battleLogEntries.forEach(entry => {
            log.addEntry(entry);
        });
        return log;
    }, [battleLogEntries]);

    const isPlayerVictorious = useCallback(() => {
        if (!playerCharacter || !aiCharacter) return false;
        return aiCharacter.stats.hitPoints < playerCharacter.stats.hitPoints;
    }, [playerCharacter, aiCharacter]);

    return {
        battleState,
        currentTurn,
        turnCount,
        isPaused,
        playerCharacter,
        aiCharacter,
        start,
        end,
        togglePause,
        executeAction,
        getBattleLog,
        isPlayerVictorious
    };
}; 