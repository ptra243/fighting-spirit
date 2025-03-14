import { CharacterStats, createStats } from './CharacterStats';
import { IBuffBehaviour, IDamageOverTimeBehaviour } from "../Actions/Behaviours/BehaviourUnion";
import { Action } from "../Actions/Action";
import { CharacterEquipment } from "./CharacterEquipment";
import { LogCallbacks } from "../../BattleManager";
import { CharacterClass } from "../Classes/CharacterClass";
import { BaseTriggerManager, TriggerManager } from "../Actions/Triggers/TriggerManager";
import { createAction } from "../Actions/BehaviorFactories";
import { CharacterBuilder } from "./CharacterBuilder";

export interface Character {
    name: string;
    stats: CharacterStats;
    baseStats: CharacterStats;
    sprite: string;
    isCharging: boolean;
    chargeTurns: number;
    chosenActions: Action[];
    currentAction: number;
    equipment: CharacterEquipment;
    classes: CharacterClass[];
    triggerManager: TriggerManager;
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

    const triggerManager = new BaseTriggerManager();
    if (initialCharacter.triggerManager?.triggers) {
        initialCharacter.triggerManager.triggers.forEach(trigger =>
            triggerManager.addTrigger(trigger)
        );
    }

    return {
        name: initialCharacter.name,
        stats: initialCharacter.stats,
        baseStats: initialCharacter.baseStats || createStats(initialCharacter.stats),
        sprite: initialCharacter.sprite || '',
        isCharging: initialCharacter.isCharging || false,
        chargeTurns: initialCharacter.chargeTurns || 0,
        equipment: initialCharacter.equipment || new CharacterEquipment(),
        activeBuffs: initialCharacter.activeBuffs || [],
        activeDOTs: initialCharacter.activeDOTs || [],
        chosenActions: initialCharacter.chosenActions || [],
        currentAction: initialCharacter.currentAction || 0,
        classes: initialCharacter.classes || [],
        triggerManager,
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
    actions: ReturnType<typeof createAction>[] = []
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