import {
    createAction,
    createAttack,
    createBuff,
    createDamageOverTime,
    createHeal,
    createShield
} from "../BehaviorFactories";
import {BuffStat} from "../Behaviours/BuffBehaviour";

const heavySlash = createAction("Heavy Slash", [createAttack("Heavy Slash", 5)], 2);

const fireball = createAction("Fireball", [createAttack("Fireball", 10)], 2);

const healingLight = createAction("Healing Light", [createHeal("Healing Light", 5)], 2);

const defensiveStance = createAction("Defensive Stance", [
    createShield("Defensive Stance Shield", 5),
    createBuff("Defensive Stance Boost", BuffStat.Defense, 2, 3),
], 4);

const poisonArrow = createAction("Poison Arrow", [
    createDamageOverTime("Poison Strike", 1, 5)  // 1 damage over 5 turns
], 2);

const protectiveShield = createAction("Protective Shield", [createShield("Protective Shield", 10)], 3);
const chargedPierce = createAction("Charged Pierce", [createAttack("Charged Pierce", 15)], 2);

const berserkFury = createAction("Berserk Fury", [
    createBuff("Berserk Boost", BuffStat.Attack, 3, 3),
    createBuff("Berserk Penalty", BuffStat.Defense, -1, 3),
], 3);

// Export all actions as a single object for easy access
export const actions = {
    heavySlash,
    fireball,
    healingLight,
    poisonArrow,
    protectiveShield,
    defensiveStance,
    chargedPierce,
    berserkFury,
};
