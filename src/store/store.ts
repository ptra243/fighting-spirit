// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './game/gameSlice';
import characterReducer from './character/characterSlice';
import battleReducer from './battle/battleSlice';
import { battleLogger } from "./middleware/battleLoggerMiddleware";
import { battleLoopMiddleware } from './middleware/battleLoopMiddleware';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    character: characterReducer,
    battle: battleReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(battleLogger, battleLoopMiddleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
