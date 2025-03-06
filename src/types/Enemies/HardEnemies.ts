import {
    createAction,
    createAttack,
    createBuff,
    createDamageOverTime,
    createDebuff,
    createHeal
} from "../Actions/BehaviorFactories";
import {BuffStat} from "../Actions/Behaviours/BuffBehaviour";
import {createCharacter} from "../Character/Character";

export const Lich = createCharacter(
    "Lich",
    55,  // Health
    5,   // Attack Power
    3,   // Defense
    2,   // Health Regen
    4,   // Energy Regen
    [
        createAction("Dark Heal", [createHeal("Dark Heal", 8)], 3),
        createAction("Shadow Bolt", [createAttack("Shadow Bolt", 7)], 2),
        createAction(
            "Weaken",
            [createDebuff("Attack Down", BuffStat.Attack, -2, 2)],
            3
        )
    ]
);


export const cursedKnight = createCharacter(
    "Cursed Knight",
    80,
    12,
    8,
    3,
    2,
    [
        createAction("Dark Cleave", [createAttack("Dark Cleave", 10)], 5),
        createAction("Unholy Barrier", [createBuff("Defense Boost", BuffStat.Defense, 5, 3)], 4),
        createAction("Life Drain", [
            createAttack("Life Drain", 8),
            createHeal("Drain Heal", 6),
        ], 6),
        createAction("Cursed Slash", [
            createAttack("Cursed Slash", 9),
            createDebuff("Attack Down", BuffStat.Attack, -2, 2),
        ], 4), // Damages and weakens enemy Attack
        createAction("Unholy Fire", [
            createDamageOverTime("Burn", 3, 3),
        ], 5), // Applies burning to target
        createAction("Defiled Ground", [createAttack("AoE Corruption", 10)], 6), // AoE dark attack
        createAction("Armor Breaker", [
            createAttack("Heavy Slash", 12),
            createDebuff("Defense Down", BuffStat.Defense, -4, 3),
        ], 6),
    ]
);


export const dragonWhelp = createCharacter(
    "Dragon Whelp",
    70,
    15,
    6,
    1,
    3,
    [
        createAction("Fire Breath", [createAttack("Fire AoE", 12)], 6),
        createAction("Tail Swipe", [createAttack("Tail Swipe", 8)], 3),
        createAction("Wing Buffet", [createAttack("Wing Buffet", 6)], 2),
        createAction("Scorching Claw", [createAttack("Claw Strike", 10)], 4),
        createAction("Dragon Roar", [
            createDebuff("Fear", BuffStat.Attack, -4, 2),
        ], 3), // Temporarily lowers enemies’ attack
        createAction("Lava Burst", [
            createDamageOverTime("Lava Burn", 4, 3),
        ], 6), // Powerful burning effect
        createAction("Protective Scales", [
            createBuff("Defense Up", BuffStat.Defense, 5, 2),
        ], 4), // Temporarily increases defense
    ]
);


export const demonLord = createCharacter(
    "Demon Warlord",
    120,
    20,
    12,
    4,
    5,
    [
        createAction("Overpowering Strike", [createAttack("Strike", 20)], 6),
        createAction("War Cry", [createBuff("Attack Boost", BuffStat.Attack, 5, 3)], 5),
        createAction("Crushing Blow", [createAttack("Crushing Blow", 15)], 4),
        createAction("Dark Aura", [
            createDebuff("Defense Down", BuffStat.Defense, -3, 3),
        ], 3), // Weakens all enemies’ defense
        createAction("Chains of Despair", [
            createDebuff("Energy Drain", BuffStat.EnergyRegen, -2, 3),
        ], 4), // Reduces energy regen of enemies
        createAction("Earth Shatter", [
            createAttack("AoE Earthquake", 18),
        ], 6), // Heavy AoE damage
        createAction("Warlord's Resolve", [
            createBuff("Healing Aura", BuffStat.hpRegen, 5, 3),
        ], 5), // Heals self for 3 turns
    ]
);

export const HardEnemies = [cursedKnight, dragonWhelp, Lich, demonLord];