// KnightClass.test.ts
import {describe, expect, it} from '@jest/globals';
import {KnightClass} from '../../../types/Classes/KnightClass';
import {Character, characterUtils, createCharacter} from '../../../types/Character/Character';
import {BuffBehaviour, BuffStat} from '../../../types/Actions/Behaviours/BuffBehaviour';
import {createAction, createAttack} from '../../../types/Actions/BehaviorFactories';
import {LogCallbacks, Named} from '../../../BattleManager';
import {CharacterBuilder} from "../../../types/Character/CharacterBuilder";


describe('KnightClass', () => {
    describe('Buff Amplification Tests', () => {
        it('should double buff amount and increase duration when knight class is added', () => {
            const mockLogCallback: LogCallbacks = {
                battleLog: (source: Named, type: string, value: number, target: Character) => {
                },
                messageLog: (message: string) => {
                }
            };

            // Create a character and add knight class
            let character = createCharacter('Test Knight', 100, 10, 5);
            character.logCallback = mockLogCallback;

            const knightClass = new KnightClass("Knight", null, 0);
            character = new CharacterBuilder(character)
                .addClass(knightClass)
                .levelUpClass(knightClass.getName())
                .build();

            // Create a test buff
            const buff = new BuffBehaviour(
                "Test Buff",
                BuffStat.Attack,
                5,  // Original amount
                2,  // Original duration
                true
            );

            // Apply the buff
            const [updatedCharacter] = buff.execute(character, character, character.triggerManager);

            // Check if the buff was amplified
            expect(updatedCharacter.activeBuffs).toHaveLength(1);
            expect(updatedCharacter.activeBuffs[0]).toEqual(expect.objectContaining({
                amount: 10,  // Should be doubled from 5
                duration: 3  // Should be increased by 1
            }));
        });
    });

    describe('Extra Attack Trigger Tests', () => {
        it('should trigger extra attack when reaching level 2', () => {
            // Create a character and add knight class
            let character = createCharacter('Test Knight', 100, 10, 5);
            const knightClass = new KnightClass("Knight", null, 0);

            // Level up to level 2 to get the extra attack trigger
            let updatedCharacter = characterUtils.wrapCharacter(character)
                .addClass(knightClass)
                .levelUpClass(knightClass.getName())
                .levelUpClass(knightClass.getName())
                .build();

            // Create a test attack action
            const attack = createAction(
                "Test Attack",
                [createAttack("Test Attack", 10)],
                1
            );

            // Create a target
            const target = createCharacter('Test Target', 100, 10, 0);

            // Execute the attack
            const [_, updatedTarget] = attack.execute(updatedCharacter, target);

            // The target should take damage from both the original attack and the triggered attack
            // Original attack: 20 damage
            // Extra attack: 11 damage (from Basic Slash)
            expect(updatedTarget.stats.hitPoints).toBe(69)
        });
    });
});