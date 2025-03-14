import { RootState } from "../types";
import { Character } from "../../types/Character/Character";
import { reconstructCharacter } from "../character/characterThunks";

// Selectors
export const selectPlayerCharacter = (state: RootState): Character | null => {
    return state.character.playerCharacter 
        ? reconstructCharacter(state.character.playerCharacter) 
        : null;
};

export const selectAICharacter = (state: RootState): Character | null => {
    return state.character.aiCharacter 
        ? reconstructCharacter(state.character.aiCharacter) 
        : null;
};

export const selectPlayerClasses = (state: RootState) => {
    const character = selectPlayerCharacter(state);
    return character ? character.classes : [];
};