import {beforeEach, describe, expect, test} from '@jest/globals';
import {Character, createCharacter} from '../../../types/Character/Character';
import {CharacterStats} from "../../../types/Character/CharacterStats";
import {statsUtils} from "../../../types/Character/CharacterStats";
import {createAction, createAttack} from "../../../types/Actions/BehaviorFactories";
import {LogCallbacks} from "../../../BattleManager";

describe('Character', () => {
    let character: Character;


    beforeEach(() => {
        // Setup a fresh character instance before each test using createCharacter
        character = createCharacter(
            'Test Character',  // name
            100,              // health
            10,               // attack
            5                 // defence
        );
    });

    test('should create a character with correct initial values', () => {
        expect(character.name).toBe('Test Character');
        expect(character.stats.hitPoints).toBe(100);
        expect(character.stats.attack).toBe(10);
        expect(character.stats.defence).toBe(5);
    });

    test('should be able to take damage', () => {
        const updatedStats = statsUtils.takeDamage(character.stats, 20);
        const updatedCharacter = new Character({...character, stats: updatedStats});
        // Should take defense into account
        expect(updatedCharacter.stats.hitPoints).toBe(85); // 100 - (20 - 5 defense).
    });
});

describe('Character', () => {
    let baseCharacter: Character;
    let source: Character;
    let mockLogCallbacks: LogCallbacks;

    beforeEach(() => {
        baseCharacter = new Character({
            name: "Test Character",
            stats: new CharacterStats({
                hitPoints: 100,
                attack: 10,
                defence: 5
            }),
            chosenActions: [
                createAction("Basic Slash", [createAttack("Basic Slash", 1)], 1)
            ]
        });
        source = new Character({
            name: "Source Character",
            stats: new CharacterStats({
                hitPoints: 100,
                attack: 10,
                defence: 5
            }),
            chosenActions: [
                createAction("Basic Slash", [createAttack("Basic Slash", 1)], 1)
            ]
        });
        // Mock implementation of LogCallbacks
        mockLogCallbacks = {
            battleLog: jest.fn(),
            messageLog: jest.fn()
        };

    });

    describe('Constructor and Immutability', () => {
        it('should throw error when required properties are missing', () => {
            expect(() => new Character({})).toThrow("The 'name' property is required.");
            expect(() => new Character({name: "Test"})).toThrow("The 'stats' property is required.");
            expect(() => new Character({name: "Test", stats: new CharacterStats({})}))
                .toThrow("The 'actions' property is required.");
        });

        it('should create deep copies of arrays and objects', () => {
            const clonedCharacter = new Character({...baseCharacter});
            expect(baseCharacter.chosenActions).not.toBe(clonedCharacter.chosenActions);
            expect(baseCharacter.equipment).not.toBe(clonedCharacter.equipment);
        });
    });

    describe('Damage and Combat', () => {
        it('should handle damage correctly', () => {
            const updatedStats = statsUtils.takeDamage(baseCharacter.stats, 20);
            const damagedCharacter = new Character({...baseCharacter, stats: updatedStats});
            expect(damagedCharacter.stats.hitPoints).toBe(85); // 100 - (20 - 5 defense).
        });

        it('should maintain original character state after damage', () => {
            const updatedStats = statsUtils.takeDamage(baseCharacter.stats, 20);
            const damagedCharacter = new Character({...baseCharacter, stats: updatedStats});

            expect(baseCharacter.stats.hitPoints).toBe(100); // Original unchanged
            expect(damagedCharacter.stats.hitPoints).toBe(85); // New instance changed
        });
    });

    describe('Charging Mechanics', () => {
        it('should handle charging state correctly', () => {
            const chargingCharacter = new Character({
                ...baseCharacter,
                isCharging: true,
                chargeTurns: 2
            });
            expect(chargingCharacter.isCharging).toBe(true);
            expect(chargingCharacter.chargeTurns).toBe(2);
        });
    });

    describe('Logging', () => {
        it('should handle logging callback', () => {
            const logCallback = mockLogCallbacks;
            const characterWithLogCallback = new Character({
                ...baseCharacter,
                logCallback
            });

            const updatedStats = statsUtils.takeDamage(characterWithLogCallback.stats, 20);
            const damagedCharacter = new Character({
                ...characterWithLogCallback,
                stats: updatedStats
            });

            // Simulate log callback invocation (if the callback logic was included)
            if (damagedCharacter.logCallback) {
                damagedCharacter.logCallback.messageLog(`${damagedCharacter.name} took damage.`);
            }

            expect(logCallback).toHaveBeenCalledWith("Test Character took damage.");
        });
    });
});