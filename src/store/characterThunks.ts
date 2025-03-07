
// Create helper functions to reconstruct your classes
import type {Draft} from "immer";
import {Action} from "../types/Actions/Action";
import {Character} from "../types/Character/Character";
import {AppDispatch, RootState} from "./store";
import {CharacterClass} from "../types/Classes/CharacterClass";
import {BaseEquipment} from "../types/Equipment/EquipmentClassHierarchy";
import {selectPlayerCharacter, setPlayerCharacter} from "./characterSlice";

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
        const updatedCharacter = new Character({
            ...character
        }).levelUpClass(className);

        dispatch(setPlayerCharacter(updatedCharacter));
    }
};

export const addClassToPlayer = (
    characterClass: CharacterClass
) => (dispatch: AppDispatch, getState: () => RootState) => {
    const character = selectPlayerCharacter(getState());
    if (character) {
        const updatedCharacter = new Character({
            ...character
        }).addClass(characterClass);

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