

// types/Preparation/PreparationEvent.ts
import {Player} from "../Player/Player";

export enum PreparationEventType {
    LEVEL_UP = 'LEVEL_UP',
    MODIFY_ACTION = 'MODIFY_ACTION',
    NEW_ACTION = 'NEW_ACTION',
    SHOP_WEAPON = 'SHOP_WEAPON',
    SHOP_ARMOR = 'SHOP_ARMOR',
    SHOP_ACCESSORY = 'SHOP_ACCESSORY'
}

export interface PreparationEvent {
    id: string;
    name: string;
    description: string;
    type: PreparationEventType;
    execute: (player: Player) => void;
}
