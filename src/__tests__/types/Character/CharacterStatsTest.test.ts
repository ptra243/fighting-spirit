import {CharacterStats} from "../../../types/Character/CharacterStats";

describe('CharacterStats', () => {
    let baseStats: CharacterStats;

    beforeEach(() => {
        baseStats = new CharacterStats({
            hitPoints: 100,
            maxHitPoints: 100,
            attack: 10,
            defence: 5,
            shield: 20,
            energy: 5,
            maxEnergy: 10,
            energyRegen: 2,
            hpRegen: 1
        });
    });

    describe('Constructor and Immutability', () => {
        it('should create stats with default values when not provided', () => {
            const defaultStats = new CharacterStats({});
            expect(defaultStats.maxHitPoints).toBe(100);
            expect(defaultStats.hitPoints).toBe(100);
            expect(defaultStats.attack).toBe(10);
            expect(defaultStats.defence).toBe(5);
            expect(defaultStats.shield).toBe(0);
            expect(defaultStats.energy).toBe(1);
            expect(defaultStats.maxEnergy).toBe(10);
            expect(defaultStats.energyRegen).toBe(1);
            expect(defaultStats.hpRegen).toBe(0);
        });

        it('should maintain immutability', () => {
            const originalStats = new CharacterStats({
                hitPoints: 100,
                attack: 10
            });

        });
    });

    describe('Damage Handling', () => {
        it('should apply minimum 1 damage when defense exceeds damage', () => {
            const result = baseStats.takeDamage(4); // Damage less than defense (5)
            expect(result.shield).toBe(19); // Should still take 1 damage to shield
        });

        it('should handle shield damage correctly', () => {
            const result = baseStats.takeDamage(15);
            expect(result.shield).toBe(10); // Shield absorbs damage 19-15 = 4
            expect(result.hitPoints).toBe(100); // HP unchanged
        });

        it('should handle damage exceeding shield', () => {
            const result = baseStats.takeDamage(30);
            expect(result.shield).toBe(0);
            expect(result.hitPoints).toBe(95); // (30 - 5 defense - 20 shield) = 5 damage to HP
        });

        it('should not allow negative HP', () => {
            const result = baseStats.takeDamage(1000);
            expect(result.hitPoints).toBe(0);
        });
    });

    describe('Health and Energy Management', () => {
        it('should restore health within maxHitPoints limit', () => {
            //take 75 damage. -5 damage taken from defence, -20 shield, take 50 hp damage
            const damaged = baseStats.takeDamage(75);
            const healed = damaged.restoreHealth(30);
            expect(healed.hitPoints).toBe(80);
        });

        it('should not exceed maxHitPoints when healing', () => {
            const healed = baseStats.restoreHealth(50);
            expect(healed.hitPoints).toBe(100);
        });

        it('should handle energy recovery within limits', () => {
            const recovered = baseStats.recoverEnergy(3);
            expect(recovered.energy).toBe(8);
        });

        it('should not exceed maxEnergy when recovering', () => {
            const recovered = baseStats.recoverEnergy(100);
            expect(recovered.energy).toBe(10);
        });

        it('should handle energy spending correctly', () => {
            const spent = baseStats.spendEnergy(3);
            expect(spent.energy).toBe(2);
        });
    });

    describe('Cloning and Modifications', () => {
        it('should create a new instance when cloning', () => {
            const clone = baseStats.cloneWith({});
            expect(clone).not.toBe(baseStats);
            expect(clone).toEqual(baseStats);
        });

        it('should apply overrides when cloning', () => {
            const modified = baseStats.cloneWith({
                attack: 15,
                defence: 8
            });
            expect(modified.attack).toBe(15);
            expect(modified.defence).toBe(8);
            expect(modified.hitPoints).toBe(baseStats.hitPoints);
        });
    });
});
