import {AppDispatch, RootState} from "./store";
import {CharacterClass} from "../types/Classes/CharacterClass";
import {Character} from "../types/Character/Character";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {BaseEquipment} from "../types/Equipment/EquipmentClassHierarchy";
import type { Draft } from 'immer';
import {Action} from "../types/Actions/Action";
import {reconstructAction, reconstructCharacter} from "./characterThunks";




interface CharacterState {
    playerCharacter: Character | null;
    aiCharacter: Character | null;
    aiCharacters: Character[]; // Pool of available AI characters
    battleHistory: {
        playerHP: number;
        aiHP: number;
        timestamp: number;
    }[];

}

const initialState: CharacterState = {
    playerCharacter: null,
    aiCharacter: null,
    aiCharacters: [],
    battleHistory: []

};

const characterSlice = createSlice({
    name: 'character',
    initialState,
    reducers: {
        setPlayerCharacter: (state, action: PayloadAction<Partial<Character>>) => {
            if (state.playerCharacter) {
                state.playerCharacter = {
                    ...state.playerCharacter,
                    ...action.payload
                };
            } else {
                state.playerCharacter = action.payload as Character;
            }
        },
        setAICharacter: (state, action: PayloadAction<Partial<Character>>) => {
            if (state.aiCharacter) {
                state.aiCharacter = {
                    ...state.aiCharacter,
                    ...action.payload
                };
            } else {
                state.aiCharacter = action.payload as Character;
            }
        },
        setAICharacters: (state, action: PayloadAction<Character[]>) => {
            state.aiCharacters = action.payload;
        },
        recordBattleState: (state) => {
            if (state.playerCharacter && state.aiCharacter) {
                state.battleHistory.push({
                    playerHP: state.playerCharacter.stats.hitPoints,
                    aiHP: state.aiCharacter.stats.hitPoints,
                    timestamp: Date.now()
                });
            }
        },
        incrementActionCounter: (state, action: PayloadAction<{ target: 'player' | 'ai' }>) => {
            if (action.payload.target === 'player' && state.playerCharacter) {
                state.playerCharacter.stats.actionCounter += state.playerCharacter.stats.speed;
            } else if (action.payload.target === 'ai' && state.aiCharacter) {
                state.aiCharacter.stats.actionCounter += state.aiCharacter.stats.speed;
            }
        },

        resetActionCounter: (state, action: PayloadAction<{ target: 'player' | 'ai' }>) => {
            if (action.payload.target === 'player' && state.playerCharacter) {
                state.playerCharacter.stats.actionCounter = 0;
            } else if (action.payload.target === 'ai' && state.aiCharacter) {
                state.aiCharacter.stats.actionCounter = 0;
            }
        }


    }
});


// Selectors
export const selectPlayerCharacter = (state: RootState): Character | null => {
    return state.character.playerCharacter ? reconstructCharacter(state.character.playerCharacter) : null;
};

// Selectors
export const selectAICharacter = (state: RootState): Character | null => {
    return state.character.aiCharacter ? reconstructCharacter(state.character.aiCharacter) : null;
};

export const selectPlayerClasses = (state: RootState): CharacterClass[] => {
    const character = selectPlayerCharacter(state);
    return character ? character.classes : [];
};

const selectPlayerActions = (state: RootState) =>
    state.character.playerCharacter.chosenActions?.map(reconstructAction) ?? [];

export const {
    setPlayerCharacter,
    setAICharacter,
    recordBattleState,
    resetActionCounter,
    incrementActionCounter
} = characterSlice.actions;

export default characterSlice.reducer;
