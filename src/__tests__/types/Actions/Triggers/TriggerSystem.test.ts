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
import {CharacterStats} from "../../../../types/Character/CharacterStats";

describe('Trigger System Tests', () => {
    let attacker: Character;
    let defender: Character;

    beforeEach(() => {
        attacker = createTestCharacter();
        defender = createTestCharacter();
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
                    let updatedCharacter = characterUtils.restoreHealth(character, healAmount, this.name);
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
});
