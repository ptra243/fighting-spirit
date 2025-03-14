// Create helper functions to reconstruct your classes
import { RootState, AppDispatch } from "../types";
import type {Character} from "../../types/Character/Character";
import {CharacterClass} from "../../types/Classes/CharacterClass";
import {Draft} from "immer";
import {selectPlayerCharacter} from "./characterSelectors";
import {Action} from "../../types/Actions/Action";
import {setPlayerCharacter} from "./characterSlice";
import {LogCallbacks} from "../../BattleManager";
import {Equipment} from "../../types/Equipment/EquipmentClassHierarchy";
import {CharacterBuilder} from "../../types/Character/CharacterBuilder";

export const reconstructAction = (draftAction: Draft<Action>): Action => {
    return new Action({
        name: draftAction.name,
        behaviours: draftAction.behaviours,
        energyCost: draftAction.energyCost,
        description: draftAction.description,
        requirement: draftAction.requirement,
        chargeTurns: draftAction.chargeTurns,
        isPrecharge: draftAction.isPrecharge,
        triggerManager: draftAction.triggerManager
    });
};

export const reconstructCharacter = (draftCharacter: Draft<Character>): Character => {
    const builder = new CharacterBuilder(draftCharacter as Character);
    return builder.build();
};


// Thunks for character operations
export const levelUpPlayerClass = (
    className: string
) => (dispatch: AppDispatch, getState: () => RootState) => {
    const character = selectPlayerCharacter(getState());
    if (!character) return;

    const builder = new CharacterBuilder(character);
    const updatedCharacter = builder
        .levelUpClass(className)
        .build();

    dispatch(setPlayerCharacter(updatedCharacter));
};

export const addClassToPlayer = (
    characterClass: CharacterClass
) => (dispatch: AppDispatch, getState: () => RootState) => {
    const character = selectPlayerCharacter(getState());
    if (!character) return;

    const builder = new CharacterBuilder(character);
    const updatedCharacter = builder
        .addClass(characterClass)
        .build();

    dispatch(setPlayerCharacter(updatedCharacter));
};

export const equipItemToPlayer = (
    equipment: Equipment
) => (dispatch: AppDispatch, getState: () => RootState) => {
    const character = selectPlayerCharacter(getState());
    if (!character) return;

    const updatedEquipment = character.equipment.addEquipment(equipment);
    const builder = new CharacterBuilder(character);
    const updatedCharacter = builder
        .addEquipment(updatedEquipment)
        .build();

    dispatch(setPlayerCharacter(updatedCharacter));
};

export const unequipItemFromPlayer = (
    equipmentName: string
) => (dispatch: AppDispatch, getState: () => RootState) => {
    const character = selectPlayerCharacter(getState());
    if (!character) return;

    const updatedEquipment = character.equipment.removeEquipment(equipmentName);
    const builder = new CharacterBuilder(character);
    const updatedCharacter = builder
        .addEquipment(updatedEquipment)
        .build();

    dispatch(setPlayerCharacter(updatedCharacter));
};

export const setLogCallback = (
    callback: LogCallbacks
) => (dispatch: AppDispatch, getState: () => RootState) => {
    const character = selectPlayerCharacter(getState());
    if (!character) return;

    const builder = new CharacterBuilder(character);
    const updatedCharacter = builder
        .setLogCallback(callback)
        .build();

    dispatch(setPlayerCharacter(updatedCharacter));
};

export const healToFull = () => (dispatch: AppDispatch, getState: () => RootState) => {
    const character = selectPlayerCharacter(getState());
    if (!character) return;

    const builder = new CharacterBuilder(character);
    const updatedCharacter = builder
        .healToFull()
        .build();

    dispatch(setPlayerCharacter(updatedCharacter));
};