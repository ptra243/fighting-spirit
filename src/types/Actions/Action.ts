import {Character} from "../Character/Character";
import {Modifier} from './Modifiers/IModifier';
import _ from "lodash";
import {TriggerType} from "./Triggers/Trigger";
import {BaseTriggerManager, TriggerManager} from "./Triggers/TriggerManager";
import {AttackBehaviour} from "./Behaviours/AttackBehaviour";

export interface ActionRequirement {
    className: string;
    level: number;
}


interface ActionConfig {
    name: string;
    behaviours: IActionBehaviour[];
    energyCost: number;
    description: string;
    requirement?: ActionRequirement;
    chargeTurns: number;
    isPrecharge: boolean;
    triggerManager: TriggerManager;

}

export class Action implements ActionConfig {
    private static idCounter = 1; // Static variable for storing the current ID
    public id: number;
    public name: string;
    public energyCost: number;
    public behaviours: IActionBehaviour[]
    public modifiers: Modifier[];
    description: any;
    requirement?: ActionRequirement;
    public chargeTurns: number;
    public isPrecharge: boolean;
    public triggerManager: TriggerManager;


    constructor(config: Partial<ActionConfig>) {
        this.id = Action.idCounter++;
        this.name = config.name || 'Unkown';
        this.energyCost = config.energyCost || 0;
        this.behaviours = config.behaviours || [];
        this.description = config.description || '';
        this.requirement = config.requirement;
        this.chargeTurns = config.chargeTurns || 0;
        this.isPrecharge = config.isPrecharge ?? true;
        this.triggerManager = new BaseTriggerManager();

        if (config.triggerManager?.triggers) {
            config.triggerManager.triggers.forEach(trigger => this.triggerManager.addTrigger(trigger));
        }
    }

    cloneWith(initialAction: Partial<Action>): Action {
        return

    }

    //TODO
    applyModifier(modifier: Modifier) {
        this.modifiers.push(modifier);
        // if(modifier.type == 'energy')
        this.behaviours.forEach((b) => {
            if (modifier.scaleStat) {


            }

        });


    }

    execute(character: Character, target?: Character): [Character, Character] {
        let updatedCharacter = character;
        let updatedTarget = target;

        // If already charging, just update charge progress
        if (character.isCharging) {

            updatedCharacter = character.cloneWith({
                chargeTurns: character.chargeTurns - character.stats.chargesPerTurn
            });
            // If still charging, return
            if (updatedCharacter.chargeTurns > 0) {
                return [updatedCharacter, target];
            }
            // Charging complete, reset charging state
            updatedCharacter = updatedCharacter.cloneWith({
                isCharging: false,
                chargeTurns: 0
            });
            if (!this.isPrecharge) {
                const nextActionIndex = character.chosenActions.length > 0
                    ? (character.currentAction + 1) % character.chosenActions.length
                    : 0;

                updatedCharacter = updatedCharacter.cloneWith({
                    currentAction: nextActionIndex
                });
                return [updatedCharacter, target];
            }

        } else {
            // Not charging - check energy cost before starting
            if (character.stats.energy < this.energyCost) {
                updatedCharacter = character.recoverEnergy(character.stats.energyRegen, character);
                return [updatedCharacter, target];
            }

            // Pay energy cost when starting the action
            updatedCharacter = updatedCharacter.spendEnergy(this.energyCost, this);

            // Handle starting charge for pre-charge actions
            if (this.isPrecharge && this.chargeTurns > 0) {
                updatedCharacter = updatedCharacter.cloneWith({
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
            updatedCharacter = updatedCharacter.cloneWith({
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

            updatedCharacter = updatedCharacter.cloneWith({
                currentAction: nextActionIndex
            });
        }
        return [updatedCharacter, updatedTarget];
    }

    private DoExecuteAction(character: Character, target: Character):[Character,Character] {
        let updatedCharacter = character;
        let updatedTarget = target;
        let UnifiedTriggerManager = new BaseTriggerManager([...character.triggerManager.triggers,...this.triggerManager.triggers]);
        // Execute pre-action triggers from both sources
        [updatedCharacter, updatedTarget] = UnifiedTriggerManager.executeTriggers(
            "beforeAction",
            updatedCharacter,
            updatedTarget
        );

        [updatedCharacter, updatedTarget] = this.behaviours.reduce(
            ([currentChar, currentTarget], behaviour) => {
                // Execute the behavior
                const [charAfterBehavior, targetAfterBehavior] = behaviour.execute(
                    currentChar,
                    currentTarget
                );

                // If it's an attack behavior, execute both trigger managers
                if (behaviour instanceof AttackBehaviour) {
                    return UnifiedTriggerManager.executeTriggers(
                            'onAttack',
                            charAfterBehavior,
                            targetAfterBehavior
                        );
                }

                return [charAfterBehavior, targetAfterBehavior];
            },
            [updatedCharacter, updatedTarget]
        );


        // Execute post-action triggers from both sources
        [updatedCharacter, updatedTarget] = UnifiedTriggerManager.executeTriggers(
            'afterAction',
            updatedCharacter,
            updatedTarget
        );
        return [updatedCharacter, updatedTarget];

    }
}

export interface IActionBehaviour {
    name: string;

    getDescription(): string;

    execute(character: Character, target?: Character): [Character, Character] // Logic to apply the action, return log entry
}
