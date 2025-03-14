import { AttackBehaviour } from './AttackBehaviour';
import { HealBehaviour } from './HealBehaviour';

export type BehaviourType = 'attack' | 'heal' | 'buff' | 'damageOverTime' | 'recharge' | 'shield';

export interface IActionBehaviour {
  type: BehaviourType;
  name: string;
  description: string;
}

export type ActionBehaviour = AttackBehaviour | HealBehaviour;

export interface IAttackBehaviour extends IActionBehaviour {
    type: "attack";
    damage: number;
}

export interface IBuffBehaviour extends IActionBehaviour {
    type: "buff";
    buffType: string;
    amount: number;
    duration: number;
    isSelfBuff: boolean;
}

export interface IDamageOverTimeBehaviour extends IActionBehaviour {
    type: "damageOverTime";
    damagePerTurn: number;
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
