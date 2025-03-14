import { AnyAction, Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import { RootState, AppDispatch } from '../types';
import { BattleState } from '../battle/enums';
import { endBattle, incrementTurnCount, toggleTurn } from '../battle/battleSlice';
import { executeActionThunk } from '../battle/battleThunks';
import { IActionBehaviour } from '../../types/Actions/Behaviours/BehaviourUnion';

let battleInterval: NodeJS.Timeout | null = null;

const clearBattleInterval = () => {
    if (battleInterval) {
        clearInterval(battleInterval);
        battleInterval = null;
    }
};

export const battleLoopMiddleware = (api: MiddlewareAPI) => (next: (action: AnyAction) => void) => (action: AnyAction) => {
    const result = next(action);
    const state = api.getState();
    const dispatch = api.dispatch as AppDispatch;

    // Start battle loop when battle starts
    if (action.type === 'battle/startBattle') {
        clearBattleInterval();
        battleInterval = setInterval(() => {
            const currentState = api.getState();
            const { battle, character } = currentState;

            // Check if battle should end
            if (battle.battleState !== BattleState.IN_PROGRESS || 
                battle.isPaused ||
                !character.playerCharacter ||
                !character.aiCharacter) {
                return;
            }

            // Check victory conditions
            const { playerCharacter, aiCharacter } = character;
            if (playerCharacter.stats.hitPoints <= 0 || aiCharacter.stats.hitPoints <= 0) {
                dispatch(endBattle());
                return;
            }

            // Check max turns
            if (battle.turnCount >= battle.config.MAX_TURNS * battle.round) {
                dispatch(endBattle());
                return;
            }

            // Process turn
            dispatch(incrementTurnCount());

            // Execute AI turn if it's AI's turn
            if (battle.currentTurn === 'ai' && aiCharacter.chosenActions.length > 0) {
                const currentAction = aiCharacter.chosenActions[aiCharacter.currentAction];
                dispatch(executeActionThunk({
                    behaviours: currentAction.behaviours as unknown as IActionBehaviour[],
                    energyCost: currentAction.energyCost
                }));
            }
        }, state.battle.config.TURN_INTERVAL_MS);
    }

    // Clean up interval when battle ends
    if (action.type === 'battle/endBattle') {
        clearBattleInterval();
    }

    return result;
}; 