
import {createAction, createAttack, createBuff, createDebuff, createHeal} from "../Actions/BehaviorFactories";
import {BuffStat} from "../Actions/Behaviours/BuffBehaviour";
import {CharacterStats} from "../Character/CharacterStats";
import {Character, createCharacter} from "../Character/Character";


// Orc Warrior
export const orcWarrior = createCharacter(
    "Orc Warrior",
    50,
    8,
    4,
    2,
    1,
    [
        createAction("Cleave", [createAttack("Cleave", 7, 0)], 4),
        createAction("Enrage", [
            createBuff("Attack Boost", BuffStat.Attack, 3, 2),
            createDebuff("Defense Down", BuffStat.Defense, -2, 2),
        ], 3),
        createAction("Brutal Smash", [createAttack("Brutal Smash", 10, 0)], 5),
        createAction("Threaten", [
            createDebuff("Fear", BuffStat.Attack, -2, 2),
        ], 2), // Reduces enemy Attack for 2 turns
        createAction("Reckless Sprint", [
            createAttack("Sweeping Charge", 8, 0),
            createDebuff("Defense Down", BuffStat.Defense, -1, 1), // Lowers own defense after a reckless move
        ], 4),
    ]
);
export const eliteGuard = createCharacter(
    "Elite Guard",
    90,  // Health
    10,  // Attack Power
    10,  // Defense
    2,   // Health Regen
    2,   // Energy Regen
    [
        createAction("Defensive Stance", [createBuff("Defense Boost", BuffStat.Defense, 5, 2)], 4),
        createAction("Sword Thrust", [createAttack("Thrust", 10, 0)], 3),
        createAction("Shield Bash", [createAttack("Bash", 6, 0)], 2)
    ]
);




// Skeleton Fighter
export const skeletonFighter =createCharacter(
    "Skeleton Fighter",
    40,
    6,
    5,
    1,
    2,
    [
        createAction("Bone Slash", [createAttack("Bone Slash", 6, 0)], 2),
        createAction("Knockback", [
            createAttack("Shield Knockback", 4, 0),
            createDebuff("Defense Down", BuffStat.Defense, -1, 1),
        ], 3),
        createAction("Reassemble", [createHeal("Reassemble Heal", 5)], 3),
        createAction("Skeleton Guard", [
            createBuff("Skeleton Defense", BuffStat.Defense, 2, 2),
        ], 2),
        createAction("Sword Flourish", [
            createAttack("Wide Slash", 7, 0),
        ], 4), // Stronger AoE-like attack
    ]
);



// Bandit Leader
export const banditLeader = createCharacter(
    "Bandit Leader",
    60,
    9,
    5,
    2,
    3,
    [
        createAction("Ambush Slash", [createAttack("Ambush Slash", 10, 0)], 6),
        createAction("Call Reinforcements", [createAttack("Ally Strike", 8, 0)], 4),
        createAction("Taunt", [createDebuff("Aggro", BuffStat.Attack, 0, 1)], 2),
        createAction("Smoke Bomb", [
            createDebuff("Accuracy Down", BuffStat.Attack, -3, 1),
        ], 3), // Lowers enemy chance to hit
        createAction("Blade Flurry", [
            createAttack("Flurry Strike", 6, 0),
            createAttack("Flurry Strike", 6, 0),
        ], 5), // Hit twice with moderate damage
    ]
);

export const MediumEnemies = [orcWarrior, skeletonFighter, banditLeader];