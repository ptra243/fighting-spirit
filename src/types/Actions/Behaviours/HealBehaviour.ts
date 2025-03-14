import type {Character} from "../../Character/Character";
import {characterUtils} from "../../Character/Character";
import {IHealBehaviour} from "./BehaviourUnion";

export class HealBehaviour implements IHealBehaviour {
    type: "heal";
    name: string;
    description: string;
    healAmount: number; // Amount of HP to restore

    constructor(name: string, healAmount: number, energyCost: number = 0) {
        this.type = "heal";
        this.name = name;
        this.healAmount = healAmount;
        this.description = `Heal ${healAmount} HP`;
    }

    execute(character: Character, target: Character): [Character, Character] {
        const updatedCharacter = characterUtils
            .wrapCharacter(character)
            .restoreHealth(this.healAmount, this)
            .build();
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