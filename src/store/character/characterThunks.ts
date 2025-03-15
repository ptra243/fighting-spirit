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
import {createStats} from "../../types/Character/CharacterStats";

export const reconstructAction = (draftAction: Draft<Action>): Action => {
    return new Action({
        name: draftAction.name,
        behaviours: draftAction.behaviours,
        energyCost: draftAction.energyCost,
        description: draftAction.description,
        requirement: draftAction.requirement,
        chargeTurns: draftAction.chargeTurns,
        isPrecharge: draftAction.isPrecharge,
        triggers: draftAction.triggers
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

    const classToLevel = character.classes.find(c => c.getName() === className);
    if (!classToLevel) return;

    const updatedCharacter = classToLevel.levelUp(character);
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

    const builder = new CharacterBuilder(character);
    const updatedCharacter = builder
        .addEquipment(equipment)
        .build();

    dispatch(setPlayerCharacter(updatedCharacter));
};

export const unequipItemFromPlayer = (
    equipment: Equipment
) => (dispatch: AppDispatch, getState: () => RootState) => {
    const character = selectPlayerCharacter(getState());
    if (!character) return;

    const builder = new CharacterBuilder(character);
    const updatedCharacter = builder
        .removeEquipment(equipment)
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

export const healPlayerToFull = () => (dispatch: AppDispatch, getState: () => RootState) => {
    const character = selectPlayerCharacter(getState());
    if (!character) return;

    const builder = new CharacterBuilder(character);
    const updatedCharacter = builder
        .setStats({
            ...character.stats,
            hitPoints: character.stats.maxHitPoints
        })
        .build();

    dispatch(setPlayerCharacter(updatedCharacter));
};