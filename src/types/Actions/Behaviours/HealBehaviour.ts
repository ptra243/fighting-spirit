import {Character, characterUtils} from "../../Character/Character";
import {IHealBehaviour} from "./BehaviourUnion";

export class HealBehaviour implements IHealBehaviour {
    name: string;
    healAmount: number; // Amount of HP to restore
    type: "heal";

    constructor(name: string, healAmount: number, energyCost: number = 0) {
        this.name = name;
        this.healAmount = healAmount;
    }

    execute(character: Character, target: Character): [Character, Character] {
        const updatedCharacter = characterUtils.restoreHealth(character, this.healAmount, this);
        return [updatedCharacter, target];
    }

    getDescription(): string {
        let description = 'Self. '; // Since heal is always self-targeted

        // Add "Restore" and heal amount
        description += `Restore ${this.healAmount} HP`;
        description += '.';

        return description;
    }

}