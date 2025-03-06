// GameManager.ts
import {Character} from "./types/Character/Character";
import {BattleManager} from "./BattleManager";
import {EasyEnemies} from "./types/Enemies/EasyEnemies";
import {MediumEnemies} from "./types/Enemies/MediumEnemies";
import {HardEnemies} from "./types/Enemies/HardEnemies";
import {CharacterStats} from "./types/Character/CharacterStats";
import {Player} from "./types/Player/Player";
import _ from "lodash";
import {basicAttack, basicBlock} from "./types/Actions/PredefinedActions/KnightActions";

export class GameManager {
    player: Player;
    battleManager: BattleManager | null = null;
    currentBattle: number = 0;
    battles: number;

    constructor(updatedGameManager: Partial<GameManager>) {
        this.player = updatedGameManager.player || this.createNewPlayer(); // Persist player across battles
        this.battles = updatedGameManager.battles || 10; // Series of battles
        this.currentBattle = updatedGameManager.currentBattle || 0; // Series of battles
        this.battleManager = updatedGameManager.battleManager || this.loadNextBattle(); // Series of battles
        // this.loadNextBattle(); // Immediate start of the first battle
    }

    private createNewPlayer(): Player {

        let character = new Character({
            name: "Hero",
            stats: new CharacterStats({
                maxHitPoints: 50,
                attack: 2,
                defence: 2,
                energyRegen: 2,
                energy: 1,
                speed: 25,
                maxEnergy: 10,
                hpRegen: 1,
                chargesPerTurn: 1,

            }),
            actions: [basicAttack(), basicAttack(), basicBlock()],
            sprite: 'knight.jpg'
        });
        return new Player(character, 10);
    }

    // Create an AI opponent with a slight increase in difficulty each battle
    private createAI(): Character {
        const aiDifficultyFactor = this.currentBattle + 1;

        let chosenEnemy: Character;

        if (aiDifficultyFactor <= 3) {
            // Choose randomly from EasyEnemies
            chosenEnemy = EasyEnemies[Math.floor(Math.random() * EasyEnemies.length)];
        } else if (aiDifficultyFactor <= 6) {
            // Choose randomly from MediumEnemies
            chosenEnemy = MediumEnemies[Math.floor(Math.random() * MediumEnemies.length)];
        } else {
            // Choose randomly from HardEnemies
            chosenEnemy = HardEnemies[Math.floor(Math.random() * HardEnemies.length)];
        }

        // Scale the chosen enemy dynamically
        return this.scaleEnemy(chosenEnemy, aiDifficultyFactor);


    }

    scaleEnemy(enemy: Character, difficultyFactor: number): Character {
        // Create a copy of the enemy to avoid mutating the original
        // const scaledEnemy = _.cloneDeep(enemy);
        // Scaling logic
        const scalingMultiplier = 1 + (difficultyFactor * 0.1); // Scales stats by 10% per battle

        let updatedStats = new CharacterStats({
            hitPoints: Math.round(enemy.stats.hitPoints * scalingMultiplier),
            maxHitPoints: Math.round(enemy.stats.maxHitPoints * scalingMultiplier),
            attack: Math.round(enemy.stats.attack * scalingMultiplier),
            defence: Math.round(enemy.stats.defence * scalingMultiplier)
        });
        const baseStats = updatedStats.cloneWith({});
        //// TODO Optionally, scale abilities if needed
        // scaledEnemy.chosenActions = scaledEnemy.actions.map((action) => {
        //     const scaledAction = {...action};
        //     if (scaledAction.behaviours) {
        //         scaledAction.attack.damage = Math.round(scaledAction.attack.damage * scalingMultiplier);
        //     }
        //     return scaledAction;
        // });
        return new Character({...enemy, baseStats: baseStats, stats: updatedStats});
    }


    // Start a new battle
    loadNextBattle(): BattleManager {
        console.log(this.currentBattle)
        if (this.currentBattle >= this.battles) {
            console.log("Game over: All battles completed!");
            return;
        }

        this.currentBattle++;
        let ai = this.createAI();
        if (this.battleManager) {
            console.log(this.battleManager)
            this.battleManager.cleanup();
        }
        // Create a new BattleManager for this battle
        this.battleManager = new BattleManager(this.player.character, ai, this.currentBattle);

        // // Optional: Randomly select an AI action at the start
        // if (ai.actions.length > 0) {
        //     const randomAction = ai.actions[Math.floor(Math.random() * this.ai.actions.length)];
        //     ai.chosenActions.push(randomAction);
        // }

        // console.log(`Next opponent is loaded ${this.currentBattle}, ${JSON.stringify(ai)}`);
        return this.battleManager;
    }

    // Call this when the player wins
    handleVictory() {
        console.log(`Player won Battle ${this.currentBattle}`);
        // this.player.heal(999); // Reset player health (or partial restore)
        // this.startNewBattle(); // Go to the next battle
    }

    // Call this when the player loses
    handleDefeat() {
        console.log(`Player lost Battle ${this.currentBattle}`);
        console.log("Game over.");
        // Optionally reset the game or display a game-over screen
    }


    // Deletes saved game state
    resetGameState() {
        localStorage.removeItem("gameState");
        console.log("Saved game state cleared.");
    }


    resetGame(): GameManager {
        // Reset game state
        this.battleManager?.cleanup();
        return new GameManager({})
        // Load first battle
        // this.loadNextBattle();
    }

    updateCharacter = (character: Character) => {
        this.player.character = character;
        if (this.battleManager) {
            console.log('updated character in battlemanager')
            this.battleManager.player = character;
        }
        console.log(this.player.character);

    }

    updatePlayer(player: Player) {
        this.player = player;
    }

    cloneWith(updatedGame: Partial<GameManager>) {
        return _.cloneWith({...updatedGame});

    }
}