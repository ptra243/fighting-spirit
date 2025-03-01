// src/types/Actions/ActionPool.ts
import { Action, ActionRequirement } from "./Action";
import { CharacterClass } from "../Classes/CharacterClass";

export class ActionPool {
    private static readonly pools: Map<string, Action[]> = new Map();

    public static registerClassActions(className: string, actions: Action[]): void {
        this.pools.set(className, actions);
    }

    public static getClassActions(className: string): Action[] {
        return this.pools.get(className) || [];
    }

    public static meetsRequirement(action: Action, classes: CharacterClass[]): boolean {
        if (!action.requirement) return true;
        
        const requiredClass = classes.find(c => 
            c.getName() === action.requirement?.className
        );

        if (!requiredClass) return false;

        return requiredClass.getLevel() >= action.requirement.level;
    }

    public static getAvailableActions(classes: CharacterClass[]): Action[] {
        const allClassActions = classes.flatMap(characterClass => 
            this.getClassActions(characterClass.getName())
        );

        return allClassActions.filter(action => 
            this.meetsRequirement(action, classes)
        );
    }

    // Helper method to get actions that will be available at next level
    public static getUpcomingActions(classes: CharacterClass[]): Action[] {
        const allClassActions = classes.flatMap(characterClass => 
            this.getClassActions(characterClass.getName())
        );

        return allClassActions.filter(action => {
            if (!action.requirement) return false;
            
            const requiredClass = classes.find(c => 
                c.getName() === action.requirement?.className
            );

            if (!requiredClass) return false;

            const currentLevel = requiredClass.getLevel();
            return action.requirement.level === currentLevel + 1;
        });
    }
}