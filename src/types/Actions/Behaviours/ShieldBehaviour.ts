// ShieldBehavior.ts
import {Character, characterUtils} from "../../Character/Character";
import {IShieldAbility} from "./BehaviourUnion";

export class ShieldBehaviour implements IShieldAbility {
    readonly type = "shield";
    name: string;
    description: string;
    shieldAmount: number;
    
    constructor(config: IShieldAbility) {
        this.name = config.name;
        this.shieldAmount = config.shieldAmount;
        this.description = this.getDescription();
    }

    getDescription(): string {
        return `Gain ${this.shieldAmount} shield`;
    }

    execute(character: Character, target: Character): [Character, Character] {
        const updatedCharacter = characterUtils
            .wrapCharacter(character)
            .setStats({
                shield: character.stats.shield + this.shieldAmount
            })
            .build();

        return [updatedCharacter, target];
    }
}