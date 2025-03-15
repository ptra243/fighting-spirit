export interface StatItemProps {
    label: string;
    value: number;
}

export interface PreparationScreenProps {
    onStartBattle: () => void;
}

export interface ExpandableState {
    stats: boolean;
    equipment: boolean;
}

export interface ValidationState {
    errors: string[] | null;
    hasAttempted: boolean;
}

export interface Equipment {
    name: string;
    description: string;
    attackBonus?: number;
    defenseBonus?: number;
    hitPointsBonus?: number;
    hpRegenBonus?: number;
    energyRegenBonus?: number;
    energyBonus?: number;
    type: string;
}