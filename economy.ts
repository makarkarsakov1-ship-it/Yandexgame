// src/game/economy.ts
// Pure calculation functions — no side effects, fully testable

import { BALANCE, VEHICLES, CITIES, WAREHOUSES, VehicleConfig, CityConfig, WarehouseConfig } from './config';
import { GameSave, VehicleState, BoostState } from './types';

/** Cost to upgrade a vehicle to the next level */
export function getUpgradeCost(cfg: VehicleConfig, currentLevel: number): number {
  return Math.floor(cfg.upgradeCostBase * Math.pow(BALANCE.UPGRADE_COST_EXPONENT, currentLevel - 1));
}

/** Income per second from a single vehicle type */
export function getVehicleIncome(cfg: VehicleConfig, state: VehicleState): number {
  if (!state.owned || state.count === 0) return 0;
  return cfg.baseIncome * state.level * state.count;
}

/** Get active city multiplier (product of all unlocked+active cities) */
export function getCityMultiplier(save: GameSave): number {
  let multiplier = 1;
  for (const cityState of save.cities) {
    if (cityState.unlocked && cityState.active) {
      const cfg = CITIES.find(c => c.id === cityState.id);
      if (cfg) multiplier = Math.max(multiplier, cfg.multiplier);
    }
  }
  return multiplier;
}

/** Get warehouse multiplier for the highest-tier warehouse across all cities */
export function getWarehouseMultiplier(save: GameSave): number {
  let best = 1;
  for (const wh of save.warehouses) {
    const cfg = WAREHOUSES.find(w => w.id === wh.warehouseId);
    if (cfg && cfg.multiplier > best) best = cfg.multiplier;
  }
  return best;
}

/** Total income per second */
export function getTotalIncomePerSecond(save: GameSave): number {
  let base = 0;
  for (const vehicleState of save.vehicles) {
    const cfg = VEHICLES.find(v => v.id === vehicleState.id);
    if (cfg) base += getVehicleIncome(cfg, vehicleState);
  }
  const cityMult = getCityMultiplier(save);
  const warehouseMult = getWarehouseMultiplier(save);
  const prestigeMult = save.prestigeMultiplier;
  const boostMult = getActiveBoostMultiplier(save.boost);
  return base * cityMult * warehouseMult * prestigeMult * boostMult;
}

/** Returns active boost multiplier or 1 if expired */
export function getActiveBoostMultiplier(boost: BoostState): number {
  if (boost.multiplier <= 1) return 1;
  if (Date.now() < boost.expiresAt) return boost.multiplier;
  return 1;
}

/** Calculate prestige level from total earned */
export function calcPrestigeLevel(totalEarned: number): number {
  return Math.floor(Math.sqrt(totalEarned / BALANCE.PRESTIGE_DIVISOR));
}

/** Prestige multiplier from prestige level */
export function calcPrestigeMultiplier(prestigeLevel: number): number {
  if (prestigeLevel === 0) return 1;
  return 1 + prestigeLevel * 0.5;
}

/** Offline reward calculation */
export function calcOfflineReward(save: GameSave, nowMs: number): number {
  const elapsedSec = (nowMs - save.lastSaveTime) / 1000;
  const cappedSec = Math.min(elapsedSec, BALANCE.OFFLINE_MAX_HOURS * 3600);
  if (cappedSec <= 0) return 0;
  // Calculate without current boost (boost doesn't persist offline)
  const boostlessSave = { ...save, boost: { multiplier: 1, expiresAt: 0 } };
  const ips = getTotalIncomePerSecond(boostlessSave);
  return ips * cappedSec;
}

/** Format large numbers for display */
export function formatMoney(amount: number): string {
  if (amount < 1000) return Math.floor(amount).toString();
  if (amount < 1_000_000) return (amount / 1000).toFixed(1) + 'K';
  if (amount < 1_000_000_000) return (amount / 1_000_000).toFixed(2) + 'M';
  if (amount < 1_000_000_000_000) return (amount / 1_000_000_000).toFixed(2) + 'B';
  return (amount / 1_000_000_000_000).toFixed(2) + 'T';
}

/** Format seconds as human-readable duration */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}с`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}м`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}ч ${m}м`;
}

/** Get vehicle config by id */
export function getVehicleCfg(id: string): VehicleConfig {
  const cfg = VEHICLES.find(v => v.id === id);
  if (!cfg) throw new Error(`Unknown vehicle id: ${id}`);
  return cfg;
}

/** Get city config by id */
export function getCityCfg(id: string): CityConfig {
  const cfg = CITIES.find(c => c.id === id);
  if (!cfg) throw new Error(`Unknown city id: ${id}`);
  return cfg;
}

/** Get warehouse config by id */
export function getWarehouseCfg(id: string): WarehouseConfig {
  const cfg = WAREHOUSES.find(w => w.id === id);
  if (!cfg) throw new Error(`Unknown warehouse id: ${id}`);
  return cfg;
}
