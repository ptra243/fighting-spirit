import { IActionBehaviour } from '../types/Actions/Behaviours/BehaviourUnion';
import { AttackBehaviour } from '../types/Actions/Behaviours/AttackBehaviour';
import { Character, characterUtils } from '../types/Character/Character';

export function executeBehaviourFn(
  character: Character,
  target: Character,
  behaviour: IActionBehaviour
): [Character, Character] {
  switch (behaviour.type) {
    case "attack":
      return executeAttackBehaviour(character, target, behaviour as AttackBehaviour);

    // Other `IActionBehaviour` types you're using:
    // case "heal": return executeHealBehaviour(character, target, behaviour as HealBehaviour);
  
    default: 
      return [character, target];
  }
}

function executeAttackBehaviour(
  attacker: Character,
  target: Character,
  behaviour: AttackBehaviour
): [Character, Character] {
  const scaledStatValue = attacker.stats[behaviour.scale];
  const scaledDamage = Math.floor(scaledStatValue * behaviour.scaledPercent / 100);
  
  const totalDamage = behaviour.damage + scaledDamage;

  const updatedTarget = characterUtils
    .wrapCharacter(target)
    .takeDamage(totalDamage, attacker, behaviour.ignoreDefence)
    .build();
    
  return [attacker, updatedTarget];
}