import {IActionBehaviour} from "../Action";
import {Character} from "../../Character/Character";
import {IRechargeBehaviour} from "./BehaviourUnion";

export class RechargeBehaviour implements IRechargeBehaviour{
    name: string;
    rechargeAmount: number; // Amount of HP to restore
    type:'recharge';

    constructor(name: string, rechargeAmount: number, energyCost: number = 0) {
        this.name = name;
        this.rechargeAmount = rechargeAmount;
    }

    execute(character: Character,  target: Character): [Character,Character] {
        const updatedCharacter = character.recoverEnergy(this.rechargeAmount, this);
        return [updatedCharacter,target];
    }
    getDescription(): string {
        let description = 'Self. '; // Since recharge is always self-targeted

        // Add "Restore" and energy amount
        description += `Restore ${this.rechargeAmount} Energy`;
        description += '.';

        return description;
    }

}