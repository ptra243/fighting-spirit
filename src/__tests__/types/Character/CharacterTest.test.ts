// src/__tests__/types/Character/Character.test.ts
import {beforeEach, describe, expect, test} from '@jest/globals';
import {Character, createCharacter} from '../../../types/Character/Character';
import {CharacterStats} from "../../../types/Character/CharacterStats";
import {createAction, createAttack} from "../../../types/Actions/BehaviorFactories";
import {LogCallbacks} from "../../../BattleManager";

describe('Character', () => {
    let character;

    beforeEach(() => {
        // Setup a fresh character instance before each test using createCharacter
        character = createCharacter(
            'Test Character',  // name
            100,              // health
            10,               // attack
            5,                // defence
        );
    });

    test('should create a character with correct initial values', () => {
        expect(character.name).toBe('Test Character');
        expect(character.stats.hitPoints).toBe(100);
        expect(character.stats.attack).toBe(10);
        expect(character.stats.defence).toBe(5);
    });

    test('should be able to take damage', () => {
        const updatedCharacter = character.takeDamage(20, 'test');
        //should take defence into account
        expect(updatedCharacter.stats.hitPoints).toBe(85);
    });
});


// src/__tests__/types/Character/Character.test.ts
describe('Character', () => {
    let baseCharacter: Character;

    let source: Character;

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
    });

    describe('Constructor and Immutability', () => {
        it('should throw error when required properties are missing', () => {
            expect(() => new Character({})).toThrow("The 'name' property is required.");
            expect(() => new Character({name: "Test"})).toThrow("The 'stats' property is required.");
            expect(() => new Character({name: "Test", stats: new CharacterStats({})}))
                .toThrow("The 'actions' property is required.");
        });

        it('should create deep copies of arrays and objects', () => {
            expect(baseCharacter.chosenActions).not.toBe(baseCharacter.cloneWith({}).chosenActions);
            expect(baseCharacter.equipment).not.toBe(baseCharacter.cloneWith({}).equipment);
        });
    });

    describe('Damage and Combat', () => {
        it('should handle damage correctly', () => {
            const damaged = baseCharacter.takeDamage(20, source);
            expect(damaged.stats.hitPoints).toBe(85); // 100 - (20 - 5 defense)
        });

        it('should maintain original character state after damage', () => {
            const damaged = baseCharacter.takeDamage(20, source);
            expect(baseCharacter.stats.hitPoints).toBe(100); // Original unchanged
            expect(damaged.stats.hitPoints).toBe(85); // New instance changed
        });
    });

    describe('Charging Mechanics', () => {
        it('should handle charging state correctly', () => {
            const charging = baseCharacter.cloneWith({
                isCharging: true,
                chargeTurns: 2
            });
            expect(charging.isCharging).toBe(true);
            expect(charging.chargeTurns).toBe(2);
        });
    });

    describe('Logging', () => {
        it('should handle logging callback', () => {
            const callbacks: LogCallbacks = {
                battleLog: jest.fn(),
                messageLog: jest.fn()
            };

            const characterWithLogger = baseCharacter.setLogCallback(callbacks);
            characterWithLogger.takeDamage(10, source);

            // Verify battleLog was called with the correct parameters
            expect(callbacks.battleLog).toHaveBeenCalledWith(
                source,          // source character
                'damage',        // type
                5,             // value 10 attack -5  defence
                characterWithLogger  // target
            );

        });
    });

    describe('Equipment and Actions', () => {
        it('should initialize with empty equipment array', () => {
            expect(baseCharacter.getEquipment()).toEqual([]);
        });


        it('should initialize with empty chosen actions', () => {
            expect(baseCharacter.chosenActions).toEqual([]);
        });
    });


});
