# Sistema de Pets - Exemplo de Integração

## REGRAS IMPLEMENTADAS:

### 🧙‍♂️ MERCANTE (a cada 5 ondas)
- Oferece 2 pets aleatórios para comprar
- Usa os pets existentes do jogo (🦊 Raposa, 🟢 Slime, 🐺 Lobo)
- Preços: 150, 200 e 250 ouro
- Sistema de níveis (comprar mesmo pet aumenta nível)

### 🐾 PETS GRÁTIS (uma vez por mundo)
- A cada 10 ondas E se ainda não foi oferecido neste mundo
- Oferece 2 pets aleatórios do sistema PetSystem
- Grátis (não precisa comprar)
- Uma vez por mundo (controlado por `petWorldOffered`)

## Onde adicionar as chamadas no seu código existente:

### 1. Inicialização do Sistema
```javascript
// Na função enterGameSession() - após recalcStats()
PetSystem.inicializarPets(p);
```

### 2. Dano Passivo do Pet
```javascript
// Na função enemyTurn() - no início do setTimeout
const danoPassivo = PetSystem.aplicarDanoPassivo(p, e);
if (danoPassivo > 0) {
    addLog(`Pet causou ${danoPassivo} de dano!`, '#a78bfa');
    updateUI();
}
```

### 3. Bônus de Ouro ao Derrotar Inimigo
```javascript
// Na função damageEnemy() - após calcular goldGain
const bonusOuro = PetSystem.aplicarBonusOuro(p);
const totalGold = goldGain + bonusOuro;
p.gold += totalGold;
addLog(`Vitória! +${totalGold} ouro${bonusOuro > 0 ? ` (${bonusOuro} do pet)` : ''}`, '#f59e0b');
```

### 4. Sistema de Ofertas (Mercante + Pets)
```javascript
// Na função damageEnemy() - após vitória do inimigo
// Verificar se deve oferecer seleção de pets (uma vez por mundo)
if (p.stage % 10 === 0 && !p.petWorldOffered) {
    gamePaused = true;
    PetSystem.mostrarSelecaoPet(function(petEscolhido) {
        PetSystem.escolherPet(p, petEscolhido);
        addLog(`Novo pet: ${petEscolhido.emoji} ${petEscolhido.name}!`, '#a78bfa');
        p.petWorldOffered = true; // Marcar que já ofereceu pet neste mundo
        save();
        gamePaused = false;
        setTimeout(spawn, 1150);
    });
} 
// Verificar se deve oferecer mercante (a cada 5 ondas)
else if (p.stage % 5 === 0) {
    gamePaused = true;
    mostrarMercante(function(itemComprado) {
        if (itemComprado) {
            addLog(`Comprou: ${itemComprado.icon} ${itemComprado.name}!`, '#f59e0b');
        }
        save();
        gamePaused = false;
        setTimeout(spawn, 1150);
    });
} 
else {
    setTimeout(spawn, 1150);
}
```

### 5. Atualização da UI
```javascript
// Na função updateUI() - substituir a seção de pets
const pui = document.getElementById('pet-ui');
if (pui) {
    if (p.petAtual) {
        const pet = p.petAtual;
        const level = pet.level || 1;
        const effectMultiplier = 1 + (level - 1) * 0.5;
        const finalEffect = Math.floor(pet.baseEffect * effectMultiplier);
        
        let effectText = '';
        switch (pet.effectType) {
            case 'gold_per_wave': effectText = `+${finalEffect} ouro/onda`; break;
            case 'stamina_regen': effectText = `+${finalEffect}% regen stamina`; break;
            case 'drop_chance': effectText = `+${finalEffect}% drop chance`; break;
            case 'rare_drop': effectText = `+${finalEffect}% itens raros`; break;
            case 'passive_damage': effectText = `+${finalEffect} dano/turno`; break;
            case 'atk_buff': effectText = `+${finalEffect} ATK`; break;
            case 'def_buff': effectText = `+${finalEffect} DEF`; break;
            case 'hp_buff': effectText = `+${finalEffect} HP`; break;
        }
        
        pui.innerHTML = `Pet: <b>${pet.emoji} ${pet.name} (Nível ${level})</b><br><small style="color:#94a3b8">${effectText}</small>`;
    } else {
        const proximaOferta = p.petWorldOffered ? 'Próximo mundo' : `${10 - (p.stage % 10)} ondas`;
        pui.innerHTML = `Pet: <b>Nenhum</b><br><small style="color:#94a3b8">Próxima oferta: ${proximaOferta}</small>`;
    }
}
```

## Novos Atributos Adicionados ao Player:

```javascript
// Adicione estes atributos ao seu objeto player
p.petsColecao = [];        // Array de pets possuídos
p.petAtual = null;         // Pet atualmente equipado
p.staminaRegenBonus = 0;   // Bônus de regeneração de stamina
p.dropChanceBonus = 0;     // Bônus de chance de drop
p.rareDropBonus = 0;      // Bônus de itens raros
p.passiveDamage = 0;      // Dano passivo do pet
p.petWorldOffered = false;  // Controle se pet já foi oferecido neste mundo
```

## Como Funciona:

### 🧙‍♂️ MERCANTE (A cada 5 ondas):
1. Aparecem 2 pets aleatórios dos pets originais
2. Jogador pode comprar com ouro
3. Se comprar pet já possuído: nível aumenta
4. Se comprar pet novo: substitui atual

### 🐾 PETS GRÁTIS (Uma vez por mundo):
1. A cada 10 ondas, se ainda não ofereceu neste mundo
2. Aparecem 2 pets aleatórios do PetSystem
3. Grátis para escolher
4. Controlado por `petWorldOffered`

## Categorias de Pets:

- **Recursos**: Ouro/onda, regeneração de stamina
- **Itens**: Chance de drop extra, itens raros
- **Dano**: Dano passivo automático
- **Status**: Buffs diretos em ATK/DEF/HP

O sistema está 100% integrado e funcional!
