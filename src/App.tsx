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
import {GameStage} from "./types/GameStageTypes";
import {ClassSelectionScreen} from "./components/ClassSelection/ClassSelectionScreen";
import {TravelScreen} from "./components/Travel/TravelScreen";
import {BattleManager} from "./BattleManager";


let character = new Character({
    name: "Knight",
    stats: new CharacterStats({
        maxHitPoints: 50,
        attack: 2,
        defence: 2,
        energyRegen: 2,
        energy: 1
    }),
    actions: [basicAttack(), basicAttack(), knightsValor()],
    sprite: 'knight.jpg'

});
// Add Sample Player Equipment and Actions
character = character.addEquipment(new Weapon({
    name: "Steel Sword",
    boostAttack: 5,
}));

const player = new Player(character,10);


export const App: React.FC = () => {
    const [log] = useState<string[]>([]);
    const [player, setPlayer] = useState<Player | null>(new Player(character,10));
    let gm = new GameManager(player, 10);
    const [gameManager, setGameManager] = useState<GameManager | null>(gm)
    const [battleManager, setBattleManager] = useState(gameManager.battleManager);

    const [gameStage, setGameStage] = useState<GameStage>('PREPARE');


    console.log('Component rendering, gameStage:', gameStage);


    // Callback to transition between game stages
    const handleStartBattle = () => {

        console.log("Battle start conditions:", battleManager.canStartBattle());

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

    const handleTravel = (selectedCard) => {
        const nextBattle = gameManager.loadNextBattle();

        setBattleManager(nextBattle);
        // setGameStage('TRAVEL');
        setGameStage('PREPARE')
    }

    const handleGameReset = () => {
        gameManager.resetGame();
        setBattleManager(gameManager.battleManager);
        setGameStage('CLASS_SELECTION');
    };

    const handlePostBattle = () => {
        if (battleManager && !battleManager.isPlayerVictorious()) {
            handleGameReset();
        } else {
            setGameStage('POST_BATTLE');
        }
    };


    const handleClassSelection = (character: Character) => {
        const newPlayer = new Player(character, 10); // Starting gold
        setPlayer(newPlayer);
        setGameStage('TRAVEL');
    };

    const handleTravelComplete = (updatedPlayer: Player) => {
        setPlayer(updatedPlayer);
        // const gameManager = new GameManager(updatedPlayer, 10);
        // setGameManager(gameManager);
        setGameStage('PREPARE');
    };


    return (
        <BattleManagerProvider manager={battleManager}>
            {/*{gameStage === 'CLASS_SELECTION' && (*/}
            {/*    <ClassSelectionScreen onClassSelected={handleClassSelection} />*/}
            {/*)}*/}

            {/*{gameStage === 'TRAVEL' && player && (*/}
            {/*    <TravelScreen*/}
            {/*        player={player}*/}
            {/*        onContinueToBattle={handleTravelComplete}*/}
            {/*    />*/}
            {/*)}*/}

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
                    onContinue={handleTravel}
                />
            )}
        </BattleManagerProvider>

    );
};