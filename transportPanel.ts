// src/ui/transportPanel.ts

import { VEHICLES } from '../game/config';
import { getVehicleCfg, getUpgradeCost, formatMoney } from '../game/economy';
import { gameState } from '../systems/gameState';
import { adsSystem } from '../systems/adsSystem';
import { showNotification } from './notifications';
import { BALANCE } from '../game/config';

export function createTransportPanel(): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'le-panel';
  panel.id = 'panel-transport';
  render(panel);
  return panel;
}

function render(panel: HTMLElement): void {
  const save = gameState.getSave();
  panel.innerHTML = `<div class="le-panel-title">Автопарк</div>`;

  for (const cfg of VEHICLES) {
    const state = save.vehicles.find(v => v.id === cfg.id)!;
    const isUnlocked = state.owned || save.totalEarned >= cfg.unlockRequirement;
    const upgradeCost = getUpgradeCost(cfg, state.level);
    const incomePerUnit = cfg.baseIncome * state.level;
    const totalIncome = incomePerUnit * state.count;

    const card = document.createElement('div');
    card.className = `le-card${!isUnlocked ? ' le-locked' : ''}`;

    // Header
    const header = document.createElement('div');
    header.className = 'le-card-header';

    const icon = document.createElement('img');
    icon.className = 'le-card-icon';
    icon.src = `./assets/icons/${cfg.icon}.svg`;
    icon.alt = cfg.name;

    const info = document.createElement('div');
    info.className = 'le-card-info';

    const name = document.createElement('div');
    name.className = 'le-card-name';
    name.textContent = cfg.name;

    const sub = document.createElement('div');
    sub.className = 'le-card-sub';
    if (state.owned) {
      sub.textContent = `${state.count} шт. | +${formatMoney(totalIncome)}/сек | Ур.${state.level}`;
    } else if (isUnlocked) {
      sub.textContent = `Требуется: ${formatMoney(cfg.baseCost)}`;
    } else {
      sub.textContent = `Разблокировка: ${formatMoney(cfg.unlockRequirement)} всего`;
    }

    info.appendChild(name);
    info.appendChild(sub);
    header.appendChild(icon);
    header.appendChild(info);

    // Level badge
    if (state.owned) {
      const badge = document.createElement('span');
      badge.className = 'le-level-badge';
      badge.textContent = `Ур.${state.level}`;
      header.appendChild(badge);
    }

    card.appendChild(header);

    // Progress bar (level progress)
    if (state.owned) {
      const progWrap = document.createElement('div');
      progWrap.className = 'le-progress-wrap';
      const progBar = document.createElement('div');
      progBar.className = 'le-progress-bar';
      progBar.style.width = `${Math.min(100, (state.level / cfg.maxLevel) * 100)}%`;
      progWrap.appendChild(progBar);
      card.appendChild(progWrap);
    }

    // Actions
    const actions = document.createElement('div');
    actions.className = 'le-vehicle-actions';

    if (!state.owned && isUnlocked) {
      const buyBtn = document.createElement('button');
      buyBtn.className = 'le-btn le-btn-gold le-btn-sm';
      buyBtn.textContent = `Купить ${formatMoney(cfg.baseCost)}`;
      buyBtn.disabled = save.money < cfg.baseCost;
      buyBtn.addEventListener('click', () => {
        if (gameState.buyVehicle(cfg.id)) {
          showNotification(`${cfg.name} куплен!`, 'gold');
          render(panel);
        }
      });
      actions.appendChild(buyBtn);

      // Buy more if already have one
    } else if (state.owned) {
      // Buy more button
      const buyMoreBtn = document.createElement('button');
      buyMoreBtn.className = 'le-btn le-btn-primary le-btn-sm';
      buyMoreBtn.textContent = `+1 шт. ${formatMoney(cfg.baseCost)}`;
      buyMoreBtn.disabled = save.money < cfg.baseCost;
      buyMoreBtn.addEventListener('click', () => {
        if (gameState.buyVehicle(cfg.id)) {
          showNotification(`+1 ${cfg.name}`, 'green');
          render(panel);
        }
      });
      actions.appendChild(buyMoreBtn);

      // Upgrade button
      if (state.level < cfg.maxLevel) {
        const upgradeBtn = document.createElement('button');
        upgradeBtn.className = 'le-btn le-btn-cyan le-btn-sm';
        upgradeBtn.textContent = `Улучшить ${formatMoney(upgradeCost)}`;
        upgradeBtn.disabled = save.money < upgradeCost;
        upgradeBtn.addEventListener('click', () => {
          if (gameState.upgradeVehicle(cfg.id)) {
            showNotification(`${cfg.name} Ур.${gameState.getSave().vehicles.find(v => v.id === cfg.id)!.level}`, 'cyan');
            render(panel);
          }
        });
        actions.appendChild(upgradeBtn);
      }

      // Ad boost for x3 boost
      const adBoostBtn = document.createElement('button');
      adBoostBtn.className = 'le-btn le-btn-purple le-btn-sm';
      adBoostBtn.textContent = 'x3 Буст';
      adBoostBtn.title = 'Реклама: x3 доход на 5 минут';
      adBoostBtn.addEventListener('click', () => {
        adsSystem.showRewarded(() => {
          gameState.applyBoost(BALANCE.BOOST_MULTIPLIER_AD, BALANCE.BOOST_DURATION_SEC);
          showNotification('x3 буст активирован на 5 мин!', 'purple');
          render(panel);
        });
      });
      actions.appendChild(adBoostBtn);
    }

    if (!isUnlocked) {
      const lockLabel = document.createElement('div');
      lockLabel.className = 'le-locked-label';
      lockLabel.textContent = `Заработайте ${formatMoney(cfg.unlockRequirement)} всего чтобы разблокировать`;
      card.appendChild(lockLabel);
    }

    card.appendChild(actions);
    panel.appendChild(card);
  }
}

export function refreshTransportPanel(panel: HTMLElement): void {
  render(panel);
}
