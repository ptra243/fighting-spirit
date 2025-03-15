import {Character, characterUtils} from "../../Character/Character";
import {IHealBehaviour} from "./BehaviourUnion";

export class HealBehaviour implements IHealBehaviour {
    readonly type = "heal";
    name: string;
    description: string;
    healAmount: number;
    
    constructor(config: IHealBehaviour) {
        this.name = config.name;
        this.healAmount = config.healAmount;
        this.description = this.getDescription();
    }

    getDescription(): string {
        return `Heal for ${this.healAmount} HP`;
    }

    execute(character: Character, target: Character): [Character, Character] {
        const updatedCharacter = characterUtils
            .wrapCharacter(character)
            .restoreHealth(this.healAmount, this)
            .build();

        return [updatedCharacter, target];
    }
}