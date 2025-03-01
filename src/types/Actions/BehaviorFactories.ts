// Factories.ts
import { Action } from "./Action";
import { AttackBehaviour } from "./Behaviours/AttackBehaviour";
import {BuffBehaviour, BuffStat} from "./Behaviours/BuffBehaviour";
import { DamageOverTimeBehaviour } from "./Behaviours/DamageOverTimeBehaviour";
import { HealBehaviour } from "./Behaviours/HealBehaviour";
import {ShieldBehaviour} from "./Behaviours/ShieldAbility";
import {RechargeBehaviour} from "./Behaviours/RechargeBehaviour";

export const createAttack = (name: string, damage: number, chargeTime: number) => {
    return new AttackBehaviour(name, chargeTime, damage);
};

export const createBuff = (name: string, stat: BuffStat, amount: number, duration: number) => {
    return new BuffBehaviour(name, stat, amount, duration, true);
};
export const createDebuff= (name: string, stat: BuffStat, amount: number, duration: number) => {
    return new BuffBehaviour(name, stat, amount, duration, false);
};

export const createDamageOverTime = (name: string, damagePerTurn: number, duration: number) => {
    return new DamageOverTimeBehaviour(name, damagePerTurn, duration);
};

export const createHeal = (name: string, healAmount: number) => {
    return new HealBehaviour(name, healAmount);
};

export const createShield = (name: string, shieldAmount: number) => {
    return new ShieldBehaviour(name, shieldAmount);
};

export const createRecharge = (name: string, recharge: number) => {
    return new RechargeBehaviour(name, recharge);
};

export const createAction = (name: string, behaviors: any[], cost: number) => {
    return new Action(name, behaviors, cost);
};

