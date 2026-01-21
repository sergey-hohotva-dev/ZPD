// === СИСТЕМА КОЛЛИЗИЙ ===

function checkCollision(agentA, agentB) {
  return agentA.x < agentB.x + agentB.size &&
         agentA.x + agentA.size > agentB.x &&
         agentA.y < agentB.y + agentB.size &&
         agentA.y + agentA.size > agentB.y;
}

function resolveCollision(agentA, agentB) {
  collisionCount++;
  
  agentA.collisionCooldown = 15;
  agentB.collisionCooldown = 15;
  agentA.isColliding = true;
  agentB.isColliding = true;
  
  const isFriendlyCollision = agentA.type === agentB.type;
  
  let damageA = 0;
  let damageB = 0;
  
  if (!isFriendlyCollision) {
    if (agentA.type === 'hunter' && agentB.type === 'runner') {
      const strength = agentA.genes.strength || 50;
      damageB = CONFIG.COLLISION_DAMAGE * CONFIG.ENEMY_DAMAGE_MULTIPLIER * (1 + geneToMultiplier(strength));
      
      const agility = agentB.genes.agility || 50;
      if (Math.random() < geneToMultiplier(agility) * 0.5) {
        damageB *= 0.5;
      }
      
      // Проверяем, убил ли охотник бегуна
      if (agentB.health <= damageB) {
        agentA.killCount++;
        console.log(`Охотник убил бегуна! Всего убийств: ${agentA.killCount}`);
      }
    } else if (agentB.type === 'hunter' && agentA.type === 'runner') {
      const strength = agentB.genes.strength || 50;
      damageA = CONFIG.COLLISION_DAMAGE * CONFIG.ENEMY_DAMAGE_MULTIPLIER * (1 + geneToMultiplier(strength));
      
      const agility = agentA.genes.agility || 50;
      if (Math.random() < geneToMultiplier(agility) * 0.5) {
        damageA *= 0.5;
      }
      
      // Проверяем, убил ли охотник бегуна
      if (agentA.health <= damageA) {
        agentB.killCount++;
        console.log(`Охотник убил бегуна! Всего убийств: ${agentB.killCount}`);
      }
    }
    
    agentA.collisionColor = '#ff0000';
    agentB.collisionColor = '#ff0000';
  } else {
    damageA = CONFIG.COLLISION_DAMAGE * CONFIG.FRIENDLY_DAMAGE_MULTIPLIER;
    damageB = CONFIG.COLLISION_DAMAGE * CONFIG.FRIENDLY_DAMAGE_MULTIPLIER;
    
    if (agentA.type === 'hunter') {
      const aggressionA = agentA.genes.aggression || 50;
      const aggressionB = agentB.genes.aggression || 50;
      
      damageA *= (1 + geneToMultiplier(aggressionB) * 0.3);
      damageB *= (1 + geneToMultiplier(aggressionA) * 0.3);
    } else {
      const fearA = agentA.genes.fear || 50;
      const fearB = agentB.genes.fear || 50;
      
      damageA *= (1 - geneToMultiplier(fearB) * 0.2);
      damageB *= (1 - geneToMultiplier(fearA) * 0.2);
    }
    
    agentA.collisionColor = '#ffff00';
    agentB.collisionColor = '#ffff00';
  }
  
  agentA.health -= damageA;
  agentB.health -= damageB;
  
  const centerAX = agentA.x + agentA.size / 2;
  const centerAY = agentA.y + agentA.size / 2;
  const centerBX = agentB.x + agentB.size / 2;
  const centerBY = agentB.y + agentB.size / 2;
  
  const dx = centerBX - centerAX;
  const dy = centerBY - centerAY;
  const distance = Math.sqrt(dx * dx + dy * dy) || 1;
  
  const nx = dx / distance;
  const ny = dy / distance;
  
  const minDistance = agentA.size / 2 + agentB.size / 2;
  const overlap = minDistance - distance;
  
  if (overlap > 0) {
    const pushForce = isFriendlyCollision ? 0.5 : 0.7;
    
    agentA.x -= nx * overlap * pushForce;
    agentA.y -= ny * overlap * pushForce;
    agentB.x += nx * overlap * pushForce;
    agentB.y += ny * overlap * pushForce;
    
    if (!isFriendlyCollision) {
      const extraImpulse = 1.2;
      agentA.dirX = -nx * extraImpulse;
      agentA.dirY = -ny * extraImpulse;
      agentB.dirX = nx * extraImpulse;
      agentB.dirY = ny * extraImpulse;
    }
  }
}

function checkAllCollisions() {
  let collisions = 0;
  
  for (let i = 0; i < allAgents.length; i++) {
    for (let j = i + 1; j < allAgents.length; j++) {
      const agentA = allAgents[i];
      const agentB = allAgents[j];
      
      if (agentA.collisionCooldown > 0 || agentB.collisionCooldown > 0) {
        continue;
      }
      
      if (checkCollision(agentA, agentB)) {
        resolveCollision(agentA, agentB);
        collisions++;
      }
    }
  }
  
  return collisions;
}