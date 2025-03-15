import { Character, createCharacter } from "./Character";
import { CharacterStats, createStats } from "./CharacterStats";
import { CharacterEquipment } from "./CharacterEquipment";
import { Action, ActionConfig } from "../Actions/Action";
import { CharacterClass } from "../Classes/CharacterClass";
import { IBuffBehaviour, IDamageOverTimeBehaviour } from "../Actions/Behaviours/BehaviourUnion";
import { ActionTrigger } from "../Actions/Triggers/Trigger";
import { Named } from "../../BattleManager";
import { BuffBehaviour, BuffStat } from "../Actions/Behaviours/BuffBehaviour";
import { DamageOverTimeBehaviour } from "../Actions/Behaviours/DamageOverTimeBehaviour";
import { LogCallbacks } from "../../BattleManager";
import { Equipment } from "../Equipment/EquipmentClassHierarchy";

export class CharacterBuilder {
    private name: string;
    private stats: CharacterStats;
    private baseStats: CharacterStats;
    private sprite: string;
    private equipment: Equipment[];
    private chosenActions: ActionConfig[];
    private classes: CharacterClass[];
    private triggers: ActionTrigger[];
    private activeBuffs: IBuffBehaviour[];
    private activeDOTs: IDamageOverTimeBehaviour[];
    private isCharging: boolean;
    private chargeTurns: number;
    private currentAction: number;
    private logCallback?: LogCallbacks;

    constructor(character: Character) {
        this.name = character.name;
        this.stats = character.stats;
        this.baseStats = character.baseStats;
        this.sprite = character.sprite;
        this.equipment = [...character.equipment];
        this.chosenActions = [...character.chosenActions];
        this.classes = [...character.classes];
        this.triggers = [...character.triggers];
        this.activeBuffs = [...character.activeBuffs];
        this.activeDOTs = [...character.activeDOTs];
        this.isCharging = character.isCharging;
        this.chargeTurns = character.chargeTurns;
        this.currentAction = character.currentAction;
        this.logCallback = character.logCallback;
    }

    // Add a trigger to the character
    addTrigger(trigger: ActionTrigger): this {
        this.triggers.push(trigger);
        return this;
    }

    // Remove a trigger from the character
    removeTrigger(trigger: ActionTrigger): this {
        this.triggers = this.triggers.filter(t => t !== trigger);
        return this;
    }

    // Execute triggers of a specific type
    executeTriggers(type: string, target: Character): [Character, Character] {
        let updatedCharacter = this.build();
        let updatedTarget = target;

        for (const trigger of this.triggers) {
            if (trigger.condition.type !== type || trigger.hasBeenTriggered) continue;

            if (trigger.condition.chance && Math.random() > trigger.condition.chance) continue;

            // if (trigger.condition.requirement &&
            //     !trigger.condition.requirement(updatedCharacter, updatedTarget)) continue;

            // if (trigger.effect.execute) {
            //     [updatedCharacter, updatedTarget] = trigger.effect.execute(
            //         updatedCharacter,
            //         updatedTarget,
            //         null
            //     );
            // }
            // if (trigger.effect.behaviour) {
            //     [updatedCharacter, updatedTarget] = trigger.effect.behaviour.execute(
            //         updatedCharacter,
            //         updatedTarget
            //     );
            // }
            trigger.hasBeenTriggered = true;
        }

        return [updatedCharacter, updatedTarget];
    }

    // Reset all triggers
    resetTriggers(): this {
        this.triggers.forEach(t => {
            t.hasBeenTriggered = false;
        });
        return this;
    }

    // Add a buff to the character
    addBuff(buff: IBuffBehaviour): this {
        this.activeBuffs.push(buff);
        return this;
    }

    // Remove a buff from the character
    removeBuff(buff: IBuffBehaviour): this {
        this.activeBuffs = this.activeBuffs.filter(b => b !== buff);
        return this;
    }

    // Add a DOT to the character
    addDOT(dot: IDamageOverTimeBehaviour): this {
        this.activeDOTs.push(dot);
        return this;
    }

    // Remove a DOT from the character
    removeDOT(dot: IDamageOverTimeBehaviour): this {
        this.activeDOTs = this.activeDOTs.filter(d => d !== dot);
        return this;
    }

    // Deal damage to the character
    takeDamage<T extends Named>(
        damage: number,
        source: T | null,
        ignoreDefence: boolean = false
    ): this {
        const oldHitPoints = this.stats.hitPoints;
        this.stats = createStats({
            ...this.stats,
            hitPoints: ignoreDefence ? 
                Math.max(0, oldHitPoints - damage) :
                Math.max(0, oldHitPoints - Math.max(0, damage - this.stats.defence))
        });

        const damageTaken = oldHitPoints - this.stats.hitPoints;
        if (this.logCallback && source) {
            this.logCallback.battleLog(source, "damage", damageTaken, this.build());
        }
        return this;
    }

    // Heal the character
    restoreHealth<T extends Named>(amount: number, source: T | null): this {
        const oldHitPoints = this.stats.hitPoints;
        this.stats = createStats({
            ...this.stats,
            hitPoints: Math.min(this.stats.maxHitPoints, oldHitPoints + amount)
        });

        if (oldHitPoints === this.stats.hitPoints) {
            return this;
        }

        if (this.logCallback && source) {
            this.logCallback.battleLog(source, "heal", amount, this.build());
        }
        return this;
    }

    // Modify energy
    modifyEnergy<T extends Named>(
        amount: number,
        source: T | null,
        type: "spend" | "recover"
    ): this {
        const oldEnergy = this.stats.energy;
        this.stats = createStats({
            ...this.stats,
            energy: type === "spend" ?
                Math.max(0, oldEnergy - amount) :
                Math.min(this.stats.maxEnergy, oldEnergy + amount)
        });

        if (oldEnergy === this.stats.energy) {
            return this;
        }

        if (this.logCallback && source) {
            this.logCallback.battleLog(source, type === "spend" ? "spendEnergy" : "recoverEnergy", amount, this.build());
        }
        return this;
    }

    // Spend energy
    spendEnergy<T extends Named>(amount: number, source: T | null): this {
        return this.modifyEnergy(amount, source, "spend");
    }

    // Recover energy
    recoverEnergy<T extends Named>(amount: number, source: T | null): this {
        return this.modifyEnergy(amount, source, "recover");
    }

    // Add equipment to the character
    addEquipment(equipment: Equipment): this {
        this.equipment.push(equipment);
        return this;
    }

    // Remove equipment from the character
    removeEquipment(equipment: Equipment): this {
        this.equipment = this.equipment.filter(e => e !== equipment);
        return this;
    }

    // Add an action to the character
    addAction(action: Action): this {
        this.chosenActions.push(action);
        return this;
    }

    // Remove an action from the character
    removeAction(action: Action): this {
        this.chosenActions = this.chosenActions.filter(a => a !== action);
        return this;
    }

    // Add a class to the character
    addClass(characterClass: CharacterClass): this {
        this.classes.push(characterClass);
        return this;
    }

    // Remove a class from the character
    removeClass(characterClass: CharacterClass): this {
        this.classes = this.classes.filter(c => c !== characterClass);
        return this;
    }

    // Update stats
    updateStats(newStats: Partial<CharacterStats>): this {
        this.stats = createStats({ ...this.stats, ...newStats });
        return this;
    }

    // Apply out of battle stats
    applyOutOfBattleStats(): this {
        // Reset stats to base stats
        this.stats = createStats({ ...this.baseStats });

        // Apply equipment buffs
        if (this.equipment.length > 0) {
            const equipmentBuffs = this.equipment.reduce((total, item) => ({
                hitPoints: (total.hitPoints || 0) + (item.hitPointsBonus || 0),
                maxHitPoints: (total.maxHitPoints || 0) + (item.hitPointsBonus || 0),
                attack: (total.attack || 0) + (item.attackBonus || 0),
                defence: (total.defence || 0) + (item.defenseBonus || 0),
                shield: 0,
                energy: (total.energy || 0),
                maxEnergy: (total.maxEnergy || 0),
                energyRegen: (total.energyRegen || 0),
                hpRegen: (total.hpRegen || 0) + (item.hpRegenBonus || 0),
                speed: (total.speed || 0),
                actionCounter: (total.actionCounter || 0),
                chargesPerTurn: (total.chargesPerTurn || 0)
            }), {} as Partial<CharacterStats>);

            this.stats = createStats({
                ...this.stats,
                ...equipmentBuffs
            });
        }

        return this;
    }

    // Finalize and return the character
    build(): Character {
        return createCharacter({
            name: this.name,
            stats: this.stats,
            baseStats: this.baseStats,
            sprite: this.sprite,
            equipment: this.equipment,
            chosenActions: this.chosenActions,
            classes: this.classes,
            triggers: this.triggers,
            activeBuffs: this.activeBuffs,
            activeDOTs: this.activeDOTs,
            isCharging: this.isCharging,
            chargeTurns: this.chargeTurns,
            currentAction: this.currentAction,
            logCallback: this.logCallback
        });
    }

    setStats(stats: Partial<CharacterStats>): CharacterBuilder {
        this.stats = createStats({
            ...this.stats,
            ...stats
        });
        return this;
    }

    setLogCallback(callback: LogCallbacks): CharacterBuilder {
        this.logCallback = callback;
        return this;
    }
}