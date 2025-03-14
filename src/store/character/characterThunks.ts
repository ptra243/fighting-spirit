// Create helper functions to reconstruct your classes
import type {Draft} from "immer";
import {Action} from "../types/Actions/Action";
import {Character, characterUtils} from "../types/Character/Character";
import {AppDispatch, RootState} from "./types";
import {CharacterClass} from "../types/Classes/CharacterClass";
import {BaseEquipment} from "../types/Equipment/EquipmentClassHierarchy";
import {selectAICharacter, selectPlayerCharacter, setPlayerCharacter} from "./characterSlice";
import {LogCallbacks} from "../BattleManager";

export const reconstructAction = (draftAction: Draft<Action>): Action => {
    return new Action(draftAction);
};

export const reconstructCharacter = (draftCharacter: Draft<Character>): Character => {
    const character = new Character({...draftCharacter} as Character);
    // Reconstruct all Action arrays in the character
    if (draftCharacter.chosenActions) {
        character.chosenActions = draftCharacter.chosenActions.map(reconstructAction);
    }
    return character;
};


// Thunks for character operations
export const levelUpPlayerClass = (
    className: string
) => (dispatch: AppDispatch, getState: () => RootState) => {
    const character = selectPlayerCharacter(getState());
    if (character) {
        const updatedCharacter = characterUtils.wrapCharacter(character).levelUpClass(className);

        dispatch(setPlayerCharacter(updatedCharacter));
    }
};

export const addClassToPlayer = (
    characterClass: CharacterClass
) => (dispatch: AppDispatch, getState: () => RootState) => {
    const character = selectPlayerCharacter(getState());
    if (character) {
        const updatedCharacter = characterUtils.wrapCharacter(character).addClass(characterClass);

        dispatch(setPlayerCharacter(updatedCharacter));
    }
};

export const equipItemToPlayer = (
    equipment: BaseEquipment
) => (dispatch: AppDispatch, getState: () => RootState) => {
    const character = selectPlayerCharacter(getState());
    if (character) {
        const newEquipment = character.equipment.addEquipment(equipment);
        const updatedCharacter = new Character({
            ...character,
            equipment: newEquipment
        });

        dispatch(setPlayerCharacter(updatedCharacter));
    }
};

export const unequipItemFromPlayer = (
    equipmentName: string
) => (dispatch: AppDispatch, getState: () => RootState) => {
    const character = selectPlayerCharacter(getState());
    if (character) {
        const newEquipment = character.equipment.removeEquipment(equipmentName);
        const updatedCharacter = new Character({
            ...character,
            equipment: newEquipment
        });

        dispatch(setPlayerCharacter(updatedCharacter));
    }
};

export const setLogCallback = (callback: LogCallbacks) => (dispatch: AppDispatch, getState: () => RootState) => {
    const character = selectPlayerCharacter(getState());
    if (character) {
        const updatedCharacter = new Character({
            ...character,
            logCallback: callback
        });

        dispatch(setPlayerCharacter(updatedCharacter));
    }
    const aiCharacter = selectAICharacter(getState());
    if (aiCharacter) {
        const updatedCharacter = new Character({
            ...character,
            logCallback: callback
        });

        dispatch(setPlayerCharacter(updatedCharacter));
    }
};