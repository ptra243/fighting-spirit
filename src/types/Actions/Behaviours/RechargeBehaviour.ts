import {Character, characterUtils} from "../../Character/Character";
import {IRechargeBehaviour} from "./BehaviourUnion";

export class RechargeBehaviour implements IRechargeBehaviour {
    readonly type = "recharge";
    name: string;
    description: string;
    rechargeAmount: number; // Amount of HP to restore

    constructor(config: IRechargeBehaviour) {
        this.name = config.name;
        this.rechargeAmount = config.rechargeAmount;
        this.description = this.getDescription();
    }

    execute(character: Character, target: Character): [Character, Character] {
        const updatedCharacter = characterUtils
            .wrapCharacter(character)
            .recoverEnergy(this.rechargeAmount, this)
            .build();
        return [updatedCharacter, target];
    }

    getDescription(): string {
        return `Restore ${this.rechargeAmount} energy`;
    }
}