import {Character} from "../Character/Character";
import {Modifier} from './Modifiers/IModifier';
import {CharacterStats} from "../Character/CharacterStats";

export interface IAction {
    id: number;
    name: string; // Name of the action
    energyCost: number;
}

export class Action implements IAction {
    private static idCounter = 1; // Static variable for storing the current ID
    public id: number;
    public name: string;
    public energyCost: number;
    public behaviours: IActionBehaviour[]
    public modifiers: Modifier[];
    description: any;


    constructor(name: string, behaviours: IActionBehaviour[], energyCost: number = 0, description: string = 'Flavour Text') {
        this.id = Action.idCounter++;
        this.name = name;
        this.energyCost = energyCost;
        this.behaviours = behaviours;
        this.description = description;
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
        // dont spend energy if charging

        let updatedCharacter = character;
        if (character.isCharging) {
            updatedCharacter = character.cloneWith({chargeTurns: character.chargeTurns - 1});
            if (updatedCharacter.chargeTurns > 0)
                return [updatedCharacter, target];
        }

        // If character doesn't have enough energy, recover energy and return
        if (character.stats.energy < this.energyCost)
        {
            // We need to keep recovering energy until we have enough
            updatedCharacter = character;
            updatedCharacter = updatedCharacter.recoverEnergy(updatedCharacter.stats.energyRegen, updatedCharacter);

            return [updatedCharacter, target];
        }

        // Spend energy if character is not charging
        updatedCharacter = !character.isCharging
            ? character.spendEnergy(this.energyCost, this)
            : character;

        // Execute behaviours and update character and target
        const [updatedMe, updatedTarget] = this.behaviours.reduce(
            ([me, target], behaviour) => behaviour.execute(me, target),
            [updatedCharacter, target]
        );
        updatedCharacter = updatedMe;
        if (!character.isCharging) {
            const nextActionIndex = character.chosenActions.length > 0
                ? (character.currentAction + 1) % character.chosenActions.length
                : 0;

            updatedCharacter = updatedCharacter.cloneWith({
                currentAction: nextActionIndex
            });
        }

        return [updatedCharacter, updatedTarget];
    }
}

export interface IActionBehaviour {
    name: string;

    getDescription(): string;

    execute(character: Character, target?: Character): [Character, Character] // Logic to apply the action, return log entry
}
