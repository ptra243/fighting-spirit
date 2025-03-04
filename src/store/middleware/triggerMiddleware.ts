// src/store/slices/battleSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Character } from '../../types/Character/Character';

export type BattlePhase =
    | 'SETUP'
    | 'START_TURN'
    | 'STATUS_EFFECTS'
    | 'ACTION_SELECTION'
    | 'ACTION_EXECUTION'
    | 'END_TURN'
    | 'BATTLE_END';

export interface BattleEvent {
  type: string;
  data: any;
  timestamp: number;
}

export interface BattleLogEntry {
  message: string;
  type: string;
  value?: number;
  source?: string;
  target?: string;
  timestamp: number;
}

export interface BattleState {
  characters: Character[];
  currentTurnIndex: number;
  isComplete: boolean;
  turnCount: number;
  isPaused: boolean;
  battleSpeed: number;
  waitingForPlayerInput: boolean;
  currentPhase: BattlePhase;
  events: BattleEvent[];
  battleState: 'NOT_STARTED' | 'IN_PROGRESS' | 'ENDED';
  round: number;
  battleLog: BattleLogEntry[];
  requiredActionsCount: number;
  maxTurns: number;
}

const BATTLE_CONFIG = {
  MAX_TURNS: 20,
  STARTING_REQUIRED_ACTIONS: 3,
  DEFAULT_BATTLE_SPEED: 1,
};

const initialState: BattleState = {
  characters: [],
  currentTurnIndex: 0,
  isComplete: false,
  turnCount: 0,
  isPaused: false,
  battleSpeed: BATTLE_CONFIG.DEFAULT_BATTLE_SPEED,
  waitingForPlayerInput: false,
  currentPhase: 'SETUP',
  events: [],
  battleState: 'NOT_STARTED',
  round: 1,
  battleLog: [],
  requiredActionsCount: BATTLE_CONFIG.STARTING_REQUIRED_ACTIONS,
  maxTurns: BATTLE_CONFIG.MAX_TURNS,
};

export const battleSlice = createSlice({
  name: 'battle',
  initialState,
  reducers: {
    initializeBattle: (state, action: PayloadAction<{
      player: Character,
      ai: Character,
      round: number
    }>) => {
      const { player, ai, round } = action.payload;
      state.characters = [player, ai];
      state.round = round;
      state.requiredActionsCount = BATTLE_CONFIG.STARTING_REQUIRED_ACTIONS + round - 1;
      state.battleLog = [];
      state.turnCount = 0;
      state.currentTurnIndex = 0;
      state.battleState = 'NOT_STARTED';
      state.currentPhase = 'SETUP';
      state.isComplete = false;
      state.waitingForPlayerInput = false;
      state.events = [];
    },

    startBattle: (state) => {
      if (state.battleState !== 'NOT_STARTED') {
        return;
      }
      state.battleState = 'IN_PROGRESS';
      state.currentPhase = 'START_TURN';
    },

    setBattleSpeed: (state, action: PayloadAction<number>) => {
      state.battleSpeed = action.payload;
    },

    pauseBattle: (state) => {
      state.isPaused = true;
    },

    resumeBattle: (state) => {
      state.isPaused = false;
    },

    setWaitingForPlayer: (state, action: PayloadAction<boolean>) => {
      state.waitingForPlayerInput = action.payload;
    },

    setPhase: (state, action: PayloadAction<BattlePhase>) => {
      state.currentPhase = action.payload;
    },

    addBattleEvent: (state, action: PayloadAction<Omit<BattleEvent, 'timestamp'>>) => {
      state.events.push({
        ...action.payload,
        timestamp: Date.now()
      });
    },
    

    addBattleLog: (state, action: PayloadAction<Omit<BattleLogEntry, 'turn'>>) => {
      state.battleLog.addEntry(action.payload);
    },

    addSimpleMessage: (state, action: PayloadAction<string>) => {
      state.battleLog.addSimpleMessage(action.payload);
    },

    nextTurn: (state) => {
      state.battleLog.nextTurn();
    },

    clearBattleLog: (state) => {
      state.battleLog.clear();
    },

    updateTurnOrder: (state, action: PayloadAction<number>) => {
      state.currentTurnIndex = action.payload;
      state.turnCount++;
      state.battleLog.nextTurn();
    },


    executeAction: (state, action: PayloadAction<{
      actionId: string,
      sourceIndex: number,
      targetIndex: number
    }>) => {
      const { actionId, sourceIndex, targetIndex } = action.payload;
      const source = state.characters[sourceIndex];
      const target = state.characters[targetIndex];

      // Action execution logic here
      // You'll need to implement this based on your action system

      state.currentPhase = 'END_TURN';
    },

    updateCharacter: (state, action: PayloadAction<{
      characterIndex: number,
      updates: Partial<Character>
    }>) => {
      const { characterIndex, updates } = action.payload;
      state.characters[characterIndex] = {
        ...state.characters[characterIndex],
        ...updates
      };
    },

    endBattle: (state) => {
      state.battleState = 'ENDED';
      state.isComplete = true;
      state.currentPhase = 'BATTLE_END';
      state.addBattleLog({
        message: 'Battle has ended',
        type: 'BATTLE_END'
      });
    },

    resetBattle: (state) => {
      return {
        ...initialState,
        battleSpeed: state.battleSpeed // Preserve battle speed setting
      };
    }
  }
});

export const battleActions = battleSlice.actions;
export default battleSlice.reducer;
