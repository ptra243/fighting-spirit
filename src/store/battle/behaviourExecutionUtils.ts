import { IActionBehaviour, IAttackBehaviour, IBuffBehaviour, IDamageOverTimeBehaviour, IHealBehaviour, IRechargeBehaviour, IShieldAbility } from '../../types/Actions/Behaviours/BehaviourUnion';
import { AttackBehaviour } from '../../types/Actions/Behaviours/AttackBehaviour';
import { BuffBehaviour } from '../../types/Actions/Behaviours/BuffBehaviour';
import { DamageOverTimeBehaviour } from '../../types/Actions/Behaviours/DamageOverTimeBehaviour';
import { HealBehaviour } from '../../types/Actions/Behaviours/HealBehaviour';
import { RechargeBehaviour } from '../../types/Actions/Behaviours/RechargeBehaviour';
import { ShieldBehaviour } from '../../types/Actions/Behaviours/ShieldBehaviour';
import type { Character } from '../../types/Character/Character';
import { characterUtils } from '../../types/Character/Character';

export function executeBehaviourFn(
  character: Character,
  target: Character,
  behaviour: IActionBehaviour
): [Character, Character] {
  switch (behaviour.type) {
    case "attack": {
      const attackConfig = behaviour as IAttackBehaviour;
      const attackBehaviour = new AttackBehaviour(attackConfig);
      return attackBehaviour.execute(character, target);
    }
    case "buff": {
      const buffConfig = behaviour as IBuffBehaviour;
      const buffBehaviour = new BuffBehaviour(buffConfig);
      return buffBehaviour.execute(character, target);
    }
    case "damageOverTime": {
      const dotConfig = behaviour as IDamageOverTimeBehaviour;
      const dotBehaviour = new DamageOverTimeBehaviour(dotConfig);
      return dotBehaviour.execute(character, target);
    }
    case "heal": {
      const healConfig = behaviour as IHealBehaviour;
      const healBehaviour = new HealBehaviour(healConfig);
      return healBehaviour.execute(character, target);
    }
    case "recharge": {
      const rechargeConfig = behaviour as IRechargeBehaviour;
      const rechargeBehaviour = new RechargeBehaviour(rechargeConfig);
      return rechargeBehaviour.execute(character, target);
    }
    case "shield": {
      const shieldConfig = behaviour as IShieldAbility;
      const shieldBehaviour = new ShieldBehaviour(shieldConfig);
      return shieldBehaviour.execute(character, target);
    }
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