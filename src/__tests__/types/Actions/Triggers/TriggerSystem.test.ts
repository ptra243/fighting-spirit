import {Character, characterUtils} from "../../../../types/Character/Character";
import {createTestCharacter} from "../Behaviours/testCharacterFactory.test";
import {
    ActionTrigger,
    AttackContext,
    BeforeActionContext,
    TriggerCondition,
    TriggerEffect
} from "../../../../types/Actions/Triggers/Trigger";
import {BuffBehaviour, BuffStat} from "../../../../types/Actions/Behaviours/BuffBehaviour";
import {AttackBehaviour} from "../../../../types/Actions/Behaviours/AttackBehaviour";
import {createAttack} from "../../../../types/Actions/BehaviorFactories";
import {CharacterStats, createStats} from "../../../../types/Character/CharacterStats";
import {CharacterEquipment} from "../../../../types/Character/CharacterEquipment";
import {TriggerManager} from "../../../../types/Actions/Triggers/TriggerManager";
import {TriggerType} from "../../../../types/Actions/Triggers/Trigger";

describe('Trigger System Tests', () => {
    let attacker: Character;
    let defender: Character;
    let triggerManager: TriggerManager;

    beforeEach(() => {
        const baseStats = createStats({
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

        attacker = createTestCharacter();
        defender = createTestCharacter();
        triggerManager = new TriggerManager();
    });

    describe('BeforeAction Trigger', () => {
        class PreActionBuffTrigger implements ActionTrigger {
            hasBeenTriggered: false;
            condition: TriggerCondition = {
                type: 'beforeAction'
            };

            effect: TriggerEffect = {
                execute(character: Character, target: Character, context: BeforeActionContext): [Character, Character] {
                    context.attackBonus = 5;
                    return [character, target];
                },
                behaviour: new BuffBehaviour(
                    "Pre-Action Buff",
                    BuffStat.Attack,
                    2,
                    1,
                    true
                )
            };

        }

        it('should modify context and apply buff', () => {
            const trigger = new PreActionBuffTrigger();
            const context: BeforeActionContext = {};
            const [updatedAttacker] = trigger.effect.execute(attacker, defender, context);
            expect(context.attackBonus).toBe(5);

            const [afterBehaviour] = trigger.effect.behaviour.execute(updatedAttacker, defender);
            expect(afterBehaviour.activeBuffs).toHaveLength(1);
            expect(afterBehaviour.activeBuffs[0].amount).toBe(2);
        });
    });

    describe('OnAttack Trigger', () => {
        class CriticalStrikeTrigger implements ActionTrigger {
            hasBeenTriggered: false;
            condition: TriggerCondition = {
                type: 'onAttack'
            };

            effect: TriggerEffect = {
                execute(character: Character, target: Character, context: AttackContext): [Character, Character] {
                    context.isCritical = true;
                    context.damageMultiplier = 2;
                    return [character, target];
                },
                behaviour: new AttackBehaviour(
                    "Critical Follow-up",
                    2
                )
            };
        }

        it('should apply critical modifiers and extra damage', () => {
            const trigger = new CriticalStrikeTrigger();
            const context: AttackContext = {attack: createAttack("Attack", 1), isCritical: false, damageMultiplier: 1};

            const [_, __] = trigger.effect.execute(attacker, defender, context);
            expect(context.isCritical).toBe(true);
            expect(context.damageMultiplier).toBe(2);

            const initialHp = defender.stats.hitPoints;
            const [___, afterBehaviour] = trigger.effect.behaviour.execute(attacker, defender);
            expect(afterBehaviour.stats.hitPoints).toBeLessThan(initialHp);
        });
    });

    describe('OnDamageDealt Trigger', () => {
        class LifestealTrigger implements ActionTrigger {
            hasBeenTriggered: false;
            condition: TriggerCondition = {
                type: 'onDamageDealt'
            };

            effect: TriggerEffect = {
                execute(character: Character, target: Character, context: any): [Character, Character] {
                    const healAmount = Math.floor(context.damage * 0.2);
                    let updatedCharacter = characterUtils.wrapCharacter(character)
                        .restoreHealth(healAmount, this.name)
                        .build();
                    return [updatedCharacter, target];
                },
                behaviour: new BuffBehaviour(
                    "Post-Lifesteal Buff",
                    BuffStat.Defense,
                    1,
                    2,
                    true
                )
            };
        }

        it('should heal attacker and apply defense buff', () => {
            const trigger = new LifestealTrigger();
            const context = {damage: 20};
            let updatedAttacker = new Character({
                ...attacker,
                stats: new CharacterStats({...attacker.stats, hitPoints: 90})
            });
            const initialHp = updatedAttacker.stats.hitPoints;
            [updatedAttacker] = trigger.effect.execute(updatedAttacker, defender, context);
            expect(updatedAttacker.stats.hitPoints).toBe(initialHp + 4); // 20% of 20

            const [afterBehaviour] = trigger.effect.behaviour.execute(updatedAttacker, defender);
            expect(afterBehaviour.activeBuffs).toHaveLength(1);
            expect(afterBehaviour.activeBuffs[0].buffType).toBe(BuffStat.Defense);
        });
    });

    describe('OnDamageTaken Trigger', () => {
        class DamageReductionTrigger implements ActionTrigger {
            hasBeenTriggered: false;
            condition: TriggerCondition = {
                type: 'onDamageTaken'
            };

            effect: TriggerEffect = {
                execute(character: Character, target: Character, context: any): [Character, Character] {
                    context.damage = Math.floor(context.damage * 0.7);
                    return [character, target];
                },
                behaviour: new AttackBehaviour(
                    "Counter Attack",
                    5
                )
            };
        }

        it('should reduce damage and counter-attack', () => {
            const trigger = new DamageReductionTrigger();
            const context = {damage: 30};

            const [_, __] = trigger.effect.execute(defender, attacker, context);
            expect(context.damage).toBe(21); // 70% of 30

            const initialHp = attacker.stats.hitPoints;
            const [___, afterBehaviour] = trigger.effect.behaviour.execute(defender, attacker);
            expect(afterBehaviour.stats.hitPoints).toBeLessThan(initialHp);
        });
    });

    describe('OnApplyBuff Trigger', () => {
        class BuffAmplifierTrigger implements ActionTrigger {
            hasBeenTriggered: false;
            condition: TriggerCondition = {
                type: 'onApplyBuff'
            };

            effect: TriggerEffect = {
                execute(character: Character, target: Character, context: any): [Character, Character] {
                    if (context.buff) {
                        context.buff.amount *= 2;
                        context.buff.duration += 1;
                    }
                    return [character, target];
                },
                behaviour: new BuffBehaviour(
                    "Amplifier Bonus",
                    BuffStat.Defense,
                    1,
                    1,
                    true
                )
            };
        }

        it('should amplify incoming buff and apply bonus', () => {
            const trigger = new BuffAmplifierTrigger();
            const buffContext = {
                buff: {
                    amount: 5,
                    duration: 3,
                    buffType: BuffStat.Attack
                }
            };

            const [updatedCharacter] = trigger.effect.execute(attacker, defender, buffContext);
            expect(buffContext.buff.amount).toBe(10);
            expect(buffContext.buff.duration).toBe(4);

            const [afterBehaviour] = trigger.effect.behaviour.execute(updatedCharacter, defender);
            expect(afterBehaviour.activeBuffs).toHaveLength(1);
            expect(afterBehaviour.activeBuffs[0].buffType).toBe(BuffStat.Defense);
        });
    });

    test('should execute onDamage trigger when damage is dealt', () => {
        const mockTrigger = jest.fn();
        triggerManager.addTrigger(TriggerType.ON_DAMAGE, mockTrigger);

        const attackBehaviour = new AttackBehaviour("Test Attack", 10);
        const [newAttacker, newDefender] = attackBehaviour.execute(attacker, defender, triggerManager);

        expect(mockTrigger).toHaveBeenCalled();
        expect(mockTrigger).toHaveBeenCalledWith({
            attacker: newAttacker,
            defender: newDefender,
            damage: expect.any(Number)
        });
    });

    test('should execute onLowHealth trigger when health drops below threshold', () => {
        const mockTrigger = jest.fn();
        triggerManager.addTrigger(TriggerType.ON_LOW_HEALTH, mockTrigger);

        const attackBehaviour = new AttackBehaviour("Test Attack", 90);
        const [newAttacker, newDefender] = attackBehaviour.execute(attacker, defender, triggerManager);

        expect(mockTrigger).toHaveBeenCalled();
        expect(mockTrigger).toHaveBeenCalledWith({
            character: newDefender,
            healthPercentage: expect.any(Number)
        });
    });

    test('should execute multiple triggers in sequence', () => {
        const mockDamageTrigger = jest.fn();
        const mockLowHealthTrigger = jest.fn();
        triggerManager.addTrigger(TriggerType.ON_DAMAGE, mockDamageTrigger);
        triggerManager.addTrigger(TriggerType.ON_LOW_HEALTH, mockLowHealthTrigger);

        const attackBehaviour = new AttackBehaviour("Test Attack", 90);
        const [newAttacker, newDefender] = attackBehaviour.execute(attacker, defender, triggerManager);

        expect(mockDamageTrigger).toHaveBeenCalled();
        expect(mockLowHealthTrigger).toHaveBeenCalled();
        expect(mockDamageTrigger).toHaveBeenCalledWith({
            attacker: newAttacker,
            defender: newDefender,
            damage: expect.any(Number)
        });
        expect(mockLowHealthTrigger).toHaveBeenCalledWith({
            character: newDefender,
            healthPercentage: expect.any(Number)
        });
    });

    test('should not execute trigger if condition is not met', () => {
        const mockLowHealthTrigger = jest.fn();
        triggerManager.addTrigger(TriggerType.ON_LOW_HEALTH, mockLowHealthTrigger);

        const attackBehaviour = new AttackBehaviour("Test Attack", 10); // Small damage
        attackBehaviour.execute(attacker, defender, triggerManager);

        expect(mockLowHealthTrigger).not.toHaveBeenCalled();
    });

    test('should handle multiple triggers of the same type', () => {
        const mockTrigger1 = jest.fn();
        const mockTrigger2 = jest.fn();
        triggerManager.addTrigger(TriggerType.ON_DAMAGE, mockTrigger1);
        triggerManager.addTrigger(TriggerType.ON_DAMAGE, mockTrigger2);

        const attackBehaviour = new AttackBehaviour("Test Attack", 10);
        const [newAttacker, newDefender] = attackBehaviour.execute(attacker, defender, triggerManager);

        expect(mockTrigger1).toHaveBeenCalled();
        expect(mockTrigger2).toHaveBeenCalled();
        expect(mockTrigger1).toHaveBeenCalledWith({
            attacker: newAttacker,
            defender: newDefender,
            damage: expect.any(Number)
        });
        expect(mockTrigger2).toHaveBeenCalledWith({
            attacker: newAttacker,
            defender: newDefender,
            damage: expect.any(Number)
        });
    });

    test('should remove trigger when removeListener is called', () => {
        const mockTrigger = jest.fn();
        const removeListener = triggerManager.addTrigger(TriggerType.ON_DAMAGE, mockTrigger);

        removeListener();

        const attackBehaviour = new AttackBehaviour("Test Attack", 10);
        attackBehaviour.execute(attacker, defender, triggerManager);

        expect(mockTrigger).not.toHaveBeenCalled();
    });
});
