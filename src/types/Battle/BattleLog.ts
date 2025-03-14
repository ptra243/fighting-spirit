// types/Battle/BattleLog.ts
export interface BattleLogEntry {
    turn: number;
    message: string;
    type: 'damage' | 'heal' | 'buff' | 'debuff' | 'dot' | 'death' | 'action';
    value?: number;
    source: string;
    target: string;
}

export class BattleLog {
    private entries: BattleLogEntry[] = [];
    private currentTurn: number = 1;

    constructor(initialEntries: BattleLogEntry[]) {
        this.entries.push(...initialEntries);
    }

    addEntry(entry: Omit<BattleLogEntry, 'turn'>) {
        this.entries.push({
            ...entry,
            turn: this.currentTurn
        });
    }

    addSimpleMessage(message: string) {
        this.entries.push({
            turn: this.currentTurn,
            message,
            type: 'action',
            source: 'System',
            target: 'System'
        });
    }

    nextTurn() {
        this.currentTurn++;
    }

    getEntries(): BattleLogEntry[] {
        return [...this.entries];
    }

    getSummary() {

        const summary = {
            totalDamageDealt: 0,
            totalHealing: 0,
            longestBuff: 0,
            mostDamageInOneTurn: 0,
            totalTurns: this.currentTurn,
            killingBlow: this.entries.find(e => e.type === 'death'),
        };

        const turnDamage = new Map<number, number>();

        this.entries.forEach(entry => {
            if (entry.type === 'damage' && entry.value) {
                summary.totalDamageDealt += entry.value;

                const currentTurnDamage = turnDamage.get(entry.turn) || 0;
                turnDamage.set(entry.turn, currentTurnDamage + entry.value);
            }

            if (entry.type === 'heal' && entry.value) {
                summary.totalHealing += entry.value;
            }

            if (entry.type === 'buff' && entry.value) {
                summary.longestBuff = Math.max(summary.longestBuff, entry.value);
            }
        });

        summary.mostDamageInOneTurn = Math.max(...Array.from(turnDamage.values()));

        return summary;

    }

    clear() {
        this.entries = [];
        this.currentTurn = 1;
    }
}