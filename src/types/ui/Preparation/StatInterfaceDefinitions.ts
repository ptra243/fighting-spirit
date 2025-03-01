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
  boostAttack: number;
  boostDefence: number;
}