// Mock behaviour for testing
import {Character, characterUtils} from "../../../types/Character/Character";
import {Action, IActionBehaviour} from "../../../types/Actions/Action";
import {createTestCharacter} from "./Behaviours/testCharacterFactory.test";


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
            const action1 = new Action({
                name: 'Action 1',
                behaviours: [mockBehaviour]
            });
            const action2 = new Action({
                name: 'Action 2',
                behaviours: [mockBehaviour]
            });

            expect(action2.id).toBe(action1.id + 1);
        });

        it('should initialize with default energy cost of 0', () => {
            const action = new Action({
                name: 'Zero Cost',
                behaviours: [mockBehaviour]
            });
            expect(action.energyCost).toBe(0);
        });

        it('should initialize with custom energy cost', () => {
            const action = new Action({
                name: 'Costly Action',
                behaviours: [mockBehaviour],
                energyCost: 5
            });
            expect(action.energyCost).toBe(5);
        });

    });

    describe('Energy Management', () => {
        it('should execute when character has sufficient energy', () => {
            const action = new Action({
                name: 'Energy Test',
                behaviours: [mockBehaviour],
                energyCost: 3
            });

            const character = createTestCharacter({energy: 5});
            const target = createTestCharacter();
            const [updatedCharacter, _] = action.execute(character, target);

            expect(updatedCharacter.stats.energy).toBe(2); // 5 - 3
            expect(mockBehaviour.executed).toBe(true);
        });

        it('should not execute and recover energy when insufficient energy', () => {
            const action = new Action({
                name: 'Energy Test',
                behaviours: [mockBehaviour],
                energyCost: 5
            });

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
            const action = new Action({
                name: 'Multi Behaviour',
                behaviours: [behaviour1, behaviour2]
            });


            const character = createTestCharacter();
            const target = createTestCharacter();

            action.execute(character, target);

            expect(behaviour1.executed).toBe(true);
            expect(behaviour2.executed).toBe(true);
        });

        it('should handle actions with no behaviours', () => {
            const action = new Action({
                name: 'Empty Action',
                behaviours: []
            });

            const character = createTestCharacter();
            const target = createTestCharacter();

            const [updatedCharacter, updatedTarget] = action.execute(character, target);

            expect(updatedCharacter).toBeDefined();
            expect(updatedTarget).toBeDefined();
        });
    });
    describe('Action Cycling', () => {
        it('should cycle to next action after successful execution', () => {
            const action = new Action({
                name: 'Cycle Test',
                behaviours: [mockBehaviour]
            });

            // Create base character
            const character = createTestCharacter({
                energy: 10,
                currentAction: 0
            });

            // Properly set up the character's actions
            const characterWithActions = new Character({
                ...character,
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
            const action = new Action({name: 'Cycle Test', behaviours: [mockBehaviour]});
            const baseCharacter = createTestCharacter({
                energy: 10,
                currentAction: 0
            });

            const characterWithActions = new Character({
                ...baseCharacter,
                chosenActions: [action, action, action],
                currentAction: 0
            });

            expect(characterWithActions.currentAction).toBe(0);
            expect(characterWithActions.chosenActions).toHaveLength(3);
        });
    });
    describe('Charging Mechanics', () => {
        it('should handle pre-charge actions correctly', () => {
            const mBehaviour = new MockBehaviour({name: "Mock Behaviour"});
            const action = new Action({
                name: 'Pre-Charge Test',
                energyCost: 5,
                chargeTurns: 3,
                isPrecharge: true,
                behaviours: [mBehaviour]
            });

            const character = createTestCharacter({
                stats: {
                    energy: 10,
                    energyRegen: 2,
                    chargesPerTurn: 1
                },
                isCharging: false,
                currentAction: 0
            });

            const target = createTestCharacter();

            // First turn - should start charging and spend energy
            const [firstTurn, _] = action.execute(character, target);
            expect(firstTurn.stats.energy).toBe(5); // Energy spent at start
            expect(firstTurn.isCharging).toBe(true);
            expect(firstTurn.chargeTurns).toBe(3);

            // Second turn - should continue charging
            const [secondTurn, _2] = action.execute(firstTurn, target);
            expect(secondTurn.stats.energy).toBe(5); // Energy unchanged while charging
            expect(secondTurn.isCharging).toBe(true);
            expect(secondTurn.chargeTurns).toBe(2);

            // Third turn - should complete charging
            const [thirdTurn, _3] = action.execute(secondTurn, target);
            expect(thirdTurn.stats.energy).toBe(5); // Energy still unchanged
            expect(thirdTurn.isCharging).toBe(true);
            expect(thirdTurn.chargeTurns).toBe(1);

            // Fourth turn - should execute action
            const [fourthTurn, _4] = action.execute(thirdTurn, target);
            expect(fourthTurn.stats.energy).toBe(5); // Energy unchanged after execution
            expect(fourthTurn.isCharging).toBe(false);
            expect(fourthTurn.chargeTurns).toBe(0);
            expect(mBehaviour.executed).toBe(true);
        });

        it('should handle post-charge actions correctly', () => {
            const mBehaviour = new MockBehaviour({name: "Mock Behaviour"});
            const mBehaviour2 = new MockBehaviour({name: "Mock Behaviour"});

            const action = new Action({
                name: 'Post-Charge Test',
                energyCost: 5,
                chargeTurns: 3,
                isPrecharge: false,
                behaviours: [mBehaviour]
            });

            const character = createTestCharacter({
                stats: {
                    energy: 10,
                    energyRegen: 2,
                    chargesPerTurn: 1
                },
                isCharging: false,
                currentAction: 0,
            });
            character.chosenActions.push(action);
            character.chosenActions.push(action);
            const target = createTestCharacter();

            // First turn - should execute action, spend energy and start charging
            const [firstTurn, _] = action.execute(character, target);
            expect(firstTurn.stats.energy).toBe(5); // Energy spent
            expect(firstTurn.isCharging).toBe(true);
            expect(firstTurn.chargeTurns).toBe(3);
            expect(mBehaviour.executed).toBe(true);

            // Second turn - should continue charging
            const [secondTurn, _2] = action.execute(firstTurn, target);
            expect(secondTurn.stats.energy).toBe(5); // Energy unchanged while charging
            expect(secondTurn.isCharging).toBe(true);
            expect(secondTurn.chargeTurns).toBe(2);

            const [thirdTurn, _3] = action.execute(secondTurn, target);
            // Fourth turn - should complete charging
            const [fourthTurn, _4] = action.execute(thirdTurn, target);
            expect(fourthTurn.stats.energy).toBe(5);
            expect(fourthTurn.isCharging).toBe(false);
            expect(fourthTurn.chargeTurns).toBe(0);
            expect(fourthTurn.currentAction).toBe(1);
        });

        it('should handle faster charging with higher chargesPerTurn', () => {
            const action = new Action({
                name: 'Fast Charge Test',
                energyCost: 5,
                chargeTurns: 3,
                isPrecharge: true,
                behaviours: []
            });

            const character = createTestCharacter({
                    energy: 10,
                    energyRegen: 2,
                    chargesPerTurn: 2 // Charges twice as fast
                }
            );
            console.log(character.stats.chargesPerTurn);

            const target = createTestCharacter();

            // First turn - should start charging and spend energy
            const [firstTurn, _] = action.execute(character, target);
            expect(firstTurn.stats.energy).toBe(5);
            expect(firstTurn.isCharging).toBe(true);
            expect(firstTurn.chargeTurns).toBe(3);

            // Second turn - should reduce charge by 2
            const [secondTurn, _2] = action.execute(firstTurn, target);
            expect(secondTurn.stats.energy).toBe(5);
            expect(secondTurn.isCharging).toBe(true);
            expect(secondTurn.chargeTurns).toBe(1);

            // Third turn - should complete charging and execute action
            const [thirdTurn, _3] = action.execute(secondTurn, target);
            expect(thirdTurn.stats.energy).toBe(5);
            expect(thirdTurn.isCharging).toBe(false);
            expect(thirdTurn.chargeTurns).toBe(0);
        });

        it('should spend energy when not charging', () => {
            const action = new Action({
                name: 'Normal Test',
                energyCost: 5,
                behaviours: []
            });

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
            const damageBehaviourOne = new MockBehaviour({
                name: 'Damage Behaviour 1',
                execute: (character: Character, target: Character) => {
                    const updatedTarget = characterUtils.takeDamage(target, 10, character);
                    return [character, updatedTarget];
                }
            });

            const damageBehaviourTwo = new MockBehaviour({
                name: 'Damage Behaviour 2',
                execute: (character: Character, target: Character) => {
                    const updatedTarget = characterUtils.takeDamage(target, 15, character);
                    return [character, updatedTarget];
                }
            });

            const action = new Action({
                name: 'Double Damage Action',
                behaviours: [damageBehaviourOne, damageBehaviourTwo]
            });

            const character = createTestCharacter();
            const target = createTestCharacter({health: 100});

            const [_, updatedTarget] = action.execute(character, target);

            expect(updatedTarget.stats.hitPoints).toBe(85);
        });

    });


});