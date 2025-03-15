import { AttackBehaviour } from './AttackBehaviour';
import { HealBehaviour } from './HealBehaviour';
import { Character } from '../../Character/Character';
import { AttackScalingStat } from './AttackBehaviour';
import { BuffStat } from './BuffBehaviour';
import { TriggerManager } from '../Triggers/TriggerManager';

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
    scale: AttackScalingStat;
    scaledPercent: number;
    ignoreDefence: boolean;
}

export interface IBuffBehaviour extends IActionBehaviour {
    type: "buff";
    buffType: BuffStat;
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
