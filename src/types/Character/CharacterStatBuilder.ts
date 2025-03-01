﻿import { CharacterStats } from "./CharacterStats";
import { Character } from "./Character";
import { BuffStat, BuffBehaviour } from "../Actions/Behaviours/BuffBehaviour";
import { DamageOverTimeBehaviour } from "../Actions/Behaviours/DamageOverTimeBehaviour";

interface BuildResult {
    stats: CharacterStats;
    buffs: BuffBehaviour[];
    dots: DamageOverTimeBehaviour[];
}

export class StatBuilder {
    private currentStats: CharacterStats;
    private readonly character: Character;
    private currentBuffs: BuffBehaviour[];
    private currentDots: DamageOverTimeBehaviour[];

    constructor(character: Character) {
        this.character = character;
        // Start with base stats
        this.currentStats = character.baseStats.cloneWith({
            // But override with current values for these specific stats
            hitPoints: character.stats.hitPoints,
            shield: character.stats.shield,
            energy: character.stats.energy
        });
        this.currentBuffs = [...character.activeBuffs];
        this.currentDots = [...character.activeDOTs];

    }


    applyEquipmentBuffs(): StatBuilder {
        const equipmentBonuses = this.character.equipment.calculateTotalStats();
        this.currentStats = this.currentStats.cloneWith({
            attack: this.currentStats.attack + equipmentBonuses.attack,
            defence: this.currentStats.defence + equipmentBonuses.defence,
            maxHitPoints: this.currentStats.maxHitPoints + equipmentBonuses.hitPoints
        });

        this.currentBuffs = [
            ...this.currentBuffs,
            ...this.character.equipment.getEquippedItems().flatMap(equip =>
                equip.buffs.map(buff => new BuffBehaviour(buff.name, buff.buffType, buff.amount, 1, buff.isSelfBuff))
            )
        ];

        return this;
    }

    decreaseEffectDurations(): StatBuilder {
        this.currentBuffs = this.currentBuffs
            .map(buff => buff.clone({ duration: buff.duration - 1 }))
            .filter(buff => buff.duration > 0);

        this.currentDots = this.currentDots
            .map(dot => dot.clone({ duration: dot.duration - 1 }))
            .filter(dot => dot.duration > 0);

        return this;
    }

    applyActiveBuffs(): StatBuilder {
        const applyBuffs = (stat: number, buffType: BuffStat): number =>
            stat +
            this.currentBuffs
                .filter(buff => buff.buffType === buffType)
                .reduce((sum, buff) => sum + buff.amount, 0);

        this.currentStats = this.currentStats.cloneWith({
            attack: applyBuffs(this.currentStats.attack, BuffStat.Attack),
            defence: applyBuffs(this.currentStats.defence, BuffStat.Defense),
            shield: applyBuffs(this.currentStats.shield, BuffStat.Shield),  // Removed the /2
            energyRegen: applyBuffs(this.currentStats.energyRegen, BuffStat.EnergyRegen),
            hpRegen: applyBuffs(this.currentStats.hpRegen, BuffStat.hpRegen),
        });
        return this;
    }


    applyDOTs(): StatBuilder {
        if (this.currentDots.length === 0) {
            return this;
        }

        this.currentStats = this.currentDots.reduce((stats, dot) => {
            return stats.takeDamage(dot.damagePerTurn, true);
        }, this.currentStats);


        return this;
    }

    applyRegen(): StatBuilder {
        this.currentStats = this.currentStats.cloneWith({
            hitPoints: Math.min(
                this.currentStats.maxHitPoints,
                this.character.stats.hitPoints + this.currentStats.hpRegen
            ),
            energy: Math.min(
                this.currentStats.maxEnergy,
                this.character.stats.energy + this.currentStats.energyRegen
            )
        });
        return this;
    }

    takeDamage(damage: number, ignoreDefense: boolean = false): StatBuilder {

        this.currentStats = this.currentStats.takeDamage(damage, ignoreDefense);
        return this;
    }

    restoreHealth(amount: number): StatBuilder {
        this.currentStats = this.currentStats.cloneWith({
            hitPoints: Math.min(
                this.currentStats.maxHitPoints,
                this.currentStats.hitPoints + amount
            )
        });
        return this;
    }

    modifyEnergy(amount: number): StatBuilder {
        this.currentStats = this.currentStats.cloneWith({
            energy: Math.min(
                this.currentStats.maxEnergy,
                Math.max(0, this.currentStats.energy + amount)
            )
        });
        return this;
    }

    build(): BuildResult {
        return {
            stats: new CharacterStats({...this.currentStats}),
            buffs: this.currentBuffs,
            dots: this.currentDots
        };
    }

    decayShield(): StatBuilder {
        this.currentStats = this.currentStats.cloneWith({
            shield: Math.floor(this.currentStats.shield / 2)
        });
        return this;
    }

}