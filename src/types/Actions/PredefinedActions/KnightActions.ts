import {
    createAction,
    createAttack,
    createBuff,
    createDamageOverTime,
    createRecharge,
    createShield
} from "../BehaviorFactories";
import {BuffStat} from "../Behaviours/BuffBehaviour";

//Low Cost
export const basicAttack = () => createAction("Basic Slash", createAttack("Basic Slash", 1).behaviours, 1)
export const basicBlock = () => createAction("Basic Block", createShield("Basic Block", 5).behaviours, 2);

export const quickSlash = () => createAction("Quick Slash", createAttack("Quick Slash", 3).behaviours, 1);

export const raiseShield = () => createAction("Shield Block", createShield("Raise Shield", 5).behaviours, 2);
export const defensiveShove = () => createAction("Defensive Shove", [
    ...createAttack("Shove", 2).behaviours,
    ...createBuff("Guard Up", BuffStat.Defense, 1, 1).behaviours,
], 2);
//Medium Cost
export const powerStrike = () => createAction("Powerful Strike", [
    ...createAttack("Power Strike", 8).behaviours,
], 3);
//Medium Cost
export const lacerate = () => createAction("Lacerate", [
    ...createAttack("Lacerate", 3).behaviours,
    ...createDamageOverTime("Lacerate", 3, 3).behaviours,
], 3);


export const knightsValor = () => createAction("Knight's Valor", [
    ...createBuff("Self Defense Boost", BuffStat.Defense, 2, 3).behaviours,
    ...createBuff("Self Attack Boost", BuffStat.Attack, 3, 3).behaviours,
], 3);

export const chargingShieldBash = () => createAction("Charging Shield Bash", [
    ...createAttack("Shield Bash", 6).behaviours,
    ...createBuff("Enemy Weakness", BuffStat.Defense, -1, 1).behaviours,
], 3);

export const knightsMomentum = () => createAction("Knight's Momentum", [
    ...createBuff("Knights Momentum", BuffStat.Energy, 3, 3).behaviours,
    ...createBuff("Knights Momentum", BuffStat.Attack, 2, 2).behaviours], 2)

//High Cost
export const whirlwindOfSteel = () => createAction("Whirlwind of Steel", [
    ...createAttack("AoE Slash", 10).behaviours,
], 6);

export const lastStand = () => createAction("Last Stand", [
    ...createBuff("Attack Surge", BuffStat.Attack, 3, 3).behaviours,
    ...createBuff("Iron Defense", BuffStat.Defense, 4, 3).behaviours,
], 6);

export const battleCry = () => createAction("Battle Cry", [
    ...createBuff("Battle Cry", BuffStat.Energy, 2, 3).behaviours,
], 1);

export const basicRecharge = () => createAction("Basic Recharge", [
    ...createRecharge("Second Wind", 2).behaviours,
], 1);
export const secondWind = () => createAction("Second Wind", [
    ...createRecharge("Second Wind", 5).behaviours,
], 2);
