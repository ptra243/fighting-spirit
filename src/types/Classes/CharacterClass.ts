// src/types/Classes/CharacterClass.ts
import { Character } from "../Character/Character";
import { CharacterStats, createStats } from "../Character/CharacterStats";
import { ActionTrigger, BuffContext, TriggerCondition, TriggerEffect } from "../Actions/Triggers/Trigger";
import { createAttack } from "../Actions/BehaviorFactories";

export interface ClassStats {
    hitPoints: number;
    attack: number;
    defence: number;
    hpRegen: number;
    energyRegen?: number;
    energy?: number;
}

export abstract class CharacterClass {
    protected readonly name: string;
    protected readonly statsPerLevel: CharacterStats;
    protected level: number = 1;
    description: string;

    protected constructor(name: string, statsPerLevel: CharacterStats, level: number) {
        this.name = name;
        this.statsPerLevel = statsPerLevel;
        this.level = level;
    }

    public getName(): string {
        return this.name;
    }

    public getLevel(): number {
        return this.level;
    }

    public levelUp (character: Character): Character {
        this.level++;
        return character;
    }

    public getStatsForLevel(level: number): CharacterStats {
        const levelMultiplier = (level * (level + 1)) / 2;

        return createStats({
            hitPoints: this.statsPerLevel.hitPoints * levelMultiplier,
            maxHitPoints: this.statsPerLevel.hitPoints * levelMultiplier,
            attack: this.statsPerLevel.attack * levelMultiplier,
            defence: this.statsPerLevel.defence * levelMultiplier,
            hpRegen: this.statsPerLevel.hpRegen * levelMultiplier,
            energyRegen: (this.statsPerLevel.energyRegen || 0) * levelMultiplier,
            energy: (this.statsPerLevel.energy || 0) * levelMultiplier
        });
    }

    public getCurrentStats(): CharacterStats {
        return createStats({
            hitPoints: this.statsPerLevel.hitPoints * this.level,
            maxHitPoints: this.statsPerLevel.maxHitPoints * this.level,
            shield: this.statsPerLevel.shield * this.level,
            attack: this.statsPerLevel.attack * this.level,
            defence: this.statsPerLevel.defence * this.level,
            energy: this.statsPerLevel.energy * this.level,
            maxEnergy: this.statsPerLevel.maxEnergy * this.level,
            energyRegen: this.statsPerLevel.energyRegen * this.level,
            hpRegen: this.statsPerLevel.hpRegen * this.level
        });
    }
}