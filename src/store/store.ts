// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import battleReducer from './slices/battleSlice';
import characterReducer from './slices/characterSlice';
import { battleLoopMiddleware } from './middleware/battleLoopMiddleware';
import { triggerMiddleware } from './middleware/triggerMiddleware';

export const store = configureStore({
  reducer: {
    battle: battleReducer,
    character: characterReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(battleLoopMiddleware)
      .concat(triggerMiddleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;