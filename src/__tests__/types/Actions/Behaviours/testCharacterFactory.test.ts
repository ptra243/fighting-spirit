// testHelpers.ts


import { Character, createCharacter } from "../../../../types/Character/Character";
import { CharacterStats, createStats } from "../../../../types/Character/CharacterStats";
import { CharacterEquipment } from "../../../../types/Character/CharacterEquipment";
import {Named} from "../../../../BattleManager";

interface StatOverrides {
    hitPoints?: number;
    maxHitPoints?: number;
    shield?: number;
    attack?: number;
    defence?: number;
    energy?: number;
    maxEnergy?: number;
    energyRegen?: number;
    hpRegen?: number;
}

export function createTestCharacter(nameOrStats: string | StatOverrides = "Test Character", stats?: StatOverrides): Character {
    let name: string;
    let statOverrides: StatOverrides;

    if (typeof nameOrStats === 'string') {
        name = nameOrStats;
        statOverrides = stats || {};
    } else {
        name = "Test Character";
        statOverrides = nameOrStats;
    }

    const baseStats = createStats({
        hitPoints: 100,
        maxHitPoints: 100,
        shield: 0,
        attack: 10,
        defence: 5,
        energy: 100,
        maxEnergy: 100,
        energyRegen: 10,
        hpRegen: 0,
        ...statOverrides
    });

    return createCharacter({
        name,
        stats: baseStats,
        equipment: new CharacterEquipment()
    });
}

// Add actual tests for the factory function
describe('Test Character Factory', () => {
    it('should create a character with default stats', () => {
        const character = createTestCharacter();

        expect(character.name).toBe("Test Character");
        expect(character.stats.hitPoints).toBe(100);
        expect(character.stats.maxHitPoints).toBe(100);
        expect(character.stats.energy).toBe(100);
        expect(character.stats.maxEnergy).toBe(100);
        expect(character.stats.attack).toBe(10);
        expect(character.stats.defence).toBe(5);
        expect(character.stats.shield).toBe(0);
    });

    it('should create a character with overridden stats', () => {
        const character = createTestCharacter({
            hitPoints: 50,
            attack: 10,
            defence: 8
        });

        expect(character.stats.hitPoints).toBe(50);
        expect(character.stats.attack).toBe(10);
        expect(character.stats.defence).toBe(8);
        // Other stats should remain default
        expect(character.stats.maxHitPoints).toBe(100);
        expect(character.stats.energy).toBe(100);
    });

    it('should create a character with empty activeBuffs and activeDOTs', () => {
        const character = createTestCharacter();

        expect(character.activeBuffs).toEqual([]);
        expect(character.activeDOTs).toEqual([]);
    });

    it('should create a character that is not charging', () => {
        const character = createTestCharacter();

        expect(character.isCharging).toBe(false);
        expect(character.chargeTurns).toBe(0);
    });

    it('should create character with custom name', () => {
        const character = createTestCharacter("Custom Name");
        expect(character.name).toBe("Custom Name");
    });

    it('should create character with custom name and overridden stats', () => {
        const character = createTestCharacter("Custom Name", {
            hitPoints: 50,
            attack: 15,
            defence: 8
        });

        expect(character.name).toBe("Custom Name");
        expect(character.stats.hitPoints).toBe(50);
        expect(character.stats.attack).toBe(15);
        expect(character.stats.defence).toBe(8);
    });
});