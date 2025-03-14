import {
    incrementActionCounter,
    resetActionCounter,
    setAICharacter,
    setPlayerCharacter
} from '../character/characterSlice';
import { AppDispatch, RootState } from '../types';
import { BattleState } from './enums';
import { executeAction, executeBehaviour, logBattleAction, startBattle, toggleTurn } from './battleSlice';
import { characterUtils } from "../../types/Character/Character";
import { createAsyncThunk } from '@reduxjs/toolkit';
import { IActionBehaviour } from '../../types/Actions/Behaviours/BehaviourUnion';
import { executeBehaviourFn } from './behaviourExecutionUtils';
import { BattleLogEntry } from '../../types/Battle/BattleLog';
import { Action } from "../../types/Actions/Action";
import { AttackBehaviour } from "../../types/Actions/Behaviours/AttackBehaviour";
import type { Character } from "../../types/Character/Character";

export const runBattleInterval = (round: number) => (dispatch: AppDispatch) => {
    dispatch(startBattle());
};

export const processBattleTick = createAsyncThunk<void, void, { state: RootState }>(
    'battle/processTick',
    async (_, { dispatch, getState }) => {
        const state = getState();
        const player = state.character.playerCharacter;
        const ai = state.character.aiCharacter;

        if (!player || !ai) return;

        // Increment counters each tick
        await dispatch(incrementActionCounter({target: 'player'}));
        await dispatch(incrementActionCounter({target: 'ai'}));

        const playerReady = playerCounterAfterIncrement(player) >= 100;
        const aiReady = playerCounterAfterIncrement(ai) >= 100;

        if (!playerReady && !aiReady) return;

        // Handling who goes first
        if (playerReady && aiReady) {
            // Player goes first if both ready
            await takeTurn(dispatch as AppDispatch, player, ai, 'player');
            await takeTurn(dispatch as AppDispatch, ai, player, 'ai');
        } else if (playerReady) {
            await takeTurn(dispatch as AppDispatch, player, ai, 'player');
        } else if (aiReady) {
            await takeTurn(dispatch as AppDispatch, ai, player, 'ai');
        }
    }
);

const playerCounterAfterIncrement = (character: Character): number => {
    return character.stats.actionCounter + character.stats.speed;
};

const takeTurn = async (dispatch: AppDispatch, attacker: Character, defender: Character, attackerType: 'player' | 'ai') => {
    const action = attacker.chosenActions[attacker.currentAction];
    if (!action) throw new Error(`${attacker.name} has no valid action to execute.`);

    let updatedAttacker = characterUtils.wrapCharacter(attacker).applyStartOfTurnEffects().build();
    if (updatedAttacker.stats.hitPoints <= 0) return;

    await dispatch(executeActionThunk({
        behaviours: action.behaviours as unknown as IActionBehaviour[],
        energyCost: action.energyCost
    }));

    if (attackerType === 'player') {
        dispatch(resetActionCounter({target: 'player'}));
    } else {
        dispatch(resetActionCounter({target: 'ai'}));
    }
};

export interface ExecuteActionThunkPayload {
    behaviours: IActionBehaviour[];
    energyCost: number;
}

export const executeActionThunk = createAsyncThunk<void, ExecuteActionThunkPayload, { state: RootState }>(
    'battle/executeAction',
    async (payload, { getState, dispatch }) => {
        const state = getState();
        const { currentTurn, turnCount } = state.battle;
        
        const attacker = currentTurn === 'player' 
            ? state.character.playerCharacter 
            : state.character.aiCharacter;
        
        const defender = currentTurn === 'player'
            ? state.character.aiCharacter
            : state.character.playerCharacter;

        if (!attacker || !defender) {
            throw new Error('Characters not found');
        }

        // Check energy cost
        if (attacker.stats.energy < payload.energyCost) {
            // Handle insufficient energy
            const updatedAttacker = characterUtils
                .wrapCharacter(attacker)
                .recoverEnergy(attacker.stats.energyRegen, attacker)
                .build();

            // Update the appropriate character
            if (currentTurn === 'player') {
                await dispatch(setPlayerCharacter(updatedAttacker));
            } else {
                await dispatch(setAICharacter(updatedAttacker));
            }
            
            const logEntry: BattleLogEntry = {
                turn: turnCount,
                message: `${attacker.name} has insufficient energy!`,
                type: 'action',
                value: attacker.stats.energy,
                source: attacker.name,
                target: attacker.name
            };
            
            await dispatch(logBattleAction(logEntry));
            return;
        }

        // Spend energy
        let currentAttacker = characterUtils
            .wrapCharacter(attacker)
            .spendEnergy(payload.energyCost, payload.behaviours[0])
            .build();

        // Execute each behaviour in sequence
        let currentDefender = defender;
        
        for (const behaviour of payload.behaviours) {
            const [updatedAttacker, updatedDefender] = executeBehaviourFn(
                currentAttacker,
                currentDefender,
                behaviour
            );
            
            currentAttacker = updatedAttacker;
            currentDefender = updatedDefender;

            // Log the action
            const logEntry: BattleLogEntry = {
                turn: turnCount,
                message: `${currentAttacker.name} used ${behaviour.name} on ${currentDefender.name}!`,
                type: 'action',
                value: 0,
                source: currentAttacker.name,
                target: currentDefender.name
            };
            
            await dispatch(logBattleAction(logEntry));
        }

        // Update the characters in the store
        if (currentTurn === 'player') {
            await dispatch(setPlayerCharacter(currentAttacker));
            await dispatch(setAICharacter(currentDefender));
        } else {
            await dispatch(setPlayerCharacter(currentDefender));
            await dispatch(setAICharacter(currentAttacker));
        }

        // Toggle turn
        await dispatch(toggleTurn());
    }
);
