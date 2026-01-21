// === ГЕНЕТИЧЕСКАЯ СИСТЕМА И КЛАСС АГЕНТА ===

function geneToMultiplier(geneValue) {
  return (geneValue - 50) / 100;
}

function generateGenes(type, averageGenes = null) {
  if (averageGenes) {
    const newGenes = {};
    const keys = Object.keys(averageGenes);
    
    for (const key of keys) {
      let baseValue = averageGenes[key];
      
      if (Math.random() < CONFIG.MUTATION_RATE) {
        const mutation = (Math.random() - 0.5) * CONFIG.MUTATION_STRENGTH * 2;
        baseValue += mutation;
      }
      
      newGenes[key] = Math.max(0, Math.min(100, Math.round(baseValue)));
    }
    
    if (type === 'hunter' && !newGenes.aggression) {
      newGenes.aggression = Math.floor(Math.random() * 101);
      newGenes.strength = Math.floor(Math.random() * 101);
    } else if (type === 'runner' && !newGenes.fear) {
      newGenes.fear = Math.floor(Math.random() * 101);
      newGenes.agility = Math.floor(Math.random() * 101);
    }
    
    return newGenes;
  }
  
  return {
    size: Math.floor(Math.random() * 101),
    speed: Math.floor(Math.random() * 101),
    health: Math.floor(Math.random() * 101),
    vision: Math.floor(Math.random() * 101),
    curiosity: Math.floor(Math.random() * 101),
    caution: Math.floor(Math.random() * 101),
    
    ...(type === 'hunter' ? {
      aggression: Math.floor(Math.random() * 101),
      strength: Math.floor(Math.random() * 101)
    } : {
      fear: Math.floor(Math.random() * 101),
      agility: Math.floor(Math.random() * 101)
    })
  };
}

class Agent {
  constructor(x, y, type, averageGenes = null, customGenes = null) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.type = type;
    this.x = x;
    this.y = y;
    
    // Используем кастомные гены, если они переданы
    if (customGenes) {
      this.genes = customGenes;
    } else {
      this.genes = generateGenes(type, averageGenes);
    }
    
    this.size = CONFIG.BASE_SIZE * (1 + geneToMultiplier(this.genes.size));
    this.baseSpeed = CONFIG.BASE_SPEED * (1 + geneToMultiplier(this.genes.speed));
    this.maxHealth = 100 * (1 + geneToMultiplier(this.genes.health));
    this.visionRange = CONFIG.BASE_VISION * (1 + geneToMultiplier(this.genes.vision));
    
    this.health = this.maxHealth;
    this.dirX = Math.cos(Math.random() * Math.PI * 2);
    this.dirY = Math.sin(Math.random() * Math.PI * 2);
    this.facingAngle = Math.atan2(this.dirY, this.dirX);
    
    // Счетчик убийств для охотников
    this.killCount = 0;
    
    this.collisionCooldown = 0;
    this.age = 0;
    this.isColliding = false;
    this.collisionColor = null;
  }
  
  update(allAgents) {
    if (this.health <= 0) return false;
    
    this.age++;
    this.collisionCooldown = Math.max(0, this.collisionCooldown - 1);
    this.isColliding = this.collisionCooldown > 0;
    
    if (this.collisionCooldown === 0) {
      this.collisionColor = null;
    }
    
    this.updateCuriosity();
    
    const speedModifier = this.updateCaution();
    
    const effectiveSpeed = this.baseSpeed * speedModifier;
    this.x += this.dirX * effectiveSpeed;
    this.y += this.dirY * effectiveSpeed;
    
    if (Math.abs(this.dirX) > 0.01 || Math.abs(this.dirY) > 0.01) {
      this.facingAngle = Math.atan2(this.dirY, this.dirX);
    }
    
    this.x = Math.max(0, Math.min(canvas.width - this.size, this.x));
    this.y = Math.max(0, Math.min(canvas.height - this.size, this.y));
    
    this.checkVision(allAgents);
    
    return this.health > 0;
  }
  
  updateCuriosity() {
    const curiosity = this.genes.curiosity || 50;
    const curiosityModifier = geneToMultiplier(curiosity);
    const changeChance = 0.015 * (1 + curiosityModifier);
    
    if (Math.random() < changeChance) {
      const angle = Math.random() * Math.PI * 2;
      this.dirX = Math.cos(angle);
      this.dirY = Math.sin(angle);
    }
  }
  
  updateCaution() {
    const caution = this.genes.caution || 50;
    const cautionModifier = geneToMultiplier(caution);
    return 1 - cautionModifier * 0.3;
  }
  
  checkVision(allAgents) {
    let closestTarget = null;
    let closestDistance = Infinity;
    
    for (const other of allAgents) {
      if (other === this) continue;
      
      const dx = other.x - this.x;
      const dy = other.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < this.visionRange && this.canSee(other)) {
        if (this.type === 'hunter' && other.type === 'runner') {
          const aggression = this.genes.aggression || 50;
          const attackChance = (aggression / 100) * 0.8;
          
          if (Math.random() < attackChance && distance < closestDistance) {
            closestTarget = other;
            closestDistance = distance;
          }
        } else if (this.type === 'runner' && other.type === 'hunter') {
          const fear = this.genes.fear || 50;
          const fleeChance = (fear / 100) * 0.9;
          
          if (Math.random() < fleeChance && distance < closestDistance) {
            closestTarget = other;
            closestDistance = distance;
          }
        }
      }
    }
    
    if (closestTarget) {
      const dx = this.type === 'hunter' 
        ? closestTarget.x - this.x 
        : this.x - closestTarget.x;
      const dy = this.type === 'hunter'
        ? closestTarget.y - this.y
        : this.y - closestTarget.y;
      
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      this.dirX = dx / dist;
      this.dirY = dy / dist;
    }
  }
  
  canSee(target) {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > this.visionRange) return false;
    
    const angleToTarget = Math.atan2(dy, dx);
    const angleDiff = Math.abs(this.facingAngle - angleToTarget);
    const normalizedDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);
    
    return normalizedDiff < CONFIG.VISION_ANGLE / 2;
  }
  
  draw(ctx) {
    let color;
    
    if (this.collisionColor && this.isColliding) {
      color = this.collisionColor;
    } else if (this.isColliding) {
      color = '#ffff00';
    } else {
      if (this.type === 'hunter') {
        const aggression = this.genes.aggression || 50;
        const red = 150 + Math.floor(aggression);
        const greenBlue = Math.max(0, Math.floor(150 - aggression));
        color = `rgb(${red}, ${greenBlue}, ${greenBlue})`;
      } else {
        const fear = this.genes.fear || 50;
        const green = 150 + Math.floor(fear);
        const redBlue = Math.max(0, Math.floor(150 - fear));
        color = `rgb(${redBlue}, ${green}, ${redBlue})`;
      }
    }
    
    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    
    if (document.getElementById('showVision').checked) {
      ctx.save();
      ctx.translate(this.x + this.size/2, this.y + this.size/2);
      ctx.rotate(this.facingAngle - CONFIG.VISION_ANGLE/2);
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, this.visionRange, 0, CONFIG.VISION_ANGLE);
      ctx.closePath();
      
      ctx.fillStyle = this.type === 'hunter' 
        ? 'rgba(255, 100, 100, 0.08)' 
        : 'rgba(100, 255, 100, 0.08)';
      ctx.fill();
      
      ctx.restore();
    }
    
    if (this.health < this.maxHealth) {
      const healthPercent = this.health / this.maxHealth;
      ctx.fillStyle = healthPercent > 0.6 ? '#00ff00' : 
                     healthPercent > 0.3 ? '#ffff00' : '#ff0000';
      ctx.fillRect(this.x, this.y - 5, (this.size * healthPercent), 2);
    }
    
    // Отображение количества убийств для охотников
    if (this.type === 'hunter' && this.killCount > 0) {
      ctx.fillStyle = 'white';
      ctx.font = '8px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${this.killCount}`, this.x + this.size/2, this.y + this.size/2 + 3);
    }
  }
}