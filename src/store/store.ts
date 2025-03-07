// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './gameSlice';
import characterReducer from './characterSlice';


export const store = configureStore({
  reducer: {
    game: gameReducer,
    character: characterReducer
  }
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
