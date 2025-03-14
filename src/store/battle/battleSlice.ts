import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IActionBehaviour} from "../../types/Actions/Behaviours/BehaviourUnion";
import {characterUtils} from "../../types/Character/Character";
import {executeBehaviourFn} from "./behaviourExecutionUtils";
import {BattleState} from './enums';
import type {Character} from '../../types/Character/Character';
import {BattleLogEntry} from '../../types/Battle/BattleLog';

export type TurnState = 'player' | 'ai';

// The payload you dispatch to execute an Action
export interface ExecuteActionPayload {
    actionId: number;
    behaviours: IActionBehaviour[];
    energyCost: number;
}

// Payload for specific behaviour executions
export interface ExecuteBehaviourPayload {
    attackerId: string;
    targetId?: string;
    behaviour: IActionBehaviour;
}

export interface BattleReduxState {
    currentTurn: TurnState;
    battleState: BattleState;
    round: number;
    turnCount: number;
    battleLogEntries: BattleLogEntry[];
    isPaused: boolean;
    config: {
        MAX_TURNS: number;
        TURN_INTERVAL_MS: number;
        STARTING_REQUIRED_ACTIONS: number;
    };
}

const initialState: BattleReduxState = {
    currentTurn: 'player',
    battleState: BattleState.NOT_STARTED,
    round: 1,
    turnCount: 0,
    battleLogEntries: [],
    isPaused: false,
    config: {
        MAX_TURNS: 20,
        TURN_INTERVAL_MS: 100,
        STARTING_REQUIRED_ACTIONS: 3
    }
};

const battleSlice = createSlice({
    name: 'battle',
    initialState,
    reducers: {
        startBattle: (state) => {
            state.battleState = BattleState.IN_PROGRESS;
            state.turnCount = 0;
            state.currentTurn = 'player';
            state.battleLogEntries = [];
            state.isPaused = false;
        },
        endBattle: (state) => {
            state.battleState = BattleState.ENDED;
            state.isPaused = false;
        },
        incrementTurnCount: (state) => {
            state.turnCount += 1;
        },
        toggleTurn: (state) => {
            state.currentTurn = state.currentTurn === 'player' ? 'ai' : 'player';
        },
        logBattleAction: (state, action: PayloadAction<BattleLogEntry>) => {
            state.battleLogEntries.push(action.payload);
        },
        pauseBattle: (state) => {
            state.isPaused = true;
        },
        resumeBattle: (state) => {
            state.isPaused = false;
        },
        executeAction: (state, action: PayloadAction<ExecuteActionPayload>) => {
            // Only handle battle state changes, character state is managed in characterSlice
            if (state.battleState !== BattleState.IN_PROGRESS || state.isPaused) {
                return state;
            }
            return state;
        },
        executeBehaviour: (state, action: PayloadAction<{
            attacker: Character,
            target: Character,
            behaviour: IActionBehaviour
        }>) => {
            // Only handle battle state changes, character state is managed in characterSlice
            if (state.battleState !== BattleState.IN_PROGRESS || state.isPaused) {
                return state;
            }
            return state;
        }
    },
});

export const {
    startBattle,
    endBattle,
    incrementTurnCount,
    toggleTurn,
    logBattleAction,
    pauseBattle,
    resumeBattle,
    executeAction,
    executeBehaviour
} = battleSlice.actions;

export default battleSlice.reducer;