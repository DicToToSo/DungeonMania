# 🧙‍♂️ Sistema de Mercante - IMPLEMENTADO

## ✅ Sistema Completo

### 📋 Regras Implementadas:

#### 🛍️ **Mercante de Itens (a cada 5 ondas)**
- Aparece nas ondas: 5, 10, 15, 20, 25, 30...
- Oferece 3 itens aleatórios diferentes
- Itens aplicam efeitos permanentes no jogador
- Sistema de compra com verificação de ouro

#### 🐾 **Mercante de Pets (a cada 10 ondas)**
- Aparece nas ondas: 10, 20, 30, 40, 50...
- Uma vez por mundo (controlado por `petWorldOffered`)
- Oferece 2 pets aleatórios do sistema PetSystem
- Grátis para escolher

### 🛍️ Itens Disponíveis:
1. **Poção Grande** - 80 ouro - Cura 80 HP
2. **Escudo Reforçado** - 120 ouro - +5 DEF base
3. **Espada Afiada** - 180 ouro - +8 ATK base
4. **Armadura Leve** - 150 ouro - +10 HP máximo
5. **Botas Veloz** - 100 ouro - +15% regen stamina
6. **Anel da Sorte** - 200 ouro - +3% chance de loot

### 🐾 Pets Disponíveis:
- 🦊 Raposa Garimpeira - 150 ouro - +10% loot
- 🟢 Slime Venenoso - 200 ouro - 5 dano/turno
- 🐺 Lobo de Caça - 250 ouro - 8 dano/turno

## 🔄 Como Funciona:

### Lógica das Ondas:
```javascript
// Onda 5, 10, 15, 20, 25, 30...
if (p.stage % 5 === 0) {
    mostrarMercanteItens(); // Itens
}

// Onda 10, 20, 30, 40, 50...
if (p.stage % 10 === 0 && !p.petWorldOffered) {
    PetSystem.mostrarSelecaoPet(); // Pets grátis
}
```

### UI Atualizada:
- Mostra pet atual com nível e efeito
- Mostra quando será a próxima oferta de pet
- Mostra quando será o próximo mercante
- Cores diferenciadas:
  - 🐾 Pets: azul (#a78bfa)
  - 🛍️ Itens: dourado (#f59e0b)

### Efeitos Permanentes:
- **Itens**: Aplicam buffs base diretamente no jogador
- **Pets**: Sistema de níveis com escala 50% por nível
- **Integração**: Total com sistema de combate existente

## 📊 Estrutura Final:

### Arquivos:
- `js/PetSystem.js` - Sistema principal de pets
- `index.html` - Integração completa sem conflitos

### Funções Principais:
- `mostrarMercanteItens()` - Mercante de itens
- `PetSystem.mostrarSelecaoPet()` - Mercante de pets
- `aplicarEfeitoItem()` - Aplica efeitos permanentes
- `PetSystem.escolherPet()` - Sistema de pets com níveis

## 🎮 Como Testar:

1. **Novo jogo** - Comece sem pets
2. **Onda 5** - Mercante de itens aparece
3. **Compre item** - Efeito aplicado permanentemente
4. **Onda 10** - Mercante de pets aparece
5. **Escolha pet** - Pet ativo com efeitos
6. **Onda 20** - Novo mercante de itens
7. **Mude mundo** - Reseta e permite novo pet grátis

## ✅ Status: 100% FUNCIONAL

O sistema está completamente implementado e integrado com o resto do jogo!
Todos os mercantes aparecem na frequência correta e os efeitos são aplicados permanentemente.
