// src/ui/citiesPanel.ts

import { CITIES, WAREHOUSES } from '../game/config';
import { formatMoney } from '../game/economy';
import { gameState } from '../systems/gameState';
import { showNotification } from './notifications';

export function createCitiesPanel(): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'le-panel';
  panel.id = 'panel-cities';
  render(panel);
  return panel;
}

function render(panel: HTMLElement): void {
  const save = gameState.getSave();
  panel.innerHTML = `<div class="le-panel-title">Города</div>`;

  for (const cfg of CITIES) {
    const state = save.cities.find(c => c.id === cfg.id)!;
    const warehouseState = save.warehouses.find(w => w.cityId === cfg.id)!;
    const currentWarehouse = WAREHOUSES.find(w => w.id === warehouseState.warehouseId)!;
    const nextWarehouse = WAREHOUSES[WAREHOUSES.indexOf(currentWarehouse) + 1];
    const canUnlock = save.totalEarned >= cfg.unlockRequirement;

    const card = document.createElement('div');
    card.className = `le-card${!canUnlock ? ' le-locked' : ''}`;

    const header = document.createElement('div');
    header.className = 'le-card-header';

    const icon = document.createElement('img');
    icon.className = 'le-card-icon';
    icon.src = './assets/icons/city.svg';
    icon.alt = cfg.name;

    const info = document.createElement('div');
    info.className = 'le-card-info';

    const name = document.createElement('div');
    name.className = 'le-card-name';
    name.textContent = cfg.name;

    const sub = document.createElement('div');
    sub.className = 'le-card-sub';
    if (state.unlocked) {
      sub.textContent = `x${cfg.multiplier} доход | Склад: ${currentWarehouse.name} (x${currentWarehouse.multiplier})`;
    } else if (canUnlock) {
      sub.textContent = `Множитель x${cfg.multiplier} | Цена: ${formatMoney(cfg.unlockCost)}`;
    } else {
      sub.textContent = `Нужно заработать ${formatMoney(cfg.unlockRequirement)} всего`;
    }

    info.appendChild(name);
    info.appendChild(sub);
    header.appendChild(icon);
    header.appendChild(info);

    // Status badge
    if (state.unlocked) {
      const badge = document.createElement('span');
      badge.className = 'le-level-badge';
      badge.style.color = '#22c55e';
      badge.textContent = 'x' + cfg.multiplier;
      header.appendChild(badge);
    }

    card.appendChild(header);

    const actions = document.createElement('div');
    actions.className = 'le-vehicle-actions';

    if (!state.unlocked && canUnlock) {
      const btn = document.createElement('button');
      btn.className = 'le-btn le-btn-gold le-btn-sm';
      btn.textContent = `Открыть ${formatMoney(cfg.unlockCost)}`;
      btn.disabled = save.money < cfg.unlockCost;
      btn.addEventListener('click', () => {
        if (gameState.unlockCity(cfg.id)) {
          showNotification(`${cfg.name} открыт! x${cfg.multiplier}`, 'gold');
          render(panel);
        }
      });
      actions.appendChild(btn);
    }

    if (state.unlocked && nextWarehouse) {
      const btn = document.createElement('button');
      btn.className = 'le-btn le-btn-cyan le-btn-sm';
      btn.textContent = `Склад: ${nextWarehouse.name} — ${formatMoney(nextWarehouse.cost)}`;
      btn.disabled = save.money < nextWarehouse.cost;
      btn.addEventListener('click', () => {
        if (gameState.upgradeWarehouse(cfg.id)) {
          showNotification(`Склад улучшен до "${nextWarehouse.name}"!`, 'cyan');
          render(panel);
        }
      });
      actions.appendChild(btn);
    } else if (state.unlocked && !nextWarehouse) {
      const badge = document.createElement('span');
      badge.className = 'le-level-badge';
      badge.style.color = '#a855f7';
      badge.textContent = 'Макс. склад';
      actions.appendChild(badge);
    }

    if (!canUnlock) {
      const lockLabel = document.createElement('div');
      lockLabel.className = 'le-locked-label';
      lockLabel.textContent = `Нужно ${formatMoney(cfg.unlockRequirement)} всего дохода`;
      card.appendChild(lockLabel);
    }

    card.appendChild(actions);
    panel.appendChild(card);
  }
}

export function refreshCitiesPanel(panel: HTMLElement): void {
  render(panel);
}
