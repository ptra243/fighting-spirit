// src/store/hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../types';
import { useCallback } from 'react';
import type { Character } from '../../types/Character/Character';
import { setPlayerCharacter, setAICharacter } from '../character/characterSlice';
import { useBattle } from './useBattle';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useBattleManager = () => {
    const dispatch = useAppDispatch();
    const {
        playerCharacter,
        aiCharacter,
        currentTurn,
        getBattleLog,
        executeAction
    } = useBattle();

    const setPlayer = useCallback((player: Character) => {
        dispatch(setPlayerCharacter(player));
    }, [dispatch]);

    const setAI = useCallback((ai: Character) => {
        dispatch(setAICharacter(ai));
    }, [dispatch]);

    return {
        playerState: playerCharacter,
        aiState: aiCharacter,
        currentPlayerActionIndex: playerCharacter?.currentAction ?? 0,
        currentAIActionIndex: aiCharacter?.currentAction ?? 0,
        logs: getBattleLog(),
        setPlayer,
        setAI,
        executeAction
    };
};
