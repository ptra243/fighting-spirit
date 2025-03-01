import {CharacterStats} from './CharacterStats';
import {BuffBehaviour, BuffStat} from "../Actions/Behaviours/BuffBehaviour";
import {DamageOverTimeBehaviour} from "../Actions/Behaviours/DamageOverTimeBehaviour";
import {Action, IActionBehaviour} from "../Actions/Action";
import _, {initial} from "lodash";
import {createAction} from "../Actions/BehaviorFactories";
import {BaseEquipment} from "../Equipment/EquipmentClassHierarchy";
import {CharacterEquipment} from "./CharacterEquipment";
import {StatBuilder} from "./CharacterStatBuilder";
import {LogCallbacks, Named} from "../../BattleManager";


export class Character {
    readonly name: string;
    readonly stats: CharacterStats;
    readonly baseStats: CharacterStats;
    readonly sprite: string;
    readonly isCharging: boolean;
    readonly chargeTurns: number;
    //actions
    readonly actions: Action[];
    chosenActions: Action[];
    readonly currentAction: number;

    readonly equipment: CharacterEquipment;


    //buffs and dots
    readonly activeBuffs: BuffBehaviour[]; // Holds active buffs
    readonly activeDOTs: DamageOverTimeBehaviour[]; // Holds active damage-over-time effects


    readonly logCallback?: LogCallbacks; // Optional logging function


    constructor(initialCharacter: Partial<Character>
    ) {
        if (!initialCharacter.name) {
            throw new Error("The 'name' property is required.");
        }
        if (!initialCharacter.stats) {
            throw new Error("The 'stats' property is required.");
        }
        if (!initialCharacter.actions) {
            throw new Error("The 'actions' property is required.");
        }
        this.name = initialCharacter.name;
        this.stats = initialCharacter.stats;
        this.baseStats = initialCharacter.baseStats || initialCharacter.stats.cloneWith({});
        this.sprite = initialCharacter.sprite || '';
        this.isCharging = initialCharacter.isCharging || false;
        this.logCallback = initialCharacter?.logCallback; // Inject logging callback
        this.chargeTurns = initialCharacter.chargeTurns || 0;
        this.equipment = initialCharacter.equipment || new CharacterEquipment({
            logCallback: initialCharacter.logCallback
        });

        this.activeBuffs = initialCharacter.activeBuffs || [];
        this.activeDOTs = initialCharacter.activeDOTs || [];
        this.actions = initialCharacter.actions;
        this.chosenActions = initialCharacter.chosenActions || [];
        this.currentAction = initialCharacter.currentAction || 0;

    }

    // Set or replace the logger
    setLogCallback(logCallback: LogCallbacks): Character {
        return new Character({...this, logCallback: logCallback});
    }

    takeDamage<T extends Named>(damage: number, source: T | null): Character {
        const builder = new StatBuilder(this);
        const result = builder
            .takeDamage(damage)
            .build();

        const newCharacter = this.cloneWith({stats: result.stats});
        const damageTaken = this.stats.hitPoints - result.stats.hitPoints;

        if (this.logCallback && source) {
            this.logCallback.battleLog(source, 'damage', damageTaken, this);
        }
        return newCharacter;
    }

    restoreHealth<T extends Named>(amount: number, source: T | null): Character {
        const builder = new StatBuilder(this);
        const result = builder
            .restoreHealth(amount)
            .build();

        if (this.stats.hitPoints === result.stats.hitPoints) {
            return this;
        }

        const newCharacter = this.cloneWith({stats: result.stats});
        if (this.logCallback && source) {
            this.logCallback.battleLog(source, 'heal', amount, this);
        }
        return newCharacter;
    }

    modifyEnergy<T extends Named>(amount: number, source: T | null, type: 'spend' | 'recover'): Character {
        const builder = new StatBuilder(this);
        const result = builder
            .modifyEnergy(amount * (type === 'spend' ? -1 : 1))
            .build();

        if (this.stats.energy === result.stats.energy) {
            return this;
        }

        const newCharacter = this.cloneWith({stats: result.stats});

        // if (this.logCallback && source) {
        //     if (type === 'spend' && result.stats.energy < 0) {
        //         this.logCallback.messageLog(`${this.name} does not have enough energy to use ${source.name}`);
        //     } else {
        //         this.logCallback.battleLog(source, type === 'spend' ? 'energy-spent' : 'energy-gained', Math.abs(this.stats.energy - result.stats.energy), this);
        //     }
        // }

        return newCharacter;
    }

// Simplified methods that use modifyEnergy
    spendEnergy<T extends Named>(amount: number, source: T | null): Character {
        return this.modifyEnergy(amount, source, 'spend');
    }

    recoverEnergy<T extends Named>(amount: number, source: T | null): Character {
        return this.modifyEnergy(amount, source, 'recover');
    }


    cloneWith(updates: Partial<Character>): Character {
        // Use Lodash to deep clone and merge updates into the character
        const cloned = _.cloneDeep({...this, ...updates});
        return new Character(cloned);
    }

    addBuff(buff: BuffBehaviour) {
        this.activeBuffs.push(buff.clone({}));
        this.logCallback.battleLog(this, 'buff', buff.amount, this);
        this.logCallback.messageLog(`${this.name} gained ${buff.name}`);
    }

    addDOT(dot: DamageOverTimeBehaviour) {
        this.activeDOTs.push(dot.clone({}));
        this.logCallback?.messageLog(`${dot.name} has been applied to ${this.name}.`);
    }


    applyStartOfTurnEffects(): Character {
        // Apply DOTs and get the updated character
        const builder = new StatBuilder(this);
        const {stats: updatedStats, dots: updatedDOTS, buffs: updatedBuffs} = builder
            .decreaseEffectDurations()
            .decayShield()
            .applyDOTs()
            .applyEquipmentBuffs()
            .applyActiveBuffs()
            .applyRegen()
            .build();

        // Use the character's current stats (which include regeneration) for the final clone
        return this.cloneWith({
            stats: updatedStats,
            activeBuffs: updatedBuffs,
            activeDOTs: updatedDOTS
        });
    }

    addEquipment(newEquipment: BaseEquipment): Character {
        // Find if there's existing equipment of the same type
        const currentEquipment = this.equipment.addEquipment(newEquipment);
        // Return new character instance with updated equipment and stats
        let stats = this.stats
        if (newEquipment.boostHitPoints > 0) {
            stats = new CharacterStats({...stats, hitPoints: stats.hitPoints + newEquipment.boostHitPoints});

        }
        return new Character({
            ...this,
            stats: stats,
            equipment: currentEquipment
        });
    }


    removeEquipment(equipmentName: string): Character {
        const equipment = this.equipment.getEquippedItems()
            .find(eq => eq.name === equipmentName);

        if (!equipment) {
            this.logCallback?.messageLog(`${this.name} doesn't have ${equipmentName} equipped`);
            return this;
        }

        const newEquipmentState = this.equipment.removeEquipment(equipmentName);
        const characterWithRemovedEquipment = new Character({...this, equipment: newEquipmentState});
        const builder = new StatBuilder(characterWithRemovedEquipment);

        const {stats: updatedStats} = builder
            .applyEquipmentBuffs()
            .build();

        return characterWithRemovedEquipment.cloneWith({
            stats: updatedStats
        });
    }


    getEquipment() {
        console.log(this.equipment);
        return this.equipment.getEquippedItems();

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
        actions: actions,
        chosenActions: actions
    });
}