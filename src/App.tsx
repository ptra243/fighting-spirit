import React, {useState} from 'react';
import {BattleManagerProvider} from "./context/BattleManagerContext";
import {Character} from './types/Character/Character';
import {GameManager} from "./GameManagerLogic";
import {PreparationScreen} from "./components/Preparation/PreparationScreenComponent";
import {BattleScreen} from "./components/Battle/BattleScreen";
import {Player} from "./types/Player/Player";
import {BattleEndScreen} from "./components/BattleEndScreen/BattleEndScreen";
import {GameStage} from "./types/GameStageTypes";
import {TravelScreen} from "./components/Travel/TravelScreen";
import {GameManagerProvider} from "./context/GameManagerContextProvider";


export const App: React.FC = () => {
    const [log] = useState<string[]>([]);
    let gm = new GameManager({});
    const [gameManager, setGameManager] = useState<GameManager>(gm)
    const [player, setPlayer] = useState<Player | null>(gm.player);
    const [battleManager, setBattleManager] = useState(gameManager.battleManager);

    const [gameStage, setGameStage] = useState<GameStage>('TRAVEL');


    console.log('Component rendering, gameStage:', gameStage);


    // Callback to transition between game stages
    const handleStartBattle = () => {

        if (battleManager.canStartBattle().length == 0) {
            setGameStage('BATTLE');
            if (battleManager) {
                console.log(battleManager.player.classes);
                battleManager.startBattle();

                // if (battleManager.isPlayerVictorious()) {
                //     gameManager.handleVictory();
                //     // setAiStats(gameManager.g); // Refresh AI for UI
                //
                // } else {
                //     gameManager.handleDefeat();
                // }
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

    const handleTravelComplete = () => {
        //
        // setPlayer(updatedPlayer);
        // const gameManager = new GameManager(updatedPlayer, 10);
        // setGameManager(gameManager);
        setGameStage('PREPARE');
    };


    return (
        <GameManagerProvider gameManager={gameManager}>
            <BattleManagerProvider manager={battleManager}>
                {/*{gameStage === 'CLASS_SELECTION' && (*/}
                {/*    <ClassSelectionScreen onClassSelected={handleClassSelection} />*/}
                {/*)}*/}

                {gameStage === 'TRAVEL' && player && (
                    <TravelScreen
                        onContinueToBattle={handleTravelComplete}
                    />
                )}

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
        </GameManagerProvider>
    );
};