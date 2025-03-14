import type {Character} from "../../Character/Character";
import {characterUtils} from "../../Character/Character";
import {IRechargeBehaviour} from "./BehaviourUnion";

export class RechargeBehaviour implements IRechargeBehaviour {
    type: "recharge";
    name: string;
    description: string;
    rechargeAmount: number; // Amount of HP to restore

    constructor(name: string, rechargeAmount: number, energyCost: number = 0) {
        this.type = "recharge";
        this.name = name;
        this.rechargeAmount = rechargeAmount;
        this.description = `Recover ${rechargeAmount} energy`;
    }

    execute(character: Character, target: Character): [Character, Character] {
        const updatedCharacter = characterUtils
            .wrapCharacter(character)
            .recoverEnergy(this.rechargeAmount, this)
            .build();
        return [updatedCharacter, target];
    }

    getDescription(): string {
        let description = 'Self. '; // Since recharge is always self-targeted

        // Add "Restore" and energy amount
        description += `Restore ${this.rechargeAmount} Energy`;
        description += '.';

        return description;
    }

}