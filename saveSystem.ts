// src/systems/saveSystem.ts

import { GameSave, VehicleState, CityState, WarehouseState, ContractState } from '../game/types';
import { VEHICLES, CITIES } from '../game/config';
import { calcPrestigeMultiplier } from '../game/economy';

const SAVE_KEY = 'logistics_empire_v1';
const SAVE_VERSION = 1;

function defaultSave(): GameSave {
  const vehicles: VehicleState[] = VEHICLES.map(v => ({
    id: v.id,
    owned: v.id === 'gazelle',
    level: 1,
    count: v.id === 'gazelle' ? 1 : 0,
  }));

  const cities: CityState[] = CITIES.map(c => ({
    id: c.id,
    unlocked: c.id === 'moscow',
    active: c.id === 'moscow',
  }));

  const warehouses: WarehouseState[] = CITIES.map(c => ({
    cityId: c.id,
    warehouseId: 'none',
  }));

  const contracts: ContractState[] = [
    { id: 'c1', active: false, completedAt: 0, payout: 500 },
    { id: 'c2', active: false, completedAt: 0, payout: 5000 },
    { id: 'c3', active: false, completedAt: 0, payout: 50000 },
    { id: 'c4', active: false, completedAt: 0, payout: 500000 },
  ];

  return {
    version: SAVE_VERSION,
    money: 100,
    totalEarned: 100,
    prestigeLevel: 0,
    prestigeMultiplier: 1,
    vehicles,
    cities,
    warehouses,
    contracts,
    boost: { multiplier: 1, expiresAt: 0 },
    lastSaveTime: Date.now(),
    totalPlayTime: 0,
  };
}

export function loadSave(): GameSave {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw) as Partial<GameSave>;
    if (!parsed || parsed.version !== SAVE_VERSION) return defaultSave();
    // Merge with default to handle new fields added in updates
    const def = defaultSave();
    const save: GameSave = {
      ...def,
      ...parsed,
      vehicles: def.vehicles.map(dv => {
        const saved = (parsed.vehicles || []).find(sv => sv.id === dv.id);
        return saved ? { ...dv, ...saved } : dv;
      }),
      cities: def.cities.map(dc => {
        const saved = (parsed.cities || []).find(sc => sc.id === dc.id);
        return saved ? { ...dc, ...saved } : dc;
      }),
      warehouses: def.warehouses.map(dw => {
        const saved = (parsed.warehouses || []).find(sw => sw.cityId === dw.cityId);
        return saved ? { ...dw, ...saved } : dw;
      }),
      contracts: def.contracts.map(dc => {
        const saved = (parsed.contracts || []).find(sc => sc.id === dc.id);
        return saved ? { ...dc, ...saved } : dc;
      }),
      boost: parsed.boost ?? def.boost,
      prestigeMultiplier: calcPrestigeMultiplier(parsed.prestigeLevel ?? 0),
    };
    return save;
  } catch (e) {
    console.warn('[SaveSystem] Failed to load save, using default:', e);
    return defaultSave();
  }
}

export function writeSave(save: GameSave): void {
  try {
    save.lastSaveTime = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch (e) {
    console.warn('[SaveSystem] Failed to write save:', e);
  }
}

export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY);
}
