import {Character, characterUtils} from "../../Character/Character";
import {IDamageOverTimeBehaviour} from "./BehaviourUnion";

export class DamageOverTimeBehaviour implements IDamageOverTimeBehaviour {
    name: string;
    damagePerTurn: number; // Damage dealt per turn
    duration: number; // Number of turns effect lasts
    type: "damageOverTime";

    constructor(name: string, damagePerTurn: number, duration: number) {
        this.name = name;
        this.damagePerTurn = damagePerTurn;
        this.duration = duration;
    }

    execute(character: Character, target: Character): [Character, Character] {
        // Apply the debuff (damage over time) to the target
        // const target = this.isSelfBuff ? me : other;
        const updatedTarget = characterUtils.addDOT(target, this);
        return [character, updatedTarget];
    }

    getDescription(): string {
        let description = '';

        // Add "Deal" and damage per turn
        description += `Deal ${this.damagePerTurn} damage `;

        // Add "per turn"
        description += 'per turn ';

        // Add duration
        description += `for ${this.duration} turn`;
        description += this.duration !== 1 ? 's' : '';
        description += '.';

        return description;
    }

    clone(updated: Partial<DamageOverTimeBehaviour>) {
        return new DamageOverTimeBehaviour(
            updated.name ?? this.name,
            updated.damagePerTurn ?? this.damagePerTurn,
            updated.duration ?? this.duration
        );
    }
}