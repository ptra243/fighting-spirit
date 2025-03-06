export class CharacterStats {
    readonly hitPoints: number;
    readonly maxHitPoints: number;
    readonly attack: number;
    readonly defence: number;
    readonly shield: number;
    readonly energy: number;
    readonly maxEnergy: number;
    readonly chargesPerTurn: number;
    readonly energyRegen: number
    readonly hpRegen: number;
    readonly speed: number;        // Base speed of the character
    readonly actionCounter: number; // Current progress towards next action (0-100)


    constructor(stats: Partial<CharacterStats>) {
        this.maxHitPoints = stats.maxHitPoints ?? 0; // Default value as fallback
        this.hitPoints = stats.hitPoints ?? this.maxHitPoints;
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

    // Immutable method for taking damage
    takeDamage(damage: number, ignoreDefence: boolean = false): CharacterStats {

        let remainingDamage = ignoreDefence ? damage : Math.max(damage - this.defence, 1);
        let newShield = this.shield;
        let newHitPoints = this.hitPoints;

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

        return new CharacterStats({
            ...this,
            hitPoints: newHitPoints,
            shield: newShield,
        });
    }

    // Restore hit points (for healing or reset)
    restoreHealth(amount: number): CharacterStats {
        const newHitPoints = Math.min(this.hitPoints + amount, this.maxHitPoints);

        return new CharacterStats({
            ...this,
            hitPoints: newHitPoints,
        });
    }

    // Recover energy
    recoverEnergy(amount: number): CharacterStats {
        const newEnergy = Math.min(this.energy + amount, this.maxEnergy);

        return new CharacterStats({
            ...this,
            energy: newEnergy,
        });
    }

    spendEnergy(amount: number): CharacterStats {
        const newEnergy = Math.min(this.energy - amount, this.maxEnergy);

        return new CharacterStats({
            ...this,
            energy: newEnergy,
        });
    }

    cloneWith(overrides: Partial<CharacterStats>): CharacterStats {
        return new CharacterStats({
            ...this,        // Spread the current stats
            ...overrides,   // Spread the overrides to apply updates selectively
        });
    }

    incrementActionCounter(): CharacterStats {

        const newCounter = Math.min(100, this.actionCounter + this.speed);
        return new CharacterStats({
            ...this,
            actionCounter: newCounter
        });
    }

    resetActionCounter(): CharacterStats {
        return new CharacterStats({
            ...this,
            actionCounter: 0
        });
    }


    public add(other: CharacterStats): CharacterStats {
        return new CharacterStats({
            hitPoints: this.hitPoints + other.hitPoints,
            maxHitPoints: this.maxHitPoints + other.maxHitPoints,
            attack: this.attack + other.attack,
            defence: this.defence + other.defence,
            shield: this.shield + other.shield,
            energy: Math.min(this.maxEnergy, this.energy + other.energy),
            maxEnergy: this.maxEnergy + other.maxEnergy,
            energyRegen: this.energyRegen + other.energyRegen,
            hpRegen: this.hpRegen + other.hpRegen,
            speed: this.speed + other.speed,
            actionCounter: this.actionCounter // Don't add action counters
        });
    }


}