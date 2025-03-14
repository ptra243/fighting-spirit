import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BattleState, TurnState, BattleLog } from "../../types/Battle/BattleLog";

export interface BattleReduxState {
  currentTurn: TurnState;
  battleState: BattleState;
  round: number;
  turnCount: number;
  battleLogEntries: BattleLog[];
  isPaused: boolean;
}

const initialState: BattleReduxState = {
  currentTurn: 'player',
  battleState: BattleState.NOT_STARTED,
  round: 0,
  turnCount: 0,
  battleLogEntries: [],
  isPaused: false,
};

const battleSlice = createSlice({
  name: 'battle',
  initialState,
  reducers: {
    startBattle(state, action: PayloadAction<number>) {
      state.battleState = BattleState.IN_PROGRESS;
      state.round = action.payload;
      state.turnCount = 0;
      state.isPaused = false;
      state.battleLogEntries = [];
    },
    endBattle(state) {
      state.battleState = BattleState.ENDED;
      state.isPaused = true;
    },
    incrementTurnCount(state) {
      state.turnCount += 1;
    },
    toggleTurn(state) {
      state.currentTurn = state.currentTurn === 'player' ? 'ai' : 'player';
    },
    logBattleAction(state, action: PayloadAction<BattleLog>) {
      state.battleLogEntries.push(action.payload);
    },
    pauseBattle(state) {
      state.isPaused = true;
    },
    resumeBattle(state) {
      state.isPaused = false;
    },
    resetBattle(state) {
      Object.assign(state, initialState);
    },
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
  resetBattle,
} = battleSlice.actions;

export default battleSlice.reducer;