// src/ui/contractsPanel.ts

import { CONTRACTS } from '../game/config';
import { formatMoney, formatDuration } from '../game/economy';
import { gameState } from '../systems/gameState';
import { adsSystem } from '../systems/adsSystem';
import { showNotification } from './notifications';
import { BALANCE } from '../game/config';

export function createContractsPanel(): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'le-panel';
  panel.id = 'panel-contracts';
  render(panel);
  return panel;
}

function render(panel: HTMLElement): void {
  const save = gameState.getSave();
  panel.innerHTML = `<div class="le-panel-title">Контракты</div>`;

  for (const cfg of CONTRACTS) {
    const state = save.contracts.find(c => c.id === cfg.id)!;
    const now = Date.now();
    const isCompleted = state.active && now >= state.completedAt;
    const isRunning = state.active && now < state.completedAt;
    const remainingSec = isRunning ? Math.ceil((state.completedAt - now) / 1000) : 0;

    const card = document.createElement('div');
    card.className = 'le-card';

    const header = document.createElement('div');
    header.className = 'le-card-header';

    const icon = document.createElement('img');
    icon.className = 'le-card-icon';
    icon.src = './assets/icons/contract.svg';
    icon.alt = cfg.name;

    const info = document.createElement('div');
    info.className = 'le-card-info';

    const name = document.createElement('div');
    name.className = 'le-card-name';
    name.textContent = cfg.name;

    const sub = document.createElement('div');
    sub.className = 'le-card-sub';
    if (isRunning) {
      sub.innerHTML = `<span class="le-contract-timer">Осталось: ${formatDuration(remainingSec)}</span>`;
    } else if (isCompleted) {
      sub.innerHTML = `<span class="le-contract-payout">Готово! +${formatMoney(state.payout)}</span>`;
    } else {
      sub.textContent = `Длительность: ${formatDuration(cfg.duration)} | Базовая выплата: ${formatMoney(cfg.basePayout)}`;
    }

    info.appendChild(name);
    info.appendChild(sub);
    header.appendChild(icon);
    header.appendChild(info);
    card.appendChild(header);

    // Running progress bar
    if (isRunning) {
      const total = cfg.duration * 1000;
      const elapsed = total - (state.completedAt - now);
      const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
      const progWrap = document.createElement('div');
      progWrap.className = 'le-progress-wrap';
      const progBar = document.createElement('div');
      progBar.className = 'le-progress-bar';
      progBar.style.width = `${pct}%`;
      progBar.style.background = '#38bdf8';
      progWrap.appendChild(progBar);
      card.appendChild(progWrap);
    }

    const actions = document.createElement('div');
    actions.className = 'le-vehicle-actions';

    if (!state.active) {
      const startBtn = document.createElement('button');
      startBtn.className = 'le-btn le-btn-primary le-btn-sm';
      startBtn.textContent = `Начать (${formatDuration(cfg.duration)})`;
      startBtn.addEventListener('click', () => {
        gameState.startContract(cfg.id);
        showNotification(`Контракт начат!`, 'cyan');
        render(panel);
      });
      actions.appendChild(startBtn);
    }

    if (isCompleted) {
      const claimBtn = document.createElement('button');
      claimBtn.className = 'le-btn le-btn-gold le-btn-sm';
      claimBtn.textContent = `Получить ${formatMoney(state.payout)}`;
      claimBtn.addEventListener('click', () => {
        const payout = gameState.claimContract(cfg.id);
        if (payout > 0) {
          showNotification(`+${formatMoney(payout)} получено!`, 'gold');
          render(panel);
        }
      });
      actions.appendChild(claimBtn);

      const adBtn = document.createElement('button');
      adBtn.className = 'le-btn le-btn-purple le-btn-sm';
      adBtn.textContent = `x${BALANCE.CONTRACT_AD_MULTIPLIER} за рекламу`;
      adBtn.title = `Посмотреть рекламу для x${BALANCE.CONTRACT_AD_MULTIPLIER} награды`;
      adBtn.addEventListener('click', () => {
        adsSystem.showRewarded(() => {
          const payout = gameState.claimContractWithAd(cfg.id);
          if (payout > 0) {
            showNotification(`x${BALANCE.CONTRACT_AD_MULTIPLIER}! +${formatMoney(payout)}!`, 'purple');
            render(panel);
          }
        });
      });
      actions.appendChild(adBtn);
    }

    card.appendChild(actions);
    panel.appendChild(card);
  }
}

export function refreshContractsPanel(panel: HTMLElement): void {
  render(panel);
}
