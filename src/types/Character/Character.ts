import {CharacterStats} from './CharacterStats';
import {BuffBehaviour} from "../Actions/Behaviours/BuffBehaviour";
import {DamageOverTimeBehaviour} from "../Actions/Behaviours/DamageOverTimeBehaviour";
import {Action} from "../Actions/Action";
import {BaseEquipment} from "../Equipment/EquipmentClassHierarchy";
import {CharacterEquipment} from "./CharacterEquipment";
import {StatBuilder} from "./CharacterStatBuilder";
import {LogCallbacks, Named} from "../../BattleManager";
import {CharacterClass} from "../Classes/CharacterClass";
import {ActionTrigger} from "../Actions/Triggers/Trigger";
import {BaseTriggerManager, TriggerManager} from "../Actions/Triggers/TriggerManager";
import {createAction} from "../Actions/BehaviorFactories";


export class Character {
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
    activeBuffs: BuffBehaviour[];
    activeDOTs: DamageOverTimeBehaviour[];
    logCallback?: LogCallbacks;

    constructor(initialCharacter: Partial<Character>) {
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
            baseStats: initialCharacter.baseStats || new CharacterStats(initialCharacter.stats),
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
    };
}

export const characterUtils = {

    addClass: (character: Character, characterClass: CharacterClass): Character => ({
        ...character,
        classes: [...character.classes, characterClass]
    }),

    addTrigger: (character: Character, trigger: ActionTrigger): Character => {
        character.triggerManager.addTrigger(trigger);
        return character;
    },

    levelUpClass: (character: Character, className: string): Character => {
        const classToLevel = character.classes.find(c => c.getName() === className);
        if (classToLevel) {
            return classToLevel.levelUp(character);
        }
        return character;
    },

    getClasses: (character: Character): CharacterClass[] =>
        [...character.classes],

    setLogCallback: (character: Character, logCallback: LogCallbacks): Character =>
        new Character({...character, logCallback}),

    takeDamage: <T extends Named>(
        character: Character,
        damage: number,
        source: T | null,
        ignoreDefence: boolean = false
    ): Character => {
        const builder = new StatBuilder(character);
        const result = builder.takeDamage(damage, ignoreDefence).build();
        const newCharacter = new Character({...character, stats: result.stats});
        const damageTaken = character.stats.hitPoints - result.stats.hitPoints;

        if (character.logCallback && source) {
            character.logCallback.battleLog(source, 'damage', damageTaken, character);
        }
        return newCharacter;
    },

    restoreHealth: <T extends Named>(
        character: Character,
        amount: number,
        source: T | null
    ): Character => {
        const builder = new StatBuilder(character);
        const result = builder.restoreHealth(amount).build();

        if (character.stats.hitPoints === result.stats.hitPoints) {
            return character;
        }

        const newCharacter = new Character({...character, stats: result.stats});
        if (character.logCallback && source) {
            character.logCallback.battleLog(source, 'heal', amount, character);
        }
        return newCharacter;
    },

    modifyEnergy: <T extends Named>(
        character: Character,
        amount: number,
        source: T | null,
        type: 'spend' | 'recover'
    ): Character => {
        const builder = new StatBuilder(character);
        const result = builder
            .modifyEnergy(amount * (type === 'spend' ? -1 : 1))
            .build();

        if (character.stats.energy === result.stats.energy) {
            return character;
        }

        return new Character({...character, stats: result.stats});
    },

    spendEnergy: <T extends Named>(
        character: Character,
        amount: number,
        source: T | null
    ): Character =>
        characterUtils.modifyEnergy(character, amount, source, 'spend'),

    recoverEnergy: <T extends Named>(
        character: Character,
        amount: number,
        source: T | null
    ): Character =>
        characterUtils.modifyEnergy(character, amount, source, 'recover'),

    addBuff: (character: Character, buff: BuffBehaviour): Character => {
        const newBuffs = [...character.activeBuffs, buff.clone({})];
        if (character.logCallback) {
            character.logCallback.messageLog(`${character.name} gained ${buff.name}`);
            character.logCallback.battleLog(character, 'buff', buff.amount, character);
        }
        return new Character({...character, activeBuffs: newBuffs});
    },

    addDOT: (character: Character, dot: DamageOverTimeBehaviour): Character => {
        const newDOTs = [...character.activeDOTs, dot.clone({})];
        if (character.logCallback) {
            character.logCallback?.messageLog(`${dot.name} has been applied to ${character.name}.`);
        }
        return new Character({...character, activeDOTs: newDOTs});
    },

    applyStartOfTurnEffects: (character: Character): Character => {
        const builder = new StatBuilder(character);
        const {stats: updatedStats, dots: updatedDOTS, buffs: updatedBuffs} = builder
            .applyClassStats()
            .applyEquipmentBuffs()
            .decreaseEffectDurations()
            .decayShield()
            .applyDOTs()
            .applyActiveBuffs()
            .applyRegen()
            .build();

        return new Character({
            ...character,
            stats: updatedStats,
            activeBuffs: updatedBuffs,
            activeDOTs: updatedDOTS
        });
    },

    addEquipment: (character: Character, newEquipment: BaseEquipment): Character => {
        const currentEquipment = character.equipment.addEquipment(newEquipment);
        let stats = character.stats;
        if (newEquipment.boostHitPoints > 0) {
            stats = new CharacterStats({
                ...stats,
                hitPoints: stats.hitPoints + newEquipment.boostHitPoints
            });
        }
        return new Character({
            ...character,
            stats,
            equipment: currentEquipment
        });
    },

    removeEquipment: (character: Character, equipmentName: string): Character => {
        const equipment = character.equipment.getEquippedItems()
            .find(eq => eq.name === equipmentName);

        if (!equipment) {
            character.logCallback?.messageLog(
                `${character.name} doesn't have ${equipmentName} equipped`
            );
            return character;
        }

        const newEquipmentState = character.equipment.removeEquipment(equipmentName);
        const characterWithRemovedEquipment = new Character({
            ...character,
            equipment: newEquipmentState
        });
        const builder = new StatBuilder(characterWithRemovedEquipment);
        const {stats: updatedStats} = builder.applyEquipmentBuffs().build();

        return new Character({
            ...characterWithRemovedEquipment,
            stats: updatedStats
        });
    },

    getEquipment: (character: Character): BaseEquipment[] =>
        character.equipment.getEquippedItems(),

    reset: (character: Character): Character =>
        new Character({
            ...character,
            stats: new CharacterStats(character.baseStats),
            chosenActions: []
        }),

    applyOutOfBattleStats: (character: Character): Character => {
        const builder = new StatBuilder(character);
        const newStats = builder.applyClassStats().setToFullHP().build().stats;
        return new Character({
            ...character,
            stats: newStats
        });
    }


}


export function
// Utility function for cleaner character creation
createCharacter(
    name: string,
    health: number,
    attackPower: number,
    defense: number,
    healthRegen: number = 0,
    energyRegen: number = 0,
    actions: ReturnType<typeof createAction>[] = []
): Character {
    return new Character({
        name: name,
        stats: new CharacterStats({
            maxHitPoints: health,
            attack: attackPower,
            defence: defense,
            hpRegen: healthRegen,
            energyRegen: energyRegen
        }),
        chosenActions: actions
    });
}