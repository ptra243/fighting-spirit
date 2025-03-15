import {Character, characterUtils} from "../../Character/Character";
import {IDamageOverTimeBehaviour} from "./BehaviourUnion";

export class DamageOverTimeBehaviour implements IDamageOverTimeBehaviour {
    readonly type = "damageOverTime";
    name: string;
    description: string;
    damagePerTurn: number;
    duration: number;
    
    constructor(config: IDamageOverTimeBehaviour) {
        this.name = config.name;
        this.damagePerTurn = config.damagePerTurn;
        this.duration = config.duration;
        this.description = this.getDescription();
    }

    getDescription(): string {
        return `Deal ${this.damagePerTurn} damage per turn for ${this.duration} turns`;
    }

    execute(character: Character, target: Character): [Character, Character] {
        const updatedTarget = characterUtils
            .wrapCharacter(target)
            .addDOT(this)
            .build();

        return [character, updatedTarget];
    }

    clone(updated: Partial<IDamageOverTimeBehaviour>): DamageOverTimeBehaviour {
        const config: IDamageOverTimeBehaviour = {
            name: updated.name ?? this.name,
            damagePerTurn: updated.damagePerTurn ?? this.damagePerTurn,
            duration: updated.duration ?? this.duration,
            type: "damageOverTime",
            description: updated.description ?? this.description
        };
        return new DamageOverTimeBehaviour(config);
    }
}