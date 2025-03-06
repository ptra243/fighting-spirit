// src/types/Classes/CharacterClass.ts
import {CharacterStats} from "../Character/CharacterStats";
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

    protected constructor(name: string, statsPerLevel: CharacterStats, level: number) {
        this.name = name;
        this.statsPerLevel = statsPerLevel;
        this.level = level || 0;
    }

    public getName(): string {
        return this.name;
    }

    public getLevel(): number {
        return this.level;
    }

    public levelUp(character: Character): Character {
        console.log('base class level up')
        this.level++;
        return character;
    }

    public getStatsForLevel(level: number): CharacterStats {
        const levelMultiplier = (level * (level + 1)) / 2;

        return new CharacterStats({
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
        return this.getStatsForLevel(this.level);
    }
}