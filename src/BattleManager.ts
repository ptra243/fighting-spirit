import {Character, characterUtils} from './types/Character/Character';
import {BattleLog} from "./types/Battle/BattleLog";
import {AppDispatch, RootState} from "./store/types";
import {incrementActionCounter, setAICharacter, setPlayerCharacter} from './store/character/characterSlice';
import {setLogCallback} from "./store/character/characterThunks";
import {selectAICharacter, selectPlayerCharacter} from "./store/character/characterSelectors";

type TurnState = 'player' | 'ai';
type BattleListener = () => void;

export interface LogCallbacks {
    battleLog: <T extends Named>(source: T, type: string, value: number, target: Character) => void;
    messageLog: (message: string) => void;
}

export enum BattleState {
    NOT_STARTED,
    IN_PROGRESS,
    ENDED
}

interface BattleConfig {
    readonly MAX_TURNS: number;
    readonly TURN_INTERVAL_MS: number;
    readonly STARTING_REQUIRED_ACTIONS: number;
}


// Create a common interface for entities with names
export interface Named {
    name: string;
}
export interface BattleManagerConfig{
    battleConfig: BattleConfig,
    round: number,
    isPaused: boolean
}
export class BattleManager {
    private config: BattleConfig = {
        MAX_TURNS: 20,
        TURN_INTERVAL_MS: 100,
        STARTING_REQUIRED_ACTIONS: 3
    };

    // Battle state
    // player: Character;
    // ai: Character;
    private currentTurn: TurnState;
    private battleState: BattleState;

    private round: number;
    private turnCount: number;

    // Battle logging
    private battleLog: BattleLog;

    private listeners: Set<BattleListener>;

    // Battle control
    private battleInterval: NodeJS.Timeout | null;
    private isPaused: boolean = false;
    dispatch: AppDispatch;
    private readonly getState: () => RootState;

    constructor( round: number,
                dispatch: AppDispatch,
                getState: () => RootState
    ) {
        const callbacks: LogCallbacks = {
            battleLog: this.logAction.bind(this),
            messageLog: this.addBattleLog.bind(this)
        };
        // Simply use the passed parameters instead of useSelector
        this.getState = getState;

        this.dispatch = dispatch;
        dispatch(setLogCallback(callbacks));

        this.currentTurn = 'player';
        this.battleState = BattleState.NOT_STARTED;
        this.round = round;
        this.turnCount = 0;
        this.battleLog = new BattleLog();

        this.listeners = new Set();
        this.battleInterval = null;
    }

    // Use getters to always get fresh state
    get player(): Character {
        return selectPlayerCharacter(this.getState());
    }

    get ai(): Character {
        return selectAICharacter(this.getState());
    }

    private logAction<T extends Named>(source: T,
                                       type: string, value: number, target: Character) {
        this.battleLog.addEntry({
            message: `${source.name} ${type} ${value} to ${target.name}`,
            type: type as any, // You might want to create a proper type mapping here
            value: value,
            source: source.name,
            target: target.name
        });
        this.notify();
    }


    public subscribe(listener: BattleListener): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    public unsubscribe(listener: BattleListener): void {
        this.listeners.delete(listener);
    }

    public startBattle(): void {
        if (this.battleState !== BattleState.NOT_STARTED) {
            this.addBattleLog("Battle is already in progress or has ended.");
            return;
        }

        if (this.canStartBattle().length > 0) {
            return;
        }
        console.log('no problems starting battle')
        this.resetBattleState();
        console.log('reset battle state')
        this.initializeBattle();
        console.log('init battle')
        this.startBattleLoop();
        console.log('looped')
    }

    public canStartBattle(): string[] {
        let errors: string [] = [];
        if (this.isAnyCharacterDefeated()) {
            errors.push("Battle cannot start as one or both characters are dead.");
        }
        if (this.player.chosenActions.length !== (this.config.STARTING_REQUIRED_ACTIONS + this.round)) {
            errors.push(`The player needs to choose exactly ${this.config.STARTING_REQUIRED_ACTIONS + this.round - 1} actions.`);
        }
        return errors;
    }

    private resetBattleState(): void {
        this.turnCount = 0;
        this.currentTurn = 'player';
        this.battleLog.clear();

    }

    private initializeBattle(): void {
        this.clearExistingBattleInterval();
        this.battleState = BattleState.IN_PROGRESS;
        this.addBattleLog('Battle started!');

        this.dispatch(setPlayerCharacter(characterUtils.wrapCharacter(this.player).applyOutOfBattleStats().build()));
        this.dispatch(setAICharacter(characterUtils.wrapCharacter(this.ai).applyOutOfBattleStats().build()));
    }

    // Add these new methods
    public pauseBattle(): void {
        if (this.battleState === BattleState.IN_PROGRESS) {
            this.isPaused = true;
            this.clearExistingBattleInterval();
            this.addBattleLog("Battle paused");
            this.notify();
        }
    }

    public resumeBattle(): void {
        if (this.battleState === BattleState.IN_PROGRESS && this.isPaused) {
            this.isPaused = false;
            this.startBattleLoop();
            this.addBattleLog("Battle resumed");
            this.notify();
        }
    }

    public togglePause(): void {
        if (this.isPaused) {
            this.resumeBattle();
        } else {
            this.pauseBattle();
        }
    }

    public isPausedState(): boolean {
        return this.isPaused;
    }


    private startBattleLoop(): void {

        this.battleInterval = setInterval(() => {
            // Check pause state first
            if (this.isPaused) {
                console.log('is paused')
                return;
            }
            if (this.isAnyCharacterDefeated() || this.hasReachedMaxTurns()) {
                this.endBattle();
            }
            console.log('about to process tick')
            this.processTick();

            // Check victory conditions, etc.
        }, this.config.TURN_INTERVAL_MS);


    }

    private processTick(): void {
        // Increment action counters for both characters

        try {
            console.log('Before dispatches, player counter:', this.player.stats.actionCounter);

            this.dispatch(incrementActionCounter({target: 'player'}));
            console.log('After player dispatch');

            this.dispatch(incrementActionCounter({target: 'ai'}));
            console.log('After AI dispatch');

            const playerCounter = this.player.stats.actionCounter;
            console.log('Retrieved player counter:', playerCounter);

            const aiCounter = this.ai.stats.actionCounter;
            console.log('Retrieved AI counter:', aiCounter);

            console.log({
                description: 'incremented counter',
                playerCounter,
                aiCounter
            });
        } catch (error) {
            console.error('Error in increment counter block:', error);
        }


        // Check if any character can act
        if (this.player.stats.actionCounter >= 100 || this.ai.stats.actionCounter >= 100) {
            this.processActions();
        }
        this.notify();
    }

    private processActions(): void {
        if (this.player.stats.actionCounter < 100 && this.ai.stats.actionCounter < 100) {
            return; // No one is ready to act
        }

        const bothReady = this.player.stats.actionCounter >= 100 && this.ai.stats.actionCounter >= 100;

        if (bothReady) {
            if (this.ai.stats.actionCounter > this.player.stats.actionCounter) {
                this.executeAITurn();
                this.executePlayerTurn();
            } else {
                this.executePlayerTurn(); // Player goes first on ties
                this.executeAITurn();
            }
        } else if (this.player.stats.actionCounter >= 100) {
            this.executePlayerTurn();
        } else {
            this.executeAITurn();
        }
    }

    private executeAITurn() {
        this.currentTurn = 'ai'
        this.executeTurn(this.ai, this.player);

        this.dispatch(setPlayerCharacter(characterUtils.wrapCharacter(this.player).applyOutOfBattleStats().build()));
        this.dispatch(setAICharacter(characterUtils.wrapCharacter(this.ai).applyOutOfBattleStats().build()));
    }

    private executePlayerTurn() {
        this.currentTurn = 'player'
        this.executeTurn(this.player, this.ai);

        this.dispatch(setPlayerCharacter(characterUtils.wrapCharacter(this.player).applyOutOfBattleStats().build()));
        this.dispatch(setAICharacter(characterUtils.wrapCharacter(this.ai).applyOutOfBattleStats().build()));
    }

    private executeTurn(attacker: Character, defender: Character): void {
        if (this.battleState !== BattleState.IN_PROGRESS) {
            throw new Error('Battle is not in progress.');
        }

        if (this.isAnyCharacterDefeated()) {
            this.handleGameOver();
            return;
        }

        this.battleLog.nextTurn();
        // const [attacker, defender] = this.getAttackerAndDefender();
        const updatedAttacker = this.applyStartOfTurnEffects(attacker)
        if (updatedAttacker.stats.hitPoints <= 0) {
            this.handleGameOver();
            return;
        }
        //update for the UI after start of turn effects
        if (this.currentTurn == 'player') {
            this.dispatch(setPlayerCharacter(characterUtils.wrapCharacter(this.player).applyOutOfBattleStats().build()));
        } else {
            this.dispatch(setAICharacter(characterUtils.wrapCharacter(this.ai).applyOutOfBattleStats().build()));
        }
        this.executeAction(updatedAttacker, defender);

        this.turnCount++;
        this.notify();
    }


    private applyStartOfTurnEffects(character: Character): Character {
        return characterUtils.wrapCharacter(character).applyStartOfTurnEffects().build();
    }

    private executeAction(attacker: Character, defender: Character): void {
        const currentAction = attacker.chosenActions[attacker.currentAction];

        if (!currentAction) {
            throw new Error(`No action found for ${attacker.name} at index ${attacker.currentAction}`);
        }

        try {
            const [updatedAttacker, updatedDefender] = currentAction.execute(attacker, defender);
            this.updateCharacterState(updatedAttacker, updatedDefender);
        } catch (error) {
            this.addBattleLog(`Error executing action: ${error.message}`);
            this.endBattle();
        }
    }

    private updateCharacterState(attacker: Character, defender: Character): void {
        if (this.currentTurn === 'player') {
            this.dispatch(setPlayerCharacter(attacker));
            this.dispatch(setAICharacter(defender));

        } else {
            this.dispatch(setPlayerCharacter(defender));
            this.dispatch(setAICharacter(attacker));
        }

        if (defender.stats.hitPoints <= 0) {
            this.addBattleLog(`${defender.name} has been defeated! ${attacker.name} wins!`);
            this.endBattle();
        } else {
            this.switchTurn();
        }
    }

    private handleGameOver(): void {
        this.battleState = BattleState.ENDED;

        if (this.player.stats.hitPoints > this.ai.stats.hitPoints) {
            if (this.ai.stats.hitPoints == 0)
                this.addBattleLog(`Player wins! ${this.ai.name} has been defeated`);
            else
                this.addBattleLog(`Player wins! ${this.ai.name} has run away!`);
        } else if (this.ai.stats.hitPoints > this.player.stats.hitPoints) {
            if (this.player.stats.hitPoints == 0)
                this.addBattleLog(`AI wins! ${this.player.name} has been defeated`);
            else
                this.addBattleLog(`AI wins! ${this.player.name} has run away!`);

        } else {
            this.addBattleLog("It's a draw!");
        }
    }

    private isAnyCharacterDefeated(): boolean {
        return this.player.stats.hitPoints <= 0 || this.ai.stats.hitPoints <= 0;
    }

    private hasReachedMaxTurns(): boolean {
        return this.turnCount >= this.config.MAX_TURNS * this.round;
    }

    private clearExistingBattleInterval(): void {
        if (this.battleInterval) {
            clearInterval(this.battleInterval);
            this.battleInterval = null;
        }
    }

    public cleanup(): void {
        this.clearExistingBattleInterval();
        this.listeners.clear();
        this.battleState = BattleState.ENDED;
    }

    private endBattle(): void {
        this.clearExistingBattleInterval();
        this.handleGameOver();
        this.battleState = BattleState.ENDED;
    }

    private notify(): void {
        this.listeners.forEach(listener => {
            try {
                listener();
            } catch (error) {
                console.error('Error in battle listener:', error);
            }
        });
    }

    private switchTurn(): void {
        this.currentTurn = this.currentTurn === 'player' ? 'ai' : 'player';
    }

// Replace existing addBattleLog with:
    private addBattleLog(message: string | string[]): void {
        const messages = Array.isArray(message) ? message : [message];
        messages.forEach(msg => {
            this.battleLog.addSimpleMessage(msg);
            console.log(msg);
        });
        this.notify();
    }

    // Add getter for battle log
    public getBattleLog(): BattleLog {
        return this.battleLog;
    }


    public isPlayerVictorious(): boolean {
        return this.ai.stats.hitPoints < this.player.stats.hitPoints;
    }

// Getter for battleState
    getBattleState(): BattleState {
        return this.battleState;
    }

    getRound() {
        return this.round;
    }

    getWinner() {
        return this.isPlayerVictorious() ? this.player : this.ai;
    }
}
