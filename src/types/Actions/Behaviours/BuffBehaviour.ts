﻿import {Character} from "../../Character/Character";
import _ from "lodash";
import {IBuffBehaviour} from "./BehaviourUnion";

export enum BuffStat {
    Attack = "attack",
    Defense = "defense",
    hpRegen = "hpRegen",
    EnergyRegen = "energyRegen",
    Shield = "shield"
}

export class BuffBehaviour implements IBuffBehaviour {
    name: string;
    type: "buff"; // Identify this as a boost action
    buffType: BuffStat; // Type of stat to boost
    amount: number; // Amount by which to boost the stat
    duration: number; // Number of turns boost lasts
    isSelfBuff: boolean

    constructor(name: string, boostType: BuffStat, boostAmount: number, duration: number, isSelfBuff: boolean = true) {
        this.name = name;
        this.buffType = boostType
        this.amount = boostAmount;
        this.duration = duration;
        this.isSelfBuff = isSelfBuff;
    }

    clone(updated: Partial<BuffBehaviour>): BuffBehaviour {
        return new BuffBehaviour(
            updated.name ?? this.name,
            updated.buffType ?? this.buffType,
            updated.amount ?? this.amount,
            updated.duration ?? this.duration,
            updated.isSelfBuff ?? this.isSelfBuff
        );

    }

    execute(me: Character, other: Character): [Character, Character] {

        if (this.isSelfBuff)
            me.addBuff(this);
        else
            other.addBuff(this);

        // Optionally log this action
        return [me.cloneWith({}), other.cloneWith({})];
    }

    getDescription(): string {
        let description = '';

        // Add target keyword
        description += this.isSelfBuff ? 'Self. ' : 'Enemy. ';

        // Add "Apply" and amount
        description += `Apply ${this.amount} `;

        // Format buff type name
        let buffTypeName = '';
        switch (this.buffType) {
            case BuffStat.EnergyRegen:
                buffTypeName = 'Energy Regeneration';
                break;
            case BuffStat.hpRegen:
                buffTypeName = 'HP Regeneration';
                break;
            default:
                // For other buff types, just capitalize the first letter
                buffTypeName = this.buffType.charAt(0).toUpperCase() + this.buffType.slice(1);
        }

        description += `${buffTypeName} `;

        // Add duration
        description += `for ${this.duration} turn`;
        description += this.duration !== 1 ? 's' : '';
        description += '.';

        return description;
    }


}