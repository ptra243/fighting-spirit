// testHelpers.ts


import {Character} from "../../../../types/Character/Character";
import {CharacterStats} from "../../../../types/Character/CharacterStats";
import {Named} from "../../../../BattleManager";

export function createTestCharacter(statoverrides = {}, other = {}) {
    const mockLogCallbacks = {
        battleLog: <T extends Named>(source: T, type: string, value: number, target: Character) => {
            console.log(`[BATTLE] ${source.name} ${type} ${value} -> ${target.name}`);
        },
        messageLog: (message: string) => {
            console.log(`[MESSAGE] ${message}`);
        }
    };
    if ('chargesPerTurn' in statoverrides) {
        console.log('Charges per turn:', statoverrides.chargesPerTurn);
    }

    return new Character({
        name: "Test Character",
        stats: new CharacterStats({
            hitPoints: 100,
            maxHitPoints: 100,
            energy: 10,
            maxEnergy: 10,
            attack: 5,
            defence: 5,
            shield: 0,
            ...statoverrides
        }),
        chosenActions: [],
        logCallback: mockLogCallbacks,
        ...other
    });
}

// Add actual tests for the factory function
describe('Test Character Factory', () => {
    it('should create a character with default stats', () => {
        const character = createTestCharacter();

        expect(character.name).toBe("Test Character");
        expect(character.stats.hitPoints).toBe(100);
        expect(character.stats.maxHitPoints).toBe(100);
        expect(character.stats.energy).toBe(10);
        expect(character.stats.maxEnergy).toBe(10);
        expect(character.stats.attack).toBe(5);
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
        expect(character.stats.energy).toBe(10);
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
});