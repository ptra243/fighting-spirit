// src/types/Classes/KnightClass.ts
import { CharacterClass, ClassStats } from "./CharacterClass";

const KNIGHT_STATS_PER_LEVEL: ClassStats = {
    hitPoints: 10,
    attack: 5,
    defence: 5,
    hpRegen: 1,
    energyRegen: 0,
    energy: 0
};

export class KnightClass extends CharacterClass {
    constructor() {
        super("Knight", KNIGHT_STATS_PER_LEVEL);
    }
}