import {Character, characterUtils} from './types/Character/Character';
import {BattleLog} from "./types/Battle/BattleLog";
import {AppDispatch} from "./store/store";
import {useDispatch} from "react-redux";
import { incrementActionCounter } from './store/characterSlice';

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

export class BattleManager {
    static readonly CONFIG: BattleConfig = {
        MAX_TURNS: 20,
        TURN_INTERVAL_MS: 100,
        STARTING_REQUIRED_ACTIONS: 3
    };

    // Battle state
    player: Character;
    ai: Character;
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


    constructor(player: Character, ai: Character, round: number) {
        const callbacks: LogCallbacks = {
            battleLog: this.logAction.bind(this),
            messageLog: this.addBattleLog.bind(this)
        };

        this.player = characterUtils.setLogCallback(player, callbacks);
        this.ai = characterUtils.setLogCallback(ai, callbacks);

        this.currentTurn = 'player';
        this.battleState = BattleState.NOT_STARTED;
        this.round = round;
        this.turnCount = 0;
        this.battleLog = new BattleLog();

        this.listeners = new Set();
        this.battleInterval = null;
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
        console.log(this.battleState);
        if (this.battleState !== BattleState.NOT_STARTED) {
            this.addBattleLog("Battle is already in progress or has ended.");
            return;
        }

        if (this.canStartBattle().length > 0) {
            return;
        }

        this.resetBattleState();
        this.initializeBattle();
        this.startBattleLoop();
    }

    public canStartBattle(): string[] {
        let errors: string [] = [];
        if (this.isAnyCharacterDefeated()) {
            errors.push("Battle cannot start as one or both characters are dead.");
        }
        if (this.player.chosenActions.length !== (BattleManager.CONFIG.STARTING_REQUIRED_ACTIONS + this.round - 1)) {
            errors.push(`The player needs to choose exactly ${BattleManager.CONFIG.STARTING_REQUIRED_ACTIONS + this.round - 1} actions.`);
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

        // Initialize player with equipment buffs
        this.player = characterUtils.applyOutOfBattleStats(this.player);
        // Initialize AI with equipment buffs
        this.ai = characterUtils.applyOutOfBattleStats(this.ai);

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
                return;
            }
            if (this.isAnyCharacterDefeated() || this.hasReachedMaxTurns()) {
                this.endBattle();
            }
            this.processTick();

            // Check victory conditions, etc.
        }, BattleManager.CONFIG.TURN_INTERVAL_MS);


    }

    private processTick(): void {
        // Increment action counters for both characters

        const dispatch = useDispatch<AppDispatch>();

        dispatch(incrementActionCounter({ target: 'player' }));
        dispatch(incrementActionCounter({ target: 'ai' }));


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
    }

    private executePlayerTurn() {
        this.currentTurn = 'player'
        this.executeTurn(this.player, this.ai);
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

        this.executeAction(updatedAttacker, defender);

        this.turnCount++;
        this.notify();
    }


    private applyStartOfTurnEffects(character: Character): Character {
        return characterUtils.applyStartOfTurnEffects(character);
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
            this.player = attacker;
            this.ai = defender;
        } else {
            this.ai = attacker;
            this.player = defender;
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
        return this.turnCount >= BattleManager.CONFIG.MAX_TURNS * this.round;
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
