// Mock behaviour for testing
import {Character} from "../../../types/Character/Character";
import {Action, IActionBehaviour} from "../../../types/Actions/Action";
import {createTestCharacter} from "./Behaviours/testCharacterFactory.test";
import {CharacterStats} from "../../../types/Character/CharacterStats";
import {AttackBehaviour} from "../../../types/Actions/Behaviours/AttackBehaviour";


// Mock behaviour for testing
class MockBehaviour implements IActionBehaviour {
    name: string;
    executed: boolean = false;
    cost: number;
    chargeTurns: number = 0;


    constructor(behaviour: Partial<MockBehaviour> = {}) {
        this.name = behaviour.name || 'Mock Behavior';
        this.cost = behaviour.cost || 0;
        this.execute = behaviour.execute || ((character, target) => {
            this.executed = true;
            return [character, target];
        });
        this.chargeTurns = behaviour.chargeTurns || 0;
    }


    execute(character: Character, target: Character): [Character, Character] {
        this.executed = true;
        return [character, target];
    }

    getDescription(): string {
        return this.name;
    }

    getScaledStat(character: Character): number {
        return 0;
    }
}

describe('Action', () => {
    let mockBehaviour: MockBehaviour;

    beforeEach(() => {
        mockBehaviour = new MockBehaviour({name: 'Test Behaviour'});
    });

    describe('Construction', () => {
        it('should create action with unique incrementing IDs', () => {
            const action1 = new Action('Action 1', [mockBehaviour]);
            const action2 = new Action('Action 2', [mockBehaviour]);

            expect(action2.id).toBe(action1.id + 1);
        });

        it('should initialize with default energy cost of 0', () => {
            const action = new Action('Zero Cost', [mockBehaviour]);
            expect(action.energyCost).toBe(0);
        });

        it('should initialize with custom energy cost', () => {
            const action = new Action('Costly Action', [mockBehaviour], 5);
            expect(action.energyCost).toBe(5);
        });
    });

    describe('Energy Management', () => {
        it('should execute when character has sufficient energy', () => {
            const action = new Action('Energy Test', [mockBehaviour], 3);
            const character = createTestCharacter({energy: 5});
            const target = createTestCharacter();

            const [updatedCharacter, _] = action.execute(character, target);

            expect(updatedCharacter.stats.energy).toBe(2); // 5 - 3
            expect(mockBehaviour.executed).toBe(true);
        });

        it('should not execute and recover energy when insufficient energy', () => {
            const action = new Action('Energy Test', [mockBehaviour], 5);
            const character = createTestCharacter({energy: 3, energyRegen: 2});
            const target = createTestCharacter();

            const [updatedCharacter, _] = action.execute(character, target);

            expect(updatedCharacter.stats.energy).toBe(5); // 3 + 2
            expect(mockBehaviour.executed).toBe(false);
        });
    });

    describe('Behaviour Execution', () => {
        it('should execute multiple behaviours in order', () => {
            const behaviour1 = new MockBehaviour({name: 'First'});
            const behaviour2 = new MockBehaviour({name: 'Second'});
            const action = new Action('Multi Behaviour', [behaviour1, behaviour2]);

            const character = createTestCharacter();
            const target = createTestCharacter();

            action.execute(character, target);

            expect(behaviour1.executed).toBe(true);
            expect(behaviour2.executed).toBe(true);
        });

        it('should handle actions with no behaviours', () => {
            const action = new Action('Empty Action', []);
            const character = createTestCharacter();
            const target = createTestCharacter();

            const [updatedCharacter, updatedTarget] = action.execute(character, target);

            expect(updatedCharacter).toBeDefined();
            expect(updatedTarget).toBeDefined();
        });
    });
    describe('Action Cycling', () => {
        it('should cycle to next action after successful execution', () => {
            const action = new Action('Cycle Test', [mockBehaviour]);

            // Create base character
            const character = createTestCharacter({
                energy: 10,
                currentAction: 0
            });

            // Properly set up the character's actions
            const characterWithActions = character.cloneWith({
                chosenActions: [action, action, action],
                currentAction: 0
            });

            const target = createTestCharacter();

            // Execute the action
            const [updatedCharacter, _] = action.execute(characterWithActions, target);

            // Verify the state before and after
            expect(characterWithActions.currentAction).toBe(0);
            expect(updatedCharacter.currentAction).toBe(1);
            expect(updatedCharacter.chosenActions).toHaveLength(3);
        });

        // Additional test to verify character state manipulation
        it('should properly maintain action state when cloned', () => {
            const action = new Action('Cycle Test', [mockBehaviour]);
            const baseCharacter = createTestCharacter({
                energy: 10,
                currentAction: 0
            });

            const characterWithActions = baseCharacter.cloneWith({
                chosenActions: [action, action, action],
                currentAction: 0
            });

            expect(characterWithActions.currentAction).toBe(0);
            expect(characterWithActions.chosenActions).toHaveLength(3);
        });
    });

    describe('Charging Mechanics', () => {
        it('should not spend energy while charging', () => {
            const chargingBehaviour = new AttackBehaviour(
                'Charge Attack', 3, 10
            );

            const action = new Action('Charge Test', [chargingBehaviour], 5);

            const character = createTestCharacter({
                stats: {
                    energy: 10,
                    energyRegen: 2
                },
                isCharging: false,  // Explicitly set charging state
                currentAction: 0
            });

            const target = createTestCharacter();

            // Execute the action while charging
            const [updatedCharacter, _] = action.execute(character, target);

            // Energy should remain unchanged when charging
            expect(updatedCharacter.stats.energy).toBe(5);
            expect(updatedCharacter.isCharging).toBe(true);
            expect(updatedCharacter.chargeTurns).toBe(3);

            //execute again - energy should now be unchanged

            const [secondTurnCharacter, _2] = action.execute(updatedCharacter, target);
            expect(secondTurnCharacter.stats.energy).toBe(5);
            expect(secondTurnCharacter.isCharging).toBe(true);
            expect(secondTurnCharacter.chargeTurns).toBe(2);

        });

        // Verification test for non-charging state
        it('should spend energy when not charging', () => {
            const behaviour = new MockBehaviour({...mockBehaviour, cost: 5});
            const action = new Action('Normal Test', [behaviour], 5);

            const character = createTestCharacter({
                stats: {
                    energy: 10,
                    energyRegen: 2
                },
                isCharging: false,
                currentAction: 0
            });

            const target = createTestCharacter();
            const [updatedCharacter, _] = action.execute(character, target);

            expect(updatedCharacter.stats.energy).toBe(5);
        });
    });

    describe('Multiple Behaviours', () => {
        it('should execute multiple damage-dealing behaviours', () => {
            // Create two mock damage behaviours
            const damageBehaviourOne = new MockBehaviour({
                name: 'Damage Behaviour 1',
                execute: (character: Character, target: Character) => {
                    const updatedTarget = new Character({
                        ...target,
                        stats: target.stats.takeDamage(10)
                    });
                    return [character, updatedTarget];
                }
            });

            const damageBehaviourTwo = new MockBehaviour({
                name: 'Damage Behaviour 2',
                execute: (character: Character, target: Character) => {
                    const updatedTarget = new Character({
                        ...target,
                        stats: target.stats.takeDamage(15)
                    });
                    return [character, updatedTarget];
                }
            });

            // Create an action with both behaviours
            const action = new Action('Double Damage Action', [damageBehaviourOne, damageBehaviourTwo]);

            // Create test characters
            const character = createTestCharacter();
            const target = createTestCharacter({health: 100});

            // Execute the action
            const [_, updatedTarget] = action.execute(character, target);

            // Verify both behaviours were applied (total damage should be 25)
            expect(updatedTarget.stats.hitPoints).toBe(85); // 100 - (10-5 defence) - (15-5 defence)
        });
    });


});