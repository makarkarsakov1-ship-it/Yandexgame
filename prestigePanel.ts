// src/ui/prestigePanel.ts

import { formatMoney } from '../game/economy';
import { gameState } from '../systems/gameState';
import { adsSystem } from '../systems/adsSystem';
import { showNotification } from './notifications';
import { showModal } from './modal';
import { BALANCE } from '../game/config';

export function createPrestigePanel(): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'le-panel';
  panel.id = 'panel-prestige';
  render(panel);
  return panel;
}

function render(panel: HTMLElement): void {
  const save = gameState.getSave();
  const canPrestige = gameState.canPrestige();
  const nextPrestigeLevel = save.prestigeLevel + 1;
  const nextRequirement = nextPrestigeLevel * nextPrestigeLevel * BALANCE.PRESTIGE_DIVISOR;
  const progress = Math.min(100, (save.totalEarned / nextRequirement) * 100);

  panel.innerHTML = `
    <div class="le-panel-title">Престиж</div>
    <div class="le-card">
      <div style="text-align:center; padding: 8px 0;">
        <div style="font-size:11px; color: var(--text-sec); text-transform:uppercase; letter-spacing:1px;">Уровень Престижа</div>
        <div class="le-prestige-level">${save.prestigeLevel}</div>
        <div class="le-prestige-mult">Множитель: x${save.prestigeMultiplier.toFixed(1)}</div>
      </div>
    </div>

    <div class="le-card">
      <div class="le-card-name" style="margin-bottom:8px;">Прогресс до Ур.${nextPrestigeLevel}</div>
      <div class="le-card-sub" style="margin-bottom:6px;">
        ${formatMoney(save.totalEarned)} / ${formatMoney(nextRequirement)} всего заработано
      </div>
      <div class="le-progress-wrap" style="height:8px;">
        <div class="le-progress-bar" style="width:${progress}%; background: var(--purple);"></div>
      </div>
      <div class="le-card-sub" style="margin-top:6px;">${progress.toFixed(1)}%</div>
    </div>

    <div class="le-card">
      <div class="le-card-name" style="margin-bottom:4px;">Бонусы при сбросе</div>
      <div class="le-card-sub" style="margin-bottom:12px; line-height: 1.6;">
        — Множитель доходов: x${(save.prestigeMultiplier + 0.5).toFixed(1)}<br>
        — Города и склады сохраняются<br>
        — Транспорт сбрасывается<br>
        — Стартовые деньги: ${formatMoney(1000 * nextPrestigeLevel)}
      </div>
      <div id="prestige-actions"></div>
    </div>

    <div class="le-card" style="margin-top:8px;">
      <div class="le-card-name" style="margin-bottom:8px;">Реклама-буст</div>
      <div class="le-vehicle-actions" id="ad-boosts"></div>
    </div>
  `;

  const prestigeActions = panel.querySelector('#prestige-actions') as HTMLElement;

  const prestigeBtn = document.createElement('button');
  prestigeBtn.className = `le-btn le-btn-full ${canPrestige ? 'le-btn-purple' : 'le-btn-ghost'}`;
  prestigeBtn.disabled = !canPrestige;
  prestigeBtn.textContent = canPrestige ? `Престиж! (Ур.${nextPrestigeLevel})` : `Нужно: ${formatMoney(nextRequirement)} всего`;
  prestigeBtn.addEventListener('click', () => {
    showModal(
      'Сброс престижа',
      `Ваши транспортные средства будут сброшены, но города и склады останутся.\n\nНовый множитель дохода: <strong>x${(save.prestigeMultiplier + 0.5).toFixed(1)}</strong>`,
      [
        {
          label: 'Отмена',
          className: 'le-btn-ghost',
          onClick: () => {},
        },
        {
          label: 'Сброс!',
          className: 'le-btn-purple',
          onClick: () => {
            if (gameState.doPrestige()) {
              showNotification(`Престиж Ур.${gameState.getSave().prestigeLevel}!`, 'purple');
              render(panel);
            }
          },
        },
      ]
    );
  });
  prestigeActions.appendChild(prestigeBtn);

  // Ad boosts
  const adBoosts = panel.querySelector('#ad-boosts') as HTMLElement;

  const boost3Btn = document.createElement('button');
  boost3Btn.className = 'le-btn le-btn-purple le-btn-sm';
  boost3Btn.textContent = 'x3 буст (5 мин)';
  boost3Btn.addEventListener('click', () => {
    adsSystem.showRewarded(() => {
      gameState.applyBoost(BALANCE.BOOST_MULTIPLIER_AD, BALANCE.BOOST_DURATION_SEC);
      showNotification('x3 буст на 5 мин!', 'purple');
      render(panel);
    });
  });
  adBoosts.appendChild(boost3Btn);

  const boostRandBtn = document.createElement('button');
  boostRandBtn.className = 'le-btn le-btn-cyan le-btn-sm';
  boostRandBtn.textContent = 'Случайный буст';
  boostRandBtn.addEventListener('click', () => {
    adsSystem.showRewarded(() => {
      const mult = Math.floor(Math.random() * (BALANCE.BOOST_MULTIPLIER_RANDOM_MAX - 2) + 2);
      const dur = BALANCE.BOOST_DURATION_SEC * 2;
      gameState.applyBoost(mult, dur);
      showNotification(`x${mult} буст на 10 мин!`, 'cyan');
      render(panel);
    });
  });
  adBoosts.appendChild(boostRandBtn);

  const lootBtn = document.createElement('button');
  lootBtn.className = 'le-btn le-btn-gold le-btn-sm';
  lootBtn.textContent = 'Контейнер (x2-x20)';
  lootBtn.addEventListener('click', () => {
    adsSystem.showRewarded(() => {
      const mult = Math.floor(Math.random() * (BALANCE.LOOT_AD_MAX - BALANCE.LOOT_AD_MIN + 1) + BALANCE.LOOT_AD_MIN);
      const ips = gameState.getIncomePerSecond();
      const reward = ips * 60 * mult;
      gameState.addMoney(reward);
      showNotification(`Контейнер: +${formatMoney(reward)}!`, 'gold');
      render(panel);
    });
  });
  adBoosts.appendChild(lootBtn);
}

export function refreshPrestigePanel(panel: HTMLElement): void {
  render(panel);
}
