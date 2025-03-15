import { CharacterStats, createStats } from './CharacterStats';
import { IBuffBehaviour, IDamageOverTimeBehaviour } from "../Actions/Behaviours/BehaviourUnion";
import { Action, ActionConfig } from "../Actions/Action";
import { LogCallbacks } from "../../BattleManager";
import { CharacterClass } from "../Classes/CharacterClass";
import { ActionTrigger } from "../Actions/Triggers/Trigger";
import { createAction } from "../Actions/BehaviorFactories";
import { CharacterBuilder } from "./CharacterBuilder";
import { Equipment } from "../Equipment/EquipmentClassHierarchy";

export interface Character {
    name: string;
    stats: CharacterStats;
    baseStats: CharacterStats;
    sprite: string;
    isCharging: boolean;
    chargeTurns: number;
    chosenActions: ActionConfig[];
    currentAction: number;
    equipment: Equipment[];
    classes: CharacterClass[];
    triggers: ActionTrigger[];
    activeBuffs: IBuffBehaviour[];
    activeDOTs: IDamageOverTimeBehaviour[];
    logCallback?: LogCallbacks;
}

export function createCharacter(initialCharacter: Partial<Character>): Character {
    if (!initialCharacter.name) {
        throw new Error("The 'name' property is required.");
    }
    if (!initialCharacter.stats) {
        throw new Error("The 'stats' property is required.");
    }

    return {
        name: initialCharacter.name,
        stats: initialCharacter.stats,
        baseStats: initialCharacter.baseStats || createStats(initialCharacter.stats),
        sprite: initialCharacter.sprite || '',
        isCharging: initialCharacter.isCharging || false,
        chargeTurns: initialCharacter.chargeTurns || 0,
        equipment: initialCharacter.equipment || [],
        chosenActions: initialCharacter.chosenActions || [],
        currentAction: initialCharacter.currentAction || 0,
        classes: initialCharacter.classes || [],
        triggers: initialCharacter.triggers || [],
        activeBuffs: initialCharacter.activeBuffs || [],
        activeDOTs: initialCharacter.activeDOTs || [],
        logCallback: initialCharacter.logCallback
    };
}

// Helper function for creating a basic character
export function createBasicCharacter(
    name: string,
    health: number,
    attackPower: number,
    defense: number,
    healthRegen: number = 0,
    energyRegen: number = 0,
    actions: ActionConfig[] = []
): Character {
    return createCharacter({
        name,
        stats: createStats({
            maxHitPoints: health,
            attack: attackPower,
            defence: defense,
            hpRegen: healthRegen,
            energyRegen
        }),
        chosenActions: actions
    });
}

export const characterUtils = {
    wrapCharacter(character: Character): CharacterBuilder {
        return new CharacterBuilder(character);
    },

    // Set a log callback
    setLogCallback(character:Character, logCallback: LogCallbacks): Character {
        return {...character, logCallback};
    }
};