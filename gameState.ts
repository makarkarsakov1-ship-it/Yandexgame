// src/systems/gameState.ts
// Central mutable game state + all mutation methods

import { GameSave, VehicleState, ContractState } from '../game/types';
import { loadSave, writeSave } from './saveSystem';
import {
  getTotalIncomePerSecond,
  calcOfflineReward,
  calcPrestigeLevel,
  calcPrestigeMultiplier,
  getUpgradeCost,
  getVehicleCfg,
  getCityCfg,
  getWarehouseCfg,
} from '../game/economy';
import { BALANCE, VEHICLES, CITIES, WAREHOUSES, CONTRACTS } from '../game/config';

export type StateListener = (save: GameSave) => void;

class GameState {
  private save!: GameSave;
  private listeners: StateListener[] = [];
  private autosaveTimer = 0;
  private offlineReward = 0;

  // --- Init ---

  init(): number {
    this.save = loadSave();
    const offline = calcOfflineReward(this.save, Date.now());
    this.offlineReward = offline;
    if (offline > 0) {
      this.save.money += offline;
      this.save.totalEarned += offline;
    }
    this.startAutosave();
    return offline;
  }

  getSave(): GameSave {
    return this.save;
  }

  getOfflineReward(): number {
    return this.offlineReward;
  }

  // --- Subscriptions ---

  subscribe(listener: StateListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    for (const l of this.listeners) l(this.save);
  }

  // --- Tick ---

  tick(deltaSec: number): void {
    this.save.totalPlayTime += deltaSec;
    const income = getTotalIncomePerSecond(this.save) * deltaSec;
    this.save.money += income;
    this.save.totalEarned += income;
    this.notify();
  }

  // --- Vehicles ---

  buyVehicle(vehicleId: string): boolean {
    const cfg = getVehicleCfg(vehicleId);
    const state = this.save.vehicles.find(v => v.id === vehicleId);
    if (!state) return false;
    if (this.save.money < cfg.baseCost) return false;
    if (this.save.totalEarned < cfg.unlockRequirement) return false;
    this.save.money -= cfg.baseCost;
    state.owned = true;
    state.count += 1;
    this.notify();
    return true;
  }

  upgradeVehicle(vehicleId: string): boolean {
    const cfg = getVehicleCfg(vehicleId);
    const state = this.save.vehicles.find(v => v.id === vehicleId);
    if (!state || !state.owned) return false;
    if (state.level >= cfg.maxLevel) return false;
    const cost = getUpgradeCost(cfg, state.level);
    if (this.save.money < cost) return false;
    this.save.money -= cost;
    state.level += 1;
    this.notify();
    return true;
  }

  // --- Cities ---

  unlockCity(cityId: string): boolean {
    const cfg = getCityCfg(cityId);
    const state = this.save.cities.find(c => c.id === cityId);
    if (!state || state.unlocked) return false;
    if (this.save.totalEarned < cfg.unlockRequirement) return false;
    if (this.save.money < cfg.unlockCost) return false;
    this.save.money -= cfg.unlockCost;
    state.unlocked = true;
    state.active = true;
    // Initialize warehouse for this city
    const wh = this.save.warehouses.find(w => w.cityId === cityId);
    if (wh) wh.warehouseId = 'none';
    this.notify();
    return true;
  }

  // --- Warehouses ---

  upgradeWarehouse(cityId: string): boolean {
    const whState = this.save.warehouses.find(w => w.cityId === cityId);
    if (!whState) return false;
    const cityState = this.save.cities.find(c => c.id === cityId);
    if (!cityState || !cityState.unlocked) return false;

    const currentIdx = WAREHOUSES.findIndex(w => w.id === whState.warehouseId);
    if (currentIdx < 0 || currentIdx >= WAREHOUSES.length - 1) return false;
    const next = WAREHOUSES[currentIdx + 1];
    if (this.save.money < next.cost) return false;

    this.save.money -= next.cost;
    whState.warehouseId = next.id;
    this.notify();
    return true;
  }

  // --- Contracts ---

  startContract(contractId: string): boolean {
    const cfg = CONTRACTS.find(c => c.id === contractId);
    const state = this.save.contracts.find(c => c.id === contractId);
    if (!cfg || !state) return false;
    if (state.active) return false;
    const ips = getTotalIncomePerSecond(this.save);
    state.payout = Math.max(cfg.basePayout, ips * cfg.duration * 0.1);
    state.active = true;
    state.completedAt = Date.now() + cfg.duration * 1000;
    this.notify();
    return true;
  }

  claimContract(contractId: string): number {
    const state = this.save.contracts.find(c => c.id === contractId);
    if (!state || !state.active) return 0;
    if (Date.now() < state.completedAt) return 0;
    const payout = state.payout;
    this.save.money += payout;
    this.save.totalEarned += payout;
    state.active = false;
    state.completedAt = 0;
    this.notify();
    return payout;
  }

  claimContractWithAd(contractId: string): number {
    const state = this.save.contracts.find(c => c.id === contractId);
    if (!state || !state.active) return 0;
    const payout = state.payout * BALANCE.CONTRACT_AD_MULTIPLIER;
    this.save.money += payout;
    this.save.totalEarned += payout;
    state.active = false;
    state.completedAt = 0;
    this.notify();
    return payout;
  }

  // --- Boosts ---

  applyBoost(multiplier: number, durationSec: number): void {
    const existing = this.save.boost;
    const now = Date.now();
    if (existing.multiplier > 1 && now < existing.expiresAt) {
      // Extend existing boost
      const remaining = (existing.expiresAt - now) / 1000;
      const combined = Math.max(multiplier, existing.multiplier);
      this.save.boost = {
        multiplier: combined,
        expiresAt: now + (remaining + durationSec) * 1000,
      };
    } else {
      this.save.boost = {
        multiplier,
        expiresAt: now + durationSec * 1000,
      };
    }
    this.notify();
  }

  addMoney(amount: number): void {
    this.save.money += amount;
    this.save.totalEarned += amount;
    this.notify();
  }

  // --- Prestige ---

  canPrestige(): boolean {
    const nextLevel = this.save.prestigeLevel + 1;
    const required = nextLevel * nextLevel * BALANCE.PRESTIGE_DIVISOR;
    return this.save.totalEarned >= required;
  }

  doPrestige(): boolean {
    if (!this.canPrestige()) return false;
    const newLevel = this.save.prestigeLevel + 1;
    const newMult = calcPrestigeMultiplier(newLevel);
    // Reset vehicles and money, keep cities/warehouses and prestige
    this.save.prestigeLevel = newLevel;
    this.save.prestigeMultiplier = newMult;
    this.save.money = 1000 * newLevel;
    this.save.vehicles = VEHICLES.map(v => ({
      id: v.id,
      owned: v.id === 'gazelle',
      level: 1,
      count: v.id === 'gazelle' ? 1 : 0,
    }));
    this.save.boost = { multiplier: 1, expiresAt: 0 };
    this.save.contracts = this.save.contracts.map(c => ({
      ...c,
      active: false,
      completedAt: 0,
    }));
    this.notify();
    writeSave(this.save);
    return true;
  }

  // --- Autosave ---

  private startAutosave(): void {
    this.autosaveTimer = window.setInterval(() => {
      writeSave(this.save);
    }, BALANCE.AUTOSAVE_INTERVAL_MS);
  }

  destroy(): void {
    clearInterval(this.autosaveTimer);
    writeSave(this.save);
  }

  getIncomePerSecond(): number {
    return getTotalIncomePerSecond(this.save);
  }
}

export const gameState = new GameState();
