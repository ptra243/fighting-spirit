// src/store/hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import {AppDispatch, RootState} from "../store";
import {Character} from "../../types/Character/Character";
import {BattleManager} from "../../BattleManager";
import {useCallback, useMemo, useState} from "react";
import {Action} from "../../types/Actions/Action";
import {BattleLog} from "../../types/Battle/BattleLog";
import characterSlice, {setAICharacter, setPlayerCharacter} from "../characterSlice";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useBattleManager = () => {
    const dispatch = useAppDispatch();
    const [updateVersion, setUpdateVersion] = useState(0);
    const [battleManager, setBattleManagerState] = useState<BattleManager | null>(null);

    const playerState = useAppSelector(state => state.character.playerCharacter);
    const aiState = useAppSelector(state => state.character.aiCharacter);
    const currentPlayerActionIndex = useAppSelector(state => state.game.currentActionIndex);
    const currentAIActionIndex = useAppSelector(state =>
        state.character.aiCharacter?.currentAction || 0
    );
    const logs = useMemo(() => battleManager?.getBattleLog() || new BattleLog(),
        [battleManager]);

    const forceUpdate = useCallback(() => {
        setUpdateVersion(prev => prev + 1);
    }, []);

    const setBattleManager = useCallback((manager: BattleManager | null) => {
        setBattleManagerState(manager);
        forceUpdate();
    }, [forceUpdate]);
// In the useBattleManager hook:
    const setPlayer = useCallback((player: Character) => {
        if (battleManager) {
            console.log({description: 'battleManagerHook: setPlayer', player});
            dispatch(setPlayerCharacter(player));
            forceUpdate();
        }
    }, [battleManager, dispatch, forceUpdate]);

    const setAI = useCallback((ai: Character) => {
        if (battleManager) {
            dispatch(setAICharacter(ai));
            forceUpdate();
        }
    }, [battleManager, dispatch, forceUpdate]);


    return {
        battleManager,
        playerState,
        aiState,
        currentPlayerActionIndex,
        currentAIActionIndex,
        logs,
        forceUpdate,
        setBattleManager,
        setPlayer,
        setAI,
        battleConfig: BattleManager.CONFIG
    };
};
