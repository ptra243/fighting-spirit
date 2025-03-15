// Factories.ts
import {Action, ActionConfig, ActionRequirement, getNextActionId} from "./Action";
import {AttackBehaviour, AttackScalingStat} from "./Behaviours/AttackBehaviour";
import {BuffBehaviour, BuffStat} from "./Behaviours/BuffBehaviour";
import {DamageOverTimeBehaviour} from "./Behaviours/DamageOverTimeBehaviour";
import {HealBehaviour} from "./Behaviours/HealBehaviour";
import {ShieldBehaviour} from "./Behaviours/ShieldBehaviour";
import {RechargeBehaviour} from "./Behaviours/RechargeBehaviour";
import {IActionBehaviour, IAttackBehaviour, IBuffBehaviour, IDamageOverTimeBehaviour, IHealBehaviour, IRechargeBehaviour, IShieldAbility} from "./Behaviours/BehaviourUnion";
import type {Character} from "../Character/Character";

export const createAttack = (name: string, damage: number, scale: AttackScalingStat = AttackScalingStat.Attack, scaledPercent: number = 100, ignoreDefence: boolean = false, energyCost: number = 0): ActionConfig => {
    const config: IAttackBehaviour = {
        type: "attack",
        name,
        damage,
        scale,
        scaledPercent,
        ignoreDefence,
        description: ''
    };
    const behaviour = new AttackBehaviour(config);
    return {
        id: getNextActionId(),
        name,
        behaviours: [behaviour],
        energyCost,
        description: behaviour.description,
        chargeTurns: 0,
        isPrecharge: true,
        triggers: []
    };
};

export const createBuff = (name: string, stat: BuffStat, amount: number, duration: number, energyCost: number = 0): ActionConfig => {
    const config: IBuffBehaviour = {
        type: "buff",
        name,
        buffType: stat,
        amount,
        duration,
        isSelfBuff: true,
        description: ''
    };
    const behaviour = new BuffBehaviour(config);
    return {
        id: getNextActionId(),
        name,
        behaviours: [behaviour],
        energyCost,
        description: behaviour.description,
        chargeTurns: 0,
        isPrecharge: true,
        triggers: []
    };
};

export const createDebuff = (name: string, stat: BuffStat, amount: number, duration: number, energyCost: number = 0): ActionConfig => {
    const config: IBuffBehaviour = {
        type: "buff",
        name,
        buffType: stat,
        amount,
        duration,
        isSelfBuff: false,
        description: ''
    };
    const behaviour = new BuffBehaviour(config);
    return {
        id: getNextActionId(),
        name,
        behaviours: [behaviour],
        energyCost,
        description: behaviour.description,
        chargeTurns: 0,
        isPrecharge: true,
        triggers: []
    };
};

export const createDamageOverTime = (name: string, damagePerTurn: number, duration: number, energyCost: number = 0): ActionConfig => {
    const config: IDamageOverTimeBehaviour = {
        type: "damageOverTime",
        name,
        damagePerTurn,
        duration,
        description: ''
    };
    const behaviour = new DamageOverTimeBehaviour(config);
    return {
        id: getNextActionId(),
        name,
        behaviours: [behaviour],
        energyCost,
        description: behaviour.description,
        chargeTurns: 0,
        isPrecharge: true,
        triggers: []
    };
};

export const createHeal = (name: string, healAmount: number, energyCost: number = 0): ActionConfig => {
    const config: IHealBehaviour = {
        type: "heal",
        name,
        healAmount,
        description: ''
    };
    const behaviour = new HealBehaviour(config);
    return {
        id: getNextActionId(),
        name,
        behaviours: [behaviour],
        energyCost,
        description: behaviour.description,
        chargeTurns: 0,
        isPrecharge: true,
        triggers: []
    };
};

export const createShield = (name: string, shieldAmount: number, energyCost: number = 0): ActionConfig => {
    const config: IShieldAbility = {
        type: "shield",
        name,
        shieldAmount,
        description: ''
    };
    const behaviour = new ShieldBehaviour(config);
    return {
        id: getNextActionId(),
        name,
        behaviours: [behaviour],
        energyCost,
        description: behaviour.description,
        chargeTurns: 0,
        isPrecharge: true,
        triggers: []
    };
};

export const createRecharge = (name: string, rechargeAmount: number, energyCost: number = 0): ActionConfig => {
    const config: IRechargeBehaviour = {
        type: "recharge",
        name,
        rechargeAmount,
        description: ''
    };
    const behaviour = new RechargeBehaviour(config);
    return {
        id: getNextActionId(),
        name,
        behaviours: [behaviour],
        energyCost,
        description: behaviour.description,
        chargeTurns: 0,
        isPrecharge: true,
        triggers: []
    };
};

export const createAction = (name: string, behaviours: IActionBehaviour[], energyCost: number = 0, chargeTurns: number = 0, isPrecharge: boolean = true): ActionConfig => {
    return {
        id: getNextActionId(),
        name,
        behaviours,
        energyCost,
        description: '',
        chargeTurns,
        isPrecharge,
        triggers: []
    };
};

