import { RootState } from "../types";
import type { Character } from "../../types/Character/Character";
import {reconstructAction, reconstructCharacter} from "./characterThunks";

// Selectors
export const selectPlayerCharacter = (state: RootState): Character | null => {
    return state.character.playerCharacter;
};

export const selectAICharacter = (state: RootState): Character | null => {
    return state.character.aiCharacter;
};

export const selectPlayerClasses = (state: RootState) => {
    const character = selectPlayerCharacter(state);
    return character ? character.classes : [];
};

export const selectPlayerChosenActions = (state: RootState) =>
    state.character.playerCharacter.chosenActions?.map(reconstructAction) ?? [];
