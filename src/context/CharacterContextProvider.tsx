import React, {createContext} from 'react';
import {Character} from '../types/Character/Character';
import {Action} from '../types/Actions/Action'
import {useBattleManager} from "./BattleManagerContext";


const CharacterContext = createContext<CharacterContextValue>(undefined);

interface CharacterContextValue {
    character: Character;
    isPlayer: boolean;
    updateChosenActions: (newChosenActions: Action[]) => void;
}

export const CharacterContextProvider: React.FC<{
    isPlayer: boolean;
    children: React.ReactNode;
}> = ({
          isPlayer,
          children
      }) => {
    const {
        playerState,
        aiState,
        setPlayer,
        setAI
    } = useBattleManager();


    const character = isPlayer ? playerState : aiState;

    const updateChosenActions = (newChosenActions: Action[]) => {
        const newCharacter = new Character({
            ...character,
            chosenActions: [...newChosenActions]
        });

        // Use the appropriate setter based on character type
        if (isPlayer) {
            setPlayer(newCharacter);
        } else {
            setAI(newCharacter);
        }
    };

    const value: CharacterContextValue = {
        character,
        isPlayer,
        updateChosenActions
    };

    return (
        <CharacterContext.Provider value={value}>
            {children}
        </CharacterContext.Provider>
    );

};
