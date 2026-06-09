// src/ui/uiController.ts
// Orchestrates all UI panels, top bar, tab switching

import { injectStyles } from './styles';
import { createTransportPanel, refreshTransportPanel } from './transportPanel';
import { createCitiesPanel, refreshCitiesPanel } from './citiesPanel';
import { createContractsPanel, refreshContractsPanel } from './contractsPanel';
import { createPrestigePanel, refreshPrestigePanel } from './prestigePanel';
import { gameState } from '../systems/gameState';
import { adsSystem } from '../systems/adsSystem';
import { formatMoney, getActiveBoostMultiplier } from '../game/economy';
import { showNotification } from './notifications';
import { showModal } from './modal';
import { BALANCE } from '../game/config';

type TabId = 'transport' | 'cities' | 'contracts' | 'prestige';

interface Tab {
  id: TabId;
  label: string;
  iconSrc: string;
  panel: HTMLElement;
  refreshFn: (panel: HTMLElement) => void;
}

export class UIController {
  private root!: HTMLElement;
  private topMoneyEl!: HTMLElement;
  private topIpsEl!: HTMLElement;
  private boostBadge!: HTMLElement;
  private tabs: Tab[] = [];
  private activeTab: TabId = 'transport';
  private interstitialTimer = 0;
  private renderTimer = 0;
  private lastRender = 0;

  init(container: HTMLElement): void {
    injectStyles();

    // Root
    this.root = document.createElement('div');
    this.root.id = 'le-root';
    container.appendChild(this.root);

    this.buildTopBar();
    this.buildTabBar();
    this.buildContent();
    this.startRenderLoop();
    this.startInterstitialLoop();

    // Offline reward modal
    const offlineReward = gameState.getOfflineReward();
    if (offlineReward > 50) {
      setTimeout(() => {
        showModal(
          'Добро пожаловать!',
          `Пока вас не было, ваша империя заработала:<br><br><strong style="color:#f59e0b; font-size:20px;">${formatMoney(offlineReward)}</strong>`,
          [{ label: 'Забрать!', className: 'le-btn-gold', onClick: () => {} }]
        );
      }, 500);
    }
  }

  private buildTopBar(): void {
    const bar = document.createElement('div');
    bar.id = 'le-topbar';

    // Money block
    const moneyBlock = document.createElement('div');
    moneyBlock.className = 'le-stat-block';

    const moneyLabel = document.createElement('div');
    moneyLabel.className = 'le-stat-label';
    moneyLabel.textContent = 'Баланс';

    this.topMoneyEl = document.createElement('div');
    this.topMoneyEl.className = 'le-stat-value';

    this.topIpsEl = document.createElement('div');
    this.topIpsEl.className = 'le-stat-ips';

    moneyBlock.appendChild(moneyLabel);
    moneyBlock.appendChild(this.topMoneyEl);
    moneyBlock.appendChild(this.topIpsEl);

    // Boost badge
    this.boostBadge = document.createElement('div');
    this.boostBadge.id = 'le-boost-badge';

    // Ad button (quick access)
    const adBtn = document.createElement('button');
    adBtn.className = 'le-btn le-btn-purple le-btn-sm';
    adBtn.innerHTML = `<img src="./assets/icons/boost.svg" style="width:16px;height:16px;" alt="boost"/> Буст`;
    adBtn.title = 'Посмотреть рекламу для x3 буста';
    adBtn.addEventListener('click', () => {
      adsSystem.showRewarded(() => {
        gameState.applyBoost(BALANCE.BOOST_MULTIPLIER_AD, BALANCE.BOOST_DURATION_SEC);
        showNotification('x3 буст на 5 мин!', 'purple');
      });
    });

    bar.appendChild(moneyBlock);
    bar.appendChild(this.boostBadge);
    bar.appendChild(adBtn);

    this.root.appendChild(bar);
  }

  private buildTabBar(): void {
    const tabBar = document.createElement('div');
    tabBar.id = 'le-tabbar';

    const tabDefs: { id: TabId; label: string; icon: string }[] = [
      { id: 'transport', label: 'Транспорт', icon: 'gazelle' },
      { id: 'cities',    label: 'Города',    icon: 'city' },
      { id: 'contracts', label: 'Контракты', icon: 'contract' },
      { id: 'prestige',  label: 'Престиж',   icon: 'prestige' },
    ];

    for (const def of tabDefs) {
      const tabEl = document.createElement('div');
      tabEl.className = `le-tab${def.id === this.activeTab ? ' active' : ''}`;
      tabEl.dataset.tabId = def.id;

      const img = document.createElement('img');
      img.src = `./assets/icons/${def.icon}.svg`;
      img.style.cssText = 'width:20px;height:20px;';
      img.alt = def.label;

      const span = document.createElement('span');
      span.textContent = def.label;

      tabEl.appendChild(img);
      tabEl.appendChild(span);
      tabEl.addEventListener('click', () => this.switchTab(def.id));
      tabBar.appendChild(tabEl);
    }

    this.root.appendChild(tabBar);
  }

  private buildContent(): void {
    const content = document.createElement('div');
    content.id = 'le-content';

    const transportPanel = createTransportPanel();
    const citiesPanel = createCitiesPanel();
    const contractsPanel = createContractsPanel();
    const prestigePanel = createPrestigePanel();

    this.tabs = [
      { id: 'transport', label: 'Транспорт', iconSrc: 'gazelle', panel: transportPanel, refreshFn: refreshTransportPanel },
      { id: 'cities',    label: 'Города',    iconSrc: 'city',    panel: citiesPanel,    refreshFn: refreshCitiesPanel },
      { id: 'contracts', label: 'Контракты', iconSrc: 'contract',panel: contractsPanel, refreshFn: refreshContractsPanel },
      { id: 'prestige',  label: 'Престиж',   iconSrc: 'prestige',panel: prestigePanel,  refreshFn: refreshPrestigePanel },
    ];

    for (const tab of this.tabs) {
      if (tab.id === this.activeTab) tab.panel.classList.add('active');
      content.appendChild(tab.panel);
    }

    this.root.appendChild(content);
  }

  private switchTab(id: TabId): void {
    if (this.activeTab === id) return;
    this.activeTab = id;

    // Update tab bar
    const tabBar = document.getElementById('le-tabbar');
    if (tabBar) {
      tabBar.querySelectorAll('.le-tab').forEach(el => {
        const htmlEl = el as HTMLElement;
        htmlEl.classList.toggle('active', htmlEl.dataset.tabId === id);
      });
    }

    // Update panels
    for (const tab of this.tabs) {
      tab.panel.classList.toggle('active', tab.id === id);
      if (tab.id === id) {
        tab.refreshFn(tab.panel);
      }
    }
  }

  private startRenderLoop(): void {
    const RENDER_INTERVAL = 500; // ms between UI refreshes
    this.renderTimer = window.setInterval(() => {
      const save = gameState.getSave();
      const ips = gameState.getIncomePerSecond();

      // Top bar
      this.topMoneyEl.textContent = formatMoney(save.money);
      this.topIpsEl.textContent = `+${formatMoney(ips)}/сек`;

      // Boost badge
      const boostMult = getActiveBoostMultiplier(save.boost);
      if (boostMult > 1) {
        const remaining = Math.ceil((save.boost.expiresAt - Date.now()) / 1000);
        this.boostBadge.style.display = 'flex';
        this.boostBadge.textContent = `x${boostMult} буст: ${remaining}с`;
      } else {
        this.boostBadge.style.display = 'none';
      }

      // Refresh active tab every render cycle
      const activeTab = this.tabs.find(t => t.id === this.activeTab);
      if (activeTab) {
        activeTab.refreshFn(activeTab.panel);
      }
    }, RENDER_INTERVAL);
  }

  private startInterstitialLoop(): void {
    this.interstitialTimer = window.setInterval(() => {
      if (adsSystem.canShowInterstitial()) {
        adsSystem.showInterstitial();
      }
    }, BALANCE.AD_INTERSTITIAL_INTERVAL_MS);
  }

  destroy(): void {
    clearInterval(this.renderTimer);
    clearInterval(this.interstitialTimer);
  }
}

export const uiController = new UIController();
