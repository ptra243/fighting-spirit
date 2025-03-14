import { Character, createCharacter } from "./Character";
import { CharacterStats, createStats } from "./CharacterStats";
import { CharacterEquipment } from "./CharacterEquipment";
import { Action } from "../Actions/Action";
import { CharacterClass } from "../Classes/CharacterClass";
import { TriggerManager } from "../Actions/Triggers/TriggerManager";
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
    private equipment: CharacterEquipment;
    private chosenActions: Action[];
    private classes: CharacterClass[];
    private triggerManager: TriggerManager;
    private activeBuffs: BuffBehaviour[];
    private activeDOTs: DamageOverTimeBehaviour[];
    private isCharging: boolean;
    private chargeTurns: number;
    private currentAction: number;
    private logCallback?: LogCallbacks;

    constructor(character: Character) {
        this.name = character.name;
        this.stats = character.stats;
        this.baseStats = character.baseStats;
        this.sprite = character.sprite;
        this.equipment = character.equipment;
        this.chosenActions = character.chosenActions;
        this.classes = character.classes;
        this.triggerManager = character.triggerManager;
        this.activeBuffs = character.activeBuffs.map(buff => {
            if (buff instanceof BuffBehaviour) {
                return buff;
            }
            return new BuffBehaviour(
                buff.name,
                buff.buffType as BuffStat,
                buff.amount,
                buff.duration,
                buff.isSelfBuff
            );
        });
        this.activeDOTs = character.activeDOTs.map(dot => {
            if (dot instanceof DamageOverTimeBehaviour) {
                return dot;
            }
            return new DamageOverTimeBehaviour(
                dot.name,
                dot.damagePerTurn,
                dot.duration
            );
        });
        this.isCharging = character.isCharging;
        this.chargeTurns = character.chargeTurns;
        this.currentAction = character.currentAction;
        this.logCallback = character.logCallback;
    }

    // Add a class to the character
    addClass(characterClass: CharacterClass): this {
        this.classes = [...this.classes, characterClass];
        return this;
    }

    // Add a trigger to the character
    addTrigger(trigger: ActionTrigger): this {
        this.triggerManager.addTrigger(trigger);
        return this;
    }

    // Level up a specific class
    levelUpClass(className: string): this {
        const classToLevel = this.classes.find(
            (c) => c.getName() === className
        );
        if (classToLevel) {
            const updatedCharacter = classToLevel.levelUp(this.build());
            // Update all properties from the updated character
            this.name = updatedCharacter.name;
            this.stats = updatedCharacter.stats;
            this.baseStats = updatedCharacter.baseStats;
            this.sprite = updatedCharacter.sprite;
            this.equipment = updatedCharacter.equipment;
            this.chosenActions = updatedCharacter.chosenActions;
            this.classes = updatedCharacter.classes;
            this.triggerManager = updatedCharacter.triggerManager;
            this.activeBuffs = updatedCharacter.activeBuffs.map(buff => {
                if (buff instanceof BuffBehaviour) {
                    return buff;
                }
                return new BuffBehaviour(
                    buff.name,
                    buff.buffType as BuffStat,
                    buff.amount,
                    buff.duration,
                    buff.isSelfBuff
                );
            });
            this.activeDOTs = updatedCharacter.activeDOTs.map(dot => {
                if (dot instanceof DamageOverTimeBehaviour) {
                    return dot;
                }
                return new DamageOverTimeBehaviour(
                    dot.name,
                    dot.damagePerTurn,
                    dot.duration
                );
            });
            this.isCharging = updatedCharacter.isCharging;
            this.chargeTurns = updatedCharacter.chargeTurns;
            this.currentAction = updatedCharacter.currentAction;
            this.logCallback = updatedCharacter.logCallback;
        }
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

    // Add a buff to the character
    addBuff(buff: BuffBehaviour): this {
        this.activeBuffs = [...this.activeBuffs, buff.clone({})];
        if (this.logCallback) {
            this.logCallback.messageLog(
                `${this.name} gained ${buff.name}`
            );
            this.logCallback.battleLog(
                this.build(),
                "buff",
                buff.amount,
                this.build()
            );
        }
        return this;
    }

    // Add a damage-over-time (DOT) effect
    addDOT(dot: DamageOverTimeBehaviour): this {
        this.activeDOTs = [...this.activeDOTs, dot.clone({})];
        if (this.logCallback) {
            this.logCallback.messageLog(
                `${dot.name} has been applied to ${this.name}.`
            );
        }
        return this;
    }

    // Apply start-of-turn effects
    applyStartOfTurnEffects(): this {
        // Apply class stats
        for (const characterClass of this.classes) {
            const classStats = characterClass.getCurrentStats();
            this.stats = createStats({
                ...this.stats,
                ...classStats
            });
        }

        // Apply equipment buffs
        const equipmentBuffs = this.equipment.getEquippedItems().flatMap(item => item.getBuffs());
        for (const buff of equipmentBuffs) {
            this.stats = createStats({
                ...this.stats,
                ...buff
            });
        }

        // Decrease effect durations and remove expired effects
        this.activeBuffs = this.activeBuffs.filter(buff => {
            buff.duration--;
            return buff.duration > 0;
        });

        this.activeDOTs = this.activeDOTs.filter(dot => {
            dot.duration--;
            return dot.duration > 0;
        });

        // Decay shield
        this.stats = createStats({
            ...this.stats,
            shield: Math.max(0, this.stats.shield - 1)
        });

        // Apply DOTs
        for (const dot of this.activeDOTs) {
            const damage = dot.damagePerTurn;
            this.stats = createStats({
                ...this.stats,
                hitPoints: Math.max(0, this.stats.hitPoints - damage)
            });
        }

        // Apply active buffs
        for (const buff of this.activeBuffs) {
            const buffStats = {
                [buff.buffType]: buff.amount
            };
            this.stats = createStats({
                ...this.stats,
                ...buffStats
            });
        }

        // Apply regen
        this.stats = createStats({
            ...this.stats,
            hitPoints: Math.min(this.stats.maxHitPoints, this.stats.hitPoints + this.stats.hpRegen),
            energy: Math.min(this.stats.maxEnergy, this.stats.energy + this.stats.energyRegen)
        });

        return this;
    }

    // Add equipment to the character
    addEquipment(equipment: CharacterEquipment): this {
        this.equipment = equipment;
        return this;
    }

    // Remove equipment by name
    removeEquipment(equipmentName: string): this {
        const equipment = this.equipment.getEquippedItems().find(
            (eq) => eq.name === equipmentName
        );

        if (!equipment) {
            this.logCallback?.messageLog(
                `${this.name} doesn't have ${equipmentName} equipped`
            );
            return this;
        }

        this.equipment = this.equipment.removeEquipment(equipmentName);
        return this;
    }

    // Get the character's equipment (doesn't modify the character)
    getEquipment(): Equipment[] {
        return this.equipment.getEquippedItems();
    }

    // Reset the character
    reset(): this {
        this.stats = createStats(this.baseStats);
        this.chosenActions = [];
        this.isCharging = false;
        this.chargeTurns = 0;
        this.currentAction = 0;
        return this;
    }

    // Heal to full HP
    healToFull(): this {
        this.stats = createStats({
            ...this.stats,
            hitPoints: this.stats.maxHitPoints
        });
        return this;
    }

    // Apply out-of-battle stats
    applyOutOfBattleStats(): this {
        // Apply class stats
        for (const characterClass of this.classes) {
            const classStats = characterClass.getCurrentStats();
            this.stats = createStats({
                ...this.stats,
                ...classStats
            });
        }

        // Set to full HP
        this.stats = createStats({
            ...this.stats,
            hitPoints: this.stats.maxHitPoints
        });

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
            triggerManager: this.triggerManager,
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

    addAction(action: Action): CharacterBuilder {
        this.chosenActions.push(action);
        return this;
    }

    setLogCallback(callback: LogCallbacks): CharacterBuilder {
        this.logCallback = callback;
        return this;
    }
}