// src/types/Classes/CharacterClass.ts
import { CharacterStats } from "../Character/CharacterStats";
import {Character} from "../Character/Character";

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
    protected readonly statsPerLevel: CharacterStats;
    description: string;

    protected constructor(name: string, statsPerLevel: CharacterStats) {
        this.name = name;
        this.statsPerLevel = statsPerLevel;
    }

    public getName(): string {
        return this.name;
    }

    public getLevel(): number {
        return this.level;
    }

    public levelUp(character:Character): Character {
        this.level++;
        return character;
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