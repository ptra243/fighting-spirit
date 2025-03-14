import {BuffBehaviour} from "../ActionEquipmentExports";
import {IBuffBehaviour} from "../Actions/Behaviours/BehaviourUnion";

export enum EquipmentType {
    WEAPON = 'weapon',
    ARMOR = 'armor',
    ACCESSORY = 'accessory'
}

export interface Equipment {
    readonly name: string;
    readonly boostAttack: number;
    readonly boostDefence: number;
    readonly boostHitPoints: number;
    readonly buffs: IBuffBehaviour[];
    readonly type: EquipmentType;
}

export interface WeaponParams {
    name: string;
    boostAttack?: number;
    boostDefence?: number;
    boostHitPoints?: number;
    buffs?: IBuffBehaviour[];
}

export interface Weapon extends Equipment {
    type: EquipmentType.WEAPON;
}

export interface ArmorParams {
    name: string;
    boostDefence?: number;
    boostAttack?: number;
    boostHitPoints?: number;
    buffs?: IBuffBehaviour[];
}

export interface Armor extends Equipment {
    type: EquipmentType.ARMOR;
}

export interface AccessoryParams {
    name: string;
    boostAttack?: number;
    boostDefence?: number;
    boostHitPoints?: number;
    buffs?: IBuffBehaviour[];
}

export interface Accessory extends Equipment {
    type: EquipmentType.ACCESSORY;
}

export interface AccessoryEffect {
    name: string;
    description: string;
    onEquip?: () => void;
    onUnequip?: () => void;
}

// Factory functions to create equipment
export function createWeapon(params: WeaponParams): Weapon {
    return {
        name: params.name,
        boostAttack: params.boostAttack || 0,
        boostDefence: params.boostDefence || 0,
        boostHitPoints: params.boostHitPoints || 0,
        buffs: params.buffs || [],
        type: EquipmentType.WEAPON
    };
}

export function createArmor(params: ArmorParams): Armor {
    return {
        name: params.name,
        boostAttack: params.boostAttack || 0,
        boostDefence: params.boostDefence || 0,
        boostHitPoints: params.boostHitPoints || 0,
        buffs: params.buffs || [],
        type: EquipmentType.ARMOR
    };
}

export function createAccessory(params: AccessoryParams): Accessory {
    return {
        name: params.name,
        boostAttack: params.boostAttack || 0,
        boostDefence: params.boostDefence || 0,
        boostHitPoints: params.boostHitPoints || 0,
        buffs: params.buffs || [],
        type: EquipmentType.ACCESSORY
    };
}