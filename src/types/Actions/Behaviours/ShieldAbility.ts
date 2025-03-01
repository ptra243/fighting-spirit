﻿// ShieldBehavior.ts
import {IActionBehaviour} from "../Action";
import {Character} from "../../Character/Character";
import {CharacterStats} from "../../Character/CharacterStats";
import {IShieldAbility} from "./BehaviourUnion";

export class ShieldBehaviour implements IShieldAbility {
    name: string;
    shieldAmount: number;
    type: 'shield';

    constructor(name: string, shieldAmount: number) {
        this.name = name; // Name of the shield ability
        this.shieldAmount = shieldAmount;
    }

    execute(me: Character, target: Character): [Character, Character] {
        // Add the shield amount to the target's barrier
        const newShieldAmount = me.stats.shield + (this.shieldAmount || 0)        ;
        const newStats = new CharacterStats({
            ...me.stats,
            shield: newShieldAmount
        });
        return [me.cloneWith({stats: newStats}), target];
    }
    getDescription(): string {
        let description = 'Self. '; // Since shield is always self-targeted

        // Add "Gain" and shield amount
        description += `Gain ${this.shieldAmount} Shield`;
        description += '.';

        return description;
    }

}