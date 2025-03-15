import {createAction, createAttack, createBuff, createDebuff, createHeal} from "../Actions/BehaviorFactories";
import {BuffStat} from "../Actions/Behaviours/BuffBehaviour";
import {createCharacter} from "../Character/Character";
import {createStats} from "../Character/CharacterStats";

// Orc Warrior
export const orcWarrior = createCharacter({
    name: "Orc Warrior",
    stats: createStats({
        hitPoints: 50,
        maxHitPoints: 50,
        attack: 8,
        defence: 4,
        hpRegen: 2,
        energyRegen: 1,
        energy: 15,
        maxEnergy: 15,
        shield: 0,
        speed: 25,
        chargesPerTurn: 1,
        actionCounter: 0
    }),
    equipment: [],
    chosenActions: [
        createAction("Cleave", createAttack("Cleave", 7).behaviours, 4),
        createAction("Enrage", [
            ...createBuff("Attack Boost", BuffStat.Attack, 3, 2).behaviours,
            ...createDebuff("Defense Down", BuffStat.Defense, -2, 2).behaviours,
        ], 3),
        createAction("Brutal Smash", createAttack("Brutal Smash", 10).behaviours, 5),
        createAction("Threaten", [
            ...createDebuff("Fear", BuffStat.Attack, -2, 2).behaviours,
        ], 2),
        createAction("Reckless Sprint", [
            ...createAttack("Sweeping Charge", 8).behaviours,
            ...createDebuff("Defense Down", BuffStat.Defense, -1, 1).behaviours,
        ], 4),
    ]
});

export const eliteGuard = createCharacter({
    name: "Elite Guard",
    stats: createStats({
        hitPoints: 90,
        maxHitPoints: 90,
        attack: 10,
        defence: 10,
        hpRegen: 2,
        energyRegen: 2,
        energy: 15,
        maxEnergy: 15,
        shield: 0,
        speed: 25,
        chargesPerTurn: 1,
        actionCounter: 0
    }),
    equipment: [],
    chosenActions: [
        createAction("Defensive Stance", createBuff("Defense Boost", BuffStat.Defense, 5, 2).behaviours, 4),
        createAction("Sword Thrust", createAttack("Thrust", 10).behaviours, 3),
        createAction("Shield Bash", createAttack("Bash", 6).behaviours, 2)
    ]
});

// Skeleton Fighter
export const skeletonFighter = createCharacter({
    name: "Skeleton Fighter",
    stats: createStats({
        hitPoints: 40,
        maxHitPoints: 40,
        attack: 6,
        defence: 5,
        hpRegen: 0,
        energyRegen: 2,
        energy: 15,
        maxEnergy: 15,
        shield: 0,
        speed: 25,
        chargesPerTurn: 1,
        actionCounter: 0
    }),
    equipment: [],
    chosenActions: [
        createAction("Bone Strike", createAttack("Bone Strike", 5).behaviours, 2),
        createAction("Reassemble", createHeal("Reassemble", 10).behaviours, 4),
        createAction("Death's Embrace", [
            ...createAttack("Death's Embrace", 8).behaviours,
            ...createDebuff("Life Drain", BuffStat.HPRegen, -1, 2).behaviours
        ], 5)
    ]
});

// Bandit Leader
export const banditLeader = createCharacter({
    name: "Bandit Leader",
    stats: createStats({
        hitPoints: 60,
        maxHitPoints: 60,
        attack: 9,
        defence: 5,
        hpRegen: 2,
        energyRegen: 3,
        energy: 15,
        maxEnergy: 15,
        shield: 0,
        speed: 25,
        chargesPerTurn: 1,
        actionCounter: 0
    }),
    equipment: [],
    chosenActions: [
        createAction("Ambush Slash", createAttack("Ambush Slash", 10).behaviours, 6),
        createAction("Call Reinforcements", createAttack("Ally Strike", 8).behaviours, 4),
        createAction("Taunt", createDebuff("Aggro", BuffStat.Attack, 0, 1).behaviours, 2),
        createAction("Smoke Bomb", [
            ...createDebuff("Accuracy Down", BuffStat.Attack, -3, 1).behaviours,
        ], 3),
        createAction("Blade Flurry", [
            ...createAttack("Flurry Strike", 6).behaviours,
            ...createAttack("Flurry Strike", 6).behaviours,
        ], 5)
    ]
});

export const MediumEnemies = [orcWarrior, skeletonFighter, banditLeader];