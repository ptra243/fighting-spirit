import {IActionBehaviour} from "../Action";

export interface IAttackBehaviour extends IActionBehaviour {
    type: "attack";
    damage: number;
}

export interface IBuffBehaviour extends IActionBehaviour {
    type: "buff";
    buffType: string;
    amount: number;
    duration: number;
}

export interface IDamageOverTimeBehaviour extends IActionBehaviour {
    type: "damageOverTime";
    damagePerTurn: Number;
    duration: number;
}

export interface IHealBehaviour extends IActionBehaviour {
    type: "heal";
    healAmount: number;
}

export interface IRechargeBehaviour extends IActionBehaviour {
    type: "recharge";
    rechargeAmount: number;
}

export interface IShieldAbility extends IActionBehaviour {
    type: "shield";
    shieldAmount: number;
}
