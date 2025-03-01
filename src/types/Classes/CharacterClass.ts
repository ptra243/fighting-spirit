﻿// src/types/Classes/CharacterClass.ts
import { CharacterStats } from "../Character/CharacterStats";

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
    protected level: number = 1;
    protected readonly statsPerLevel: ClassStats;

    protected constructor(name: string, statsPerLevel: ClassStats) {
        this.name = name;
        this.statsPerLevel = statsPerLevel;
    }

    public getName(): string {
        return this.name;
    }

    public getLevel(): number {
        return this.level;
    }

    public levelUp(): void {
        this.level++;
    }

    public getStatsForLevel(level: number): CharacterStats {
        return new CharacterStats({
            hitPoints: this.statsPerLevel.hitPoints * level,
            maxHitPoints: this.statsPerLevel.hitPoints * level,
            attack: this.statsPerLevel.attack * level,
            defence: this.statsPerLevel.defence * level,
            hpRegen: this.statsPerLevel.hpRegen * level,
            energyRegen: (this.statsPerLevel.energyRegen || 0) * level,
            energy: this.statsPerLevel.energy || 0
        });
    }

    public getCurrentStats(): CharacterStats {
        return this.getStatsForLevel(this.level);
    }
}