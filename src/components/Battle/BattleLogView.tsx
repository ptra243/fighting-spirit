// BattleLog.tsx
import React, { useEffect, useRef } from 'react';
import styles from './BattleLog.module.css';
import {BattleLog} from "../../types/Battle/BattleLog";

interface BattleLogProps {
    entries: BattleLog;
}

export const BattleLogView: React.FC<BattleLogProps> = ({ entries }) => {
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [entries]);

    const getEntryColor = (type: string): string => {
        switch (type) {
            case 'damage':
                return '#ff9999';
            case 'heal':
                return '#99ff99';
            case 'buff':
                return '#9999ff';
            case 'debuff':
                return '#ff99ff';
            case 'dot':
                return '#ffcc99';
            case 'death':
                return '#ff6666';
            default:
                return '#ffffff';
        }
    };

    return (
        <div className={styles.battleLog}>
            <div className={styles.battleLogContent} ref={logContainerRef}>
                {entries.getEntries().map((entry, index) => (
                    <div
                        key={index}
                        className={`${styles.logEntry} ${entry.type}`}
                        style={{
                            color: getEntryColor(entry.type)
                        }}
                    >
                        <span className={styles.turnNumber}>
                            [{entry.turn}]
                        </span>
                        <span className={styles.logMessage}>
                            {entry.message}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
