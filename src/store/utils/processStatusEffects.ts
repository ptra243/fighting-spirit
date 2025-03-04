// src/store/utils/battleUtils.ts
import { Dispatch } from '@reduxjs/toolkit';
import { Character } from '../types/Character';
import { battleActions } from '../slices/battleSlice';

export const processStatusEffects = async (
  character: Character, 
  dispatch: Dispatch
) => {
  const statusEffects = character.statusEffects;
  
  for (const effect of statusEffects) {
    await new Promise(resolve => 
      setTimeout(resolve, 500 / character.battleSpeed)
    );

    dispatch({
      type: 'character/processStatusEffect',
      payload: { effect, character }
    });
  }
};