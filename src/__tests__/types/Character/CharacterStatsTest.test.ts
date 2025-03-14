import {CharacterStats, createStats} from "../../../types/Character/CharacterStats";
import {Character} from "../../../types/Character/Character";
import {statsUtils} from "../../../types/Character/CharacterStats";

describe('CharacterStats', () => {
    let baseCharacter: Character;

    beforeEach(() => {
        baseCharacter = new Character({
            name: "Hero",
            stats: new CharacterStats({
                hitPoints: 100,
                maxHitPoints: 100,
                attack: 10,
                defence: 5,
                shield: 20,
                energy: 5,
                maxEnergy: 10,
                energyRegen: 2,
                hpRegen: 1
            })
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

            // Ensure any manual updates won't mutate the original object
            const updatedStats = new CharacterStats({...originalStats, attack: 15});
            expect(updatedStats.attack).toBe(15);
            expect(originalStats.attack).toBe(10);
        });
    });

    describe('Damage Handling', () => {
        it('should apply minimum 1 damage when defense exceeds damage', () => {
            const updatedStats = statsUtils.takeDamage(baseCharacter.stats, 4);
            const character = new Character({...baseCharacter, stats: updatedStats});
            expect(character.stats.shield).toBe(19); // Should still take 1 damage to shield.
        });

        it('should handle shield damage correctly', () => {
            const updatedStats = statsUtils.takeDamage(baseCharacter.stats, 15);
            const character = new Character({...baseCharacter, stats: updatedStats});
            expect(character.stats.shield).toBe(10); // Shield absorbs partial damage.
            expect(character.stats.hitPoints).toBe(100); // HP remains unchanged.
        });

        it('should handle damage exceeding shield', () => {
            const updatedStats = statsUtils.takeDamage(baseCharacter.stats, 30);
            const character = new Character({...baseCharacter, stats: updatedStats});
            expect(character.stats.shield).toBe(0);
            expect(character.stats.hitPoints).toBe(95); // Damage after defense and shield reduction.
        });

        it('should not allow negative HP', () => {
            const updatedStats = statsUtils.takeDamage(baseCharacter.stats, 1000);
            const character = new Character({...baseCharacter, stats: updatedStats});
            expect(character.stats.hitPoints).toBe(0); // HP should not drop below 0.
        });
    });

    describe('Health and Energy Management', () => {
        it('should restore health within maxHitPoints limit', () => {
            const damagedStats = statsUtils.takeDamage(baseCharacter.stats, 75); // -20 shield, -50 HP.
            const restoredStats = statsUtils.restoreHealth(damagedStats, 30);
            const healedCharacter = new Character({...baseCharacter, stats: restoredStats});
            expect(healedCharacter.stats.hitPoints).toBe(80);
        });

        it('should not exceed maxHitPoints when healing', () => {
            const restoredStats = statsUtils.restoreHealth(baseCharacter.stats, 50);
            const healedCharacter = new Character({...baseCharacter, stats: restoredStats});
            expect(healedCharacter.stats.hitPoints).toBe(100);
        });

        it('should handle energy recovery within limits', () => {
            const recoveredStats = statsUtils.recoverEnergy(baseCharacter.stats, 3);
            const character = new Character({...baseCharacter, stats: recoveredStats});
            expect(character.stats.energy).toBe(8);
        });

        it('should not exceed maxEnergy when recovering', () => {
            const recoveredStats = statsUtils.recoverEnergy(baseCharacter.stats, 100);
            const character = new Character({...baseCharacter, stats: recoveredStats});
            expect(character.stats.energy).toBe(10);
        });

        it('should handle energy spending correctly', () => {
            const spentStats = statsUtils.spendEnergy(baseCharacter.stats, 3);
            const character = new Character({...baseCharacter, stats: spentStats});
            expect(character.stats.energy).toBe(2);
        });
    });

    describe('Cloning and Modifications', () => {
        it('should create a new character with identical stats when cloning', () => {
            const clone = new Character({
                name: baseCharacter.name,
                stats: baseCharacter.stats
            });
            expect(clone).not.toBe(baseCharacter);
            expect(clone.stats).toEqual(baseCharacter.stats);
        });

        it('should apply overrides when cloning', () => {
            const modifiedStats = new CharacterStats({
                ...baseCharacter.stats,
                attack: 15,
                defence: 8
            });
            const modifiedCharacter = new Character({
                ...baseCharacter,
                stats: modifiedStats
            });
            expect(modifiedCharacter.stats.attack).toBe(15);
            expect(modifiedCharacter.stats.defence).toBe(8);
            expect(modifiedCharacter.stats.hitPoints).toBe(baseCharacter.stats.hitPoints); // Other stats unchanged.
        });
    });

    test('should create character stats with default values', () => {
        const stats = createStats({});
        expect(stats.hitPoints).toBe(0);
        expect(stats.maxHitPoints).toBe(0);
        expect(stats.shield).toBe(0);
        expect(stats.attack).toBe(0);
        expect(stats.defence).toBe(0);
        expect(stats.energy).toBe(0);
        expect(stats.maxEnergy).toBe(0);
        expect(stats.energyRegen).toBe(0);
        expect(stats.hpRegen).toBe(0);
    });

    test('should create character stats with provided values', () => {
        const stats = createStats({
            hitPoints: 100,
            maxHitPoints: 100,
            shield: 0,
            attack: 10,
            defence: 5,
            energy: 100,
            maxEnergy: 100,
            energyRegen: 10,
            hpRegen: 0
        });

        expect(stats.hitPoints).toBe(100);
        expect(stats.maxHitPoints).toBe(100);
        expect(stats.shield).toBe(0);
        expect(stats.attack).toBe(10);
        expect(stats.defence).toBe(5);
        expect(stats.energy).toBe(100);
        expect(stats.maxEnergy).toBe(100);
        expect(stats.energyRegen).toBe(10);
        expect(stats.hpRegen).toBe(0);
    });

    test('should update stats correctly', () => {
        const originalStats = createStats({
            hitPoints: 100,
            maxHitPoints: 100,
            shield: 0,
            attack: 10,
            defence: 5,
            energy: 100,
            maxEnergy: 100,
            energyRegen: 10,
            hpRegen: 0
        });

        const updatedStats = createStats({
            ...originalStats,
            attack: 15
        });

        expect(updatedStats.attack).toBe(15);
        expect(updatedStats.defence).toBe(5); // Other stats remain unchanged
    });

    test('should validate stats correctly', () => {
        const validStats = createStats({
            hitPoints: 100,
            maxHitPoints: 100,
            shield: 0,
            attack: 10,
            defence: 5,
            energy: 100,
            maxEnergy: 100,
            energyRegen: 10,
            hpRegen: 0
        });

        expect(() => {
            // This should not throw
            createStats(validStats);
        }).not.toThrow();

        expect(() => {
            // This should throw due to negative hitPoints
            createStats({
                ...validStats,
                hitPoints: -1
            });
        }).toThrow();

        expect(() => {
            // This should throw due to hitPoints > maxHitPoints
            createStats({
                ...validStats,
                hitPoints: 150,
                maxHitPoints: 100
            });
        }).toThrow();

        expect(() => {
            // This should throw due to negative shield
            createStats({
                ...validStats,
                shield: -1
            });
        }).toThrow();

        expect(() => {
            // This should throw due to negative attack
            createStats({
                ...validStats,
                attack: -1
            });
        }).toThrow();

        expect(() => {
            // This should throw due to negative defence
            createStats({
                ...validStats,
                defence: -1
            });
        }).toThrow();

        expect(() => {
            // This should throw due to energy > maxEnergy
            createStats({
                ...validStats,
                energy: 150,
                maxEnergy: 100
            });
        }).toThrow();
    });
});