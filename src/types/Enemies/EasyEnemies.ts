import {Character, createCharacter} from "../Character/Character";
import {
    createAction,
    createAttack,
    createBuff,
    createDamageOverTime,
    createDebuff,
    createRecharge,
} from "../Actions/BehaviorFactories";
import { BuffStat } from "../Actions/Behaviours/BuffBehaviour";
import {CharacterStats} from "../Character/CharacterStats";


// Goblin Grunt
export const goblinGrunt = createCharacter(
    "Goblin Grunt",
    30,  // Health
    1,   // Attack Power
    0,   // Defense
    0,   // Health Regen
    1,   // Energy Regen
    [
        createAction("Rusty Stab", [createAttack("Rusty Stab", 3, 0)], 1), // Low energy cost stab
        createAction("Scavenge", [createRecharge("Scavenge", 2)], 2),     // Recharge energy
        createAction(
            "Weak Kick",
            [
                createAttack("Weak Kick", 2, 0),                             // Light attack
                createDebuff("Defense Down", BuffStat.Defense, -1, 1),       // Reduce defense for 1 turn
            ],
            3
        )
    ]
);

// Goblin Rogue
export const goblinRogue = createCharacter(
    "Goblin Rogue",
    35,  // Health
    2,   // Attack Power
    1,   // Defense
    1,   // Health Regen
    2,   // Energy Regen
    [
        createAction(
            "Poison Blade",
            [
                createAttack("Blade Attack", 1, 0),                          // Light attack
                createDamageOverTime("Poison", 1, 2),                        // Poison effect for 2 turns
            ],
            2
        ),
        createAction(
            "Evasive Sidestep",
            [createBuff("Dodge Boost", BuffStat.Defense, 2, 1)],             // Boost defense temporarily
            1
        ),
        createAction(
            "Quick Stab",
            [createAttack("Quick Stab", 3, 0)],                              // Moderate attack
            2
        )
    ]
);

// Export Easy Enemies as an array
export const EasyEnemies = [goblinGrunt, goblinRogue];
