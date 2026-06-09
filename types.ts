// src/game/types.ts

export interface VehicleState {
  id: string;
  owned: boolean;
  level: number;
  count: number; // number of this vehicle owned
}

export interface CityState {
  id: string;
  unlocked: boolean;
  active: boolean; // only one city can be active at a time
}

export interface WarehouseState {
  cityId: string;
  warehouseId: string; // current warehouse tier for that city
}

export interface ContractState {
  id: string;
  active: boolean;
  completedAt: number; // timestamp ms, 0 = not started
  payout: number;      // calculated payout for this instance
}

export interface BoostState {
  multiplier: number;
  expiresAt: number; // timestamp ms
}

export interface GameSave {
  version: number;
  money: number;
  totalEarned: number;
  prestigeLevel: number;
  prestigeMultiplier: number;
  vehicles: VehicleState[];
  cities: CityState[];
  warehouses: WarehouseState[];
  contracts: ContractState[];
  boost: BoostState;
  lastSaveTime: number; // timestamp ms for offline calc
  totalPlayTime: number; // seconds
}
