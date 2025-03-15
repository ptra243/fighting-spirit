import {BuffBehaviour} from "../ActionEquipmentExports";
import {IBuffBehaviour} from "../Actions/Behaviours/BehaviourUnion";

export enum EquipmentType {
    WEAPON = 'WEAPON',
    ARMOR = 'ARMOR',
    ACCESSORY = 'ACCESSORY'
}

export interface Equipment {
    name: string;
    description: string;
    hitPointsBonus?: number;
    attackBonus?: number;
    defenseBonus?: number;
    hpRegenBonus?: number;
    energyRegenBonus?: number;
    energyBonus?: number;
    type: EquipmentType;
}

export interface WeaponParams {
    name: string;
    boostAttack?: number;
    boostDefence?: number;
    boostHitPoints?: number;
    buffs?: IBuffBehaviour[];
}

export interface Weapon extends Equipment {
    attackBonus: number;
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
    defenseBonus: number;
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
    effect?: string;
    type: EquipmentType.ACCESSORY;
}

export interface AccessoryEffect {
    name: string;
    description: string;
    onEquip?: () => void;
    onUnequip?: () => void;
}

interface EquipmentParams {
    name: string;
    description?: string;
    hitPointsBonus?: number;
    attackBonus?: number;
    defenseBonus?: number;
    hpRegenBonus?: number;
    energyRegenBonus?: number;
    energyBonus?: number;
}

export function createWeapon(params: EquipmentParams): Weapon {
    return {
        name: params.name,
        description: params.description || '',
        hitPointsBonus: params.hitPointsBonus || 0,
        attackBonus: params.attackBonus || 0,
        defenseBonus: params.defenseBonus || 0,
        hpRegenBonus: params.hpRegenBonus || 0,
        energyRegenBonus: params.energyRegenBonus || 0,
        energyBonus: params.energyBonus || 0,
        type: EquipmentType.WEAPON
    };
}

export function createArmor(params: EquipmentParams): Armor {
    return {
        name: params.name,
        description: params.description || '',
        hitPointsBonus: params.hitPointsBonus || 0,
        attackBonus: params.attackBonus || 0,
        defenseBonus: params.defenseBonus || 0,
        hpRegenBonus: params.hpRegenBonus || 0,
        energyRegenBonus: params.energyRegenBonus || 0,
        energyBonus: params.energyBonus || 0,
        type: EquipmentType.ARMOR
    };
}

export function createAccessory(params: EquipmentParams & { effect: string }): Accessory {
    return {
        name: params.name,
        description: params.description || '',
        hitPointsBonus: params.hitPointsBonus || 0,
        attackBonus: params.attackBonus || 0,
        defenseBonus: params.defenseBonus || 0,
        hpRegenBonus: params.hpRegenBonus || 0,
        energyRegenBonus: params.energyRegenBonus || 0,
        energyBonus: params.energyBonus || 0,
        type: EquipmentType.ACCESSORY,
        effect: params.effect
    };
}