import type {Character} from "../Character/Character";
import {characterUtils, createCharacter} from "../Character/Character";
import {Modifier} from './Modifiers/IModifier';
import {ActionTrigger} from "./Triggers/Trigger";
import {AttackBehaviour} from "./Behaviours/AttackBehaviour";
import {BuffBehaviour} from "./Behaviours/BuffBehaviour";
import {DamageOverTimeBehaviour} from "./Behaviours/DamageOverTimeBehaviour";
import {HealBehaviour} from "./Behaviours/HealBehaviour";
import {RechargeBehaviour} from "./Behaviours/RechargeBehaviour";
import {ShieldBehaviour} from "./Behaviours/ShieldBehaviour";
import {IActionBehaviour, IAttackBehaviour, IBuffBehaviour, IDamageOverTimeBehaviour, IHealBehaviour, IRechargeBehaviour, IShieldAbility} from "./Behaviours/BehaviourUnion";

export interface ActionRequirement {
    className: string;
    level: number;
}

export type ActionBehaviour = AttackBehaviour | BuffBehaviour | DamageOverTimeBehaviour | HealBehaviour | RechargeBehaviour | ShieldBehaviour;

export interface ActionConfig {
    id: number;
    name: string;
    behaviours: IActionBehaviour[];
    energyCost: number;
    description: string;
    requirement?: ActionRequirement;
    chargeTurns: number;
    isPrecharge: boolean;
    triggers: ActionTrigger[];
}

// Static counter for generating unique IDs
let actionConfigIdCounter = 1;

// Function to get next unique ID
export function getNextActionId(): number {
    return actionConfigIdCounter++;
}

export class Action implements ActionConfig {
    private static idCounter = 1;
    public id: number;
    public name: string;
    public energyCost: number;
    public behaviours: ActionBehaviour[];
    public modifiers: Modifier[];
    description: string;
    requirement?: ActionRequirement;
    public chargeTurns: number;
    public isPrecharge: boolean;
    public triggers: ActionTrigger[];

    constructor(config: Partial<ActionConfig>) {
        this.id = config.id || Action.idCounter++;
        this.name = config.name || 'Unknown';
        this.energyCost = config.energyCost || 0;
        this.behaviours = this.createBehaviours(config.behaviours || []);
        this.description = config.description || '';
        this.requirement = config.requirement;
        this.chargeTurns = config.chargeTurns || 0;
        this.isPrecharge = config.isPrecharge ?? true;
        this.triggers = config.triggers || [];
        this.modifiers = [];
    }

    private createBehaviours(behaviourConfigs: IActionBehaviour[]): ActionBehaviour[] {
        return behaviourConfigs.map(config => {
            switch (config.type) {
                case "attack": {
                    const attackConfig = config as IAttackBehaviour;
                    return new AttackBehaviour(attackConfig);
                }
                case "buff": {
                    const buffConfig = config as IBuffBehaviour;
                    return new BuffBehaviour(buffConfig);
                }
                case "damageOverTime": {
                    const dotConfig = config as IDamageOverTimeBehaviour;
                    return new DamageOverTimeBehaviour(dotConfig);
                }
                case "heal": {
                    const healConfig = config as IHealBehaviour;
                    return new HealBehaviour(healConfig);
                }
                case "recharge": {
                    const rechargeConfig = config as IRechargeBehaviour;
                    return new RechargeBehaviour(rechargeConfig);
                }
                case "shield": {
                    const shieldConfig = config as IShieldAbility;
                    return new ShieldBehaviour(shieldConfig);
                }
                default:
                    throw new Error(`Unknown behaviour type: ${config.type}`);
            }
        });
    }

    execute(character: Character, target?: Character): [Character, Character] {
        let updatedCharacter = character;
        let updatedTarget = target;

        // If already charging, just update charge progress
        if (character.isCharging) {
            updatedCharacter = createCharacter({
                ...character,
                chargeTurns: character.chargeTurns - character.stats.chargesPerTurn
            });

            // If still charging, return
            if (updatedCharacter.chargeTurns > 0) {
                return [updatedCharacter, target];
            }

            // Charging complete, reset charging state
            updatedCharacter = createCharacter({
                ...updatedCharacter,
                isCharging: false,
                chargeTurns: 0
            });

            if (!this.isPrecharge) {
                const nextActionIndex = character.chosenActions.length > 0
                    ? (character.currentAction + 1) % character.chosenActions.length
                    : 0;

                updatedCharacter = createCharacter({
                    ...updatedCharacter,
                    currentAction: nextActionIndex
                });
                return [updatedCharacter, target];
            }
        } else {
            // Not charging - check energy cost before starting
            if (character.stats.energy < this.energyCost) {
                updatedCharacter = characterUtils
                    .wrapCharacter(character)
                    .recoverEnergy(character.stats.energyRegen, character)
                    .build();
                return [updatedCharacter, target];
            }

            // Pay energy cost when starting the action
            updatedCharacter = characterUtils
                .wrapCharacter(character)
                .spendEnergy(this.energyCost, this)
                .build();

            // Handle starting charge for pre-charge actions
            if (this.isPrecharge && this.chargeTurns > 0) {
                updatedCharacter = createCharacter({
                    ...updatedCharacter,
                    isCharging: true,
                    chargeTurns: this.chargeTurns,
                });
                return [updatedCharacter, target];
            }
        }

        // Execute behaviours
        let [afterActionCharacter, afterActionTarget] = this.DoExecuteAction(updatedCharacter, target);
        updatedCharacter = afterActionCharacter;
        updatedTarget = afterActionTarget;

        // Handle starting charge for post-charge actions
        if (!this.isPrecharge && this.chargeTurns > 0 && !character.isCharging) {
            updatedCharacter = createCharacter({
                ...updatedCharacter,
                isCharging: true,
                chargeTurns: this.chargeTurns,
            });
            return [updatedCharacter, target];
        }

        // Update action index if action is complete
        if (!updatedCharacter.isCharging) {
            const nextActionIndex = character.chosenActions.length > 0
                ? (character.currentAction + 1) % character.chosenActions.length
                : 0;

            updatedCharacter = createCharacter({
                ...updatedCharacter,
                currentAction: nextActionIndex
            });
        }
        return [updatedCharacter, updatedTarget];
    }

    private DoExecuteAction(character: Character, target: Character): [Character, Character] {
        let updatedCharacter = character;
        let updatedTarget = target;
        const allTriggers = [...character.triggers, ...this.triggers];

        // Reset all triggers
        allTriggers.forEach(trigger => {
            trigger.hasBeenTriggered = false;
        });

        // Execute pre-action triggers
        [updatedCharacter, updatedTarget] = this.executeTriggers(
            "beforeAction",
            allTriggers,
            updatedCharacter,
            updatedTarget
        );

        // Execute behaviors
        [updatedCharacter, updatedTarget] = this.behaviours.reduce(
            ([currentChar, currentTarget], behaviour) => {
                // Execute the behavior
                const [charAfterBehavior, targetAfterBehavior] = behaviour.execute(
                    currentChar,
                    currentTarget
                );

                // If it's an attack behavior, execute attack triggers
                if (behaviour instanceof AttackBehaviour) {
                    return this.executeTriggers(
                        'onAttack',
                        allTriggers,
                        charAfterBehavior,
                        targetAfterBehavior
                    );
                }

                return [charAfterBehavior, targetAfterBehavior];
            },
            [updatedCharacter, updatedTarget]
        );

        // Execute post-action triggers
        [updatedCharacter, updatedTarget] = this.executeTriggers(
            'afterAction',
            allTriggers,
            updatedCharacter,
            updatedTarget
        );

        return [updatedCharacter, updatedTarget];
    }

    private executeTriggers(
        type: string,
        triggers: ActionTrigger[],
        character: Character,
        target: Character
    ): [Character, Character] {
        let updatedCharacter = character;
        let updatedTarget = target;

        for (const trigger of triggers) {
            if (trigger.condition.type !== type || trigger.hasBeenTriggered) continue;

            if (trigger.condition.chance && Math.random() > trigger.condition.chance) continue;

            // if (trigger.condition.requirement &&
            //     !trigger.condition.requirement(updatedCharacter, updatedTarget)) continue;

            // if (trigger.effect.execute) {
            //     [updatedCharacter, updatedTarget] = trigger.effect.execute(
            //         updatedCharacter,
            //         updatedTarget,
            //         null
            //     );
            // }
            // if (trigger.effect.behaviour) {
            //     [updatedCharacter, updatedTarget] = trigger.effect.behaviour.execute(
            //         updatedCharacter,
            //         updatedTarget
            //     );
            // }
            trigger.hasBeenTriggered = true;
        }

        return [updatedCharacter, updatedTarget];
    }
}
