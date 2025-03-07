// types/Character/CharacterStats.ts
export class CharacterStats {
    hitPoints: number;
    maxHitPoints: number;
    attack: number;
    defence: number;
    shield: number;
    energy: number;
    maxEnergy: number;
    chargesPerTurn: number;
    energyRegen: number;
    hpRegen: number;
    speed: number;
    actionCounter: number;

    constructor(stats: Partial<CharacterStats>) {
        this.maxHitPoints = stats.maxHitPoints ?? 0;
        this.hitPoints = stats.hitPoints ?? stats.maxHitPoints ?? 0;
        this.attack = stats.attack ?? 0;
        this.defence = stats.defence ?? 0;
        this.shield = stats.shield ?? 0;
        this.energy = stats.energy ?? 0;
        this.maxEnergy = stats.maxEnergy ?? 0;
        this.energyRegen = stats.energyRegen ?? 0;
        this.hpRegen = stats.hpRegen ?? 0;
        this.speed = stats.speed ?? 25;
        this.actionCounter = stats.actionCounter ?? 0;
        this.chargesPerTurn = stats.chargesPerTurn ?? 0;
    }
}


export const statsUtils = {
    takeDamage: (stats: CharacterStats, damage: number, ignoreDefence = false): CharacterStats => {
        let remainingDamage = ignoreDefence ? damage : Math.max(damage - stats.defence, 1);
        let newShield = stats.shield;
        let newHitPoints = stats.hitPoints;

        if (newShield > 0) {
            if (newShield >= remainingDamage) {
                newShield -= remainingDamage;
                remainingDamage = 0;
            } else {
                remainingDamage -= newShield;
                newShield = 0;
            }
        }
        newHitPoints = Math.max(newHitPoints - remainingDamage, 0);

        return {...stats, hitPoints: newHitPoints, shield: newShield};
    },

    restoreHealth: (stats: CharacterStats, amount: number): CharacterStats => ({
        ...stats,
        hitPoints: Math.min(stats.hitPoints + amount, stats.maxHitPoints)
    }),

    recoverEnergy: (stats: CharacterStats, amount: number): CharacterStats => ({
        ...stats,
        energy: Math.min(stats.energy + amount, stats.maxEnergy)
    }),

    spendEnergy: (stats: CharacterStats, amount: number): CharacterStats => ({
        ...stats,
        energy: Math.max(stats.energy - amount, 0)
    }),

    incrementActionCounter: (stats: CharacterStats): CharacterStats => ({
        ...stats,
        actionCounter: Math.min(100, stats.actionCounter + stats.speed)
    }),

    resetActionCounter: (stats: CharacterStats): CharacterStats => ({
        ...stats,
        actionCounter: 0
    }),

    add: (original:CharacterStats, other: CharacterStats): CharacterStats => (new CharacterStats({
        hitPoints: original.hitPoints + other.hitPoints,
        maxHitPoints: original.maxHitPoints + other.maxHitPoints,
        attack: original.attack + other.attack,
        defence: original.defence + other.defence,
        shield: original.shield + other.shield,
        energy: Math.min(original.maxEnergy, original.energy + other.energy),
        maxEnergy: original.maxEnergy + other.maxEnergy,
        energyRegen: original.energyRegen + other.energyRegen,
        hpRegen: original.hpRegen + other.hpRegen,
        speed: original.speed + other.speed,
        actionCounter: original.actionCounter // Don't add action counters
    }))

};
