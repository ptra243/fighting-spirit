import {useState, useEffect} from 'react';
import {BattleManagerProvider} from "./context/BattleManagerContext";
import React from 'react';
import {Character} from './types/Character/Character';
import {GameManager} from "./GameManagerLogic";
import {
    basicAttack,
    basicBlock, knightsMomentum,
    knightsValor,
    lacerate,
    powerStrike
} from "./types/Actions/PredefinedActions/KnightActions";
import {PreparationScreen} from "./components/Preparation/PreparationScreenComponent";
import {CharacterStats} from "./types/Character/CharacterStats";
import {BattleScreen} from "./components/Battle/BattleScreen";
import {Player} from "./types/Player/Player";
import {Weapon} from "./types/Equipment/EquipmentClassHierarchy";
import {BattleEndScreen} from "./components/BattleEndScreen/BattleEndScreen";


let character = new Character({
    name: "Knight",
    stats: new CharacterStats({
        maxHitPoints: 50,
        attack: 2,
        defence: 2,
        energyRegen: 2,
        energy: 1
    }),
    actions: [basicAttack(), basicAttack(), basicBlock(), knightsValor(), knightsMomentum(), lacerate(), powerStrike()],
    sprite: 'knight.jpg'

});
// Add Sample Player Equipment and Actions
character = character.addEquipment(new Weapon({
    name: "Steel Sword",
    boostAttack: 5,
}));

const player = new Player(character,10);

const gameManager = new GameManager(player, 10);// new BattleManager(player, ai);

export const App: React.FC = () => {
    const [log] = useState<string[]>([]);
    const [playerStats] = useState(gameManager.player);
    const [battleManager, setBattleManager] = useState(gameManager.battleManager);


    const [gameStage, setGameStage] = useState<'PREPARE' | 'BATTLE' | 'POST_BATTLE'>('PREPARE');


    // Callback to transition between game stages
    const handleStartBattle = () => {
        setGameStage('BATTLE');
        if (battleManager) {
            battleManager.startBattle();

            if (battleManager.isPlayerVictorious()) {
                gameManager.handleVictory();
                // setAiStats(gameManager.g); // Refresh AI for UI

            } else {
                gameManager.handleDefeat();
            }
        }

    }

    const handlePrepareNextBattle = (selectedCard) => {
        const nextBattle = gameManager.loadNextBattle();

        setBattleManager(nextBattle);
        setGameStage('PREPARE');
    }

    // Trigger.ts victory or defeat based on game state
    const prepareNextBattle = () => {
        setGameStage('PREPARE');
    };


    const handleGameReset = () => {
        gameManager.resetGame();
        setBattleManager(gameManager.battleManager);
        setGameStage('PREPARE');
    };

    const handlePostBattle = () => {
        if (battleManager && !battleManager.isPlayerVictorious()) {
            handleGameReset();
        } else {
            setGameStage('POST_BATTLE');
        }
    };

    return (
        <BattleManagerProvider manager={battleManager}>
            {gameStage === 'PREPARE' && (
                <PreparationScreen
                    onStartBattle={handleStartBattle}
                />
            )}

            {gameStage === 'BATTLE' && (
                <BattleScreen
                    onBattleEnd={handlePostBattle}
                />
            )}
            {gameStage === 'POST_BATTLE' && (
                <BattleEndScreen
                    onContinue={handlePrepareNextBattle}
                />
            )}
        </BattleManagerProvider>

    );
};