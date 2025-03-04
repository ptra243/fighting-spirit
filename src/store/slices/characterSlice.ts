// src/store/slices/characterSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Character } from '../../types/Character/Character';
import {Action} from "../../types/Actions/Action";

interface CharacterState {
  activeCharacter: Character | null;
  target: Character | null;
  isProcessing: boolean;
  error: string | null;
}

const initialState: CharacterState = {
  activeCharacter: null,
  target: null,
  isProcessing: false,
  error: null
};

export const characterSlice = createSlice({
  name: 'character',
  initialState,
  reducers: {
    executeActionRequest: (state, action: PayloadAction<Action>) => {
      state.isProcessing = true;
      state.error = null;
    },
    executeActionSuccess: (state, action: PayloadAction<{
      character: Character,
      target: Character,
      results: any
    }>) => {
      state.activeCharacter = action.payload.character;
      state.target = action.payload.target;
      state.isProcessing = false;
    },
    executeActionFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isProcessing = false;
    },
    processStatusEffect: (state, action: PayloadAction<{
      effect: any,
      character: Character
    }>) => {
      // Handle status effect processing
    }
  }
});

export const characterActions = characterSlice.actions;
export default characterSlice.reducer;