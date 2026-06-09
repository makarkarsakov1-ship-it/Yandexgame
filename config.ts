// src/game/config.ts
// Central balance configuration — single source of truth

export interface VehicleConfig {
  id: string;
  name: string;
  baseIncome: number;      // income per second at level 1
  baseCost: number;        // purchase cost
  upgradeCostBase: number; // cost of upgrade at level 1
  maxLevel: number;
  unlockRequirement: number; // total earned to unlock
  icon: string;
}

export interface CityConfig {
  id: string;
  name: string;
  multiplier: number;
  unlockCost: number;
  unlockRequirement: number;
}

export interface WarehouseConfig {
  id: string;
  name: string;
  multiplier: number;
  cost: number;
}

export interface ContractConfig {
  id: string;
  name: string;
  basePayout: number;
  duration: number;   // seconds
  refreshCost: number;
}

export const VEHICLES: VehicleConfig[] = [
  {
    id: 'gazelle',
    name: 'ГАЗель',
    baseIncome: 1.5,
    baseCost: 50,
    upgradeCostBase: 40,
    maxLevel: 200,
    unlockRequirement: 0,
    icon: 'gazelle',
  },
  {
    id: 'bychok',
    name: 'Бычок',
    baseIncome: 6,
    baseCost: 300,
    upgradeCostBase: 200,
    maxLevel: 200,
    unlockRequirement: 500,
    icon: 'bychok',
  },
  {
    id: 'kamaz',
    name: 'КамАЗ',
    baseIncome: 20,
    baseCost: 2000,
    upgradeCostBase: 1500,
    maxLevel: 200,
    unlockRequirement: 5000,
    icon: 'kamaz',
  },
  {
    id: 'man',
    name: 'MAN TGX',
    baseIncome: 80,
    baseCost: 15000,
    upgradeCostBase: 12000,
    maxLevel: 200,
    unlockRequirement: 50000,
    icon: 'man',
  },
  {
    id: 'volvo',
    name: 'Volvo FH',
    baseIncome: 300,
    baseCost: 100000,
    upgradeCostBase: 80000,
    maxLevel: 200,
    unlockRequirement: 500000,
    icon: 'volvo',
  },
  {
    id: 'scania',
    name: 'Scania S',
    baseIncome: 1200,
    baseCost: 750000,
    upgradeCostBase: 600000,
    maxLevel: 200,
    unlockRequirement: 5000000,
    icon: 'scania',
  },
  {
    id: 'tesla',
    name: 'Tesla Semi',
    baseIncome: 5000,
    baseCost: 5000000,
    upgradeCostBase: 4000000,
    maxLevel: 200,
    unlockRequirement: 50000000,
    icon: 'tesla',
  },
];

export const CITIES: CityConfig[] = [
  { id: 'moscow',       name: 'Москва',        multiplier: 1.0, unlockCost: 0,          unlockRequirement: 0 },
  { id: 'tula',         name: 'Тула',          multiplier: 1.2, unlockCost: 5000,        unlockRequirement: 2000 },
  { id: 'kazan',        name: 'Казань',        multiplier: 1.5, unlockCost: 50000,       unlockRequirement: 20000 },
  { id: 'ekaterinburg', name: 'Екатеринбург',  multiplier: 2.0, unlockCost: 500000,      unlockRequirement: 200000 },
  { id: 'novosibirsk',  name: 'Новосибирск',   multiplier: 3.0, unlockCost: 5000000,     unlockRequirement: 2000000 },
  { id: 'vladivostok',  name: 'Владивосток',   multiplier: 5.0, unlockCost: 50000000,    unlockRequirement: 20000000 },
];

export const WAREHOUSES: WarehouseConfig[] = [
  { id: 'none',   name: 'Нет склада',     multiplier: 1.0, cost: 0 },
  { id: 'small',  name: 'Малый склад',    multiplier: 1.2, cost: 10000 },
  { id: 'medium', name: 'Средний склад',  multiplier: 1.5, cost: 100000 },
  { id: 'large',  name: 'Крупный склад',  multiplier: 2.0, cost: 1000000 },
  { id: 'hub',    name: 'Логистический хаб', multiplier: 3.0, cost: 10000000 },
];

export const CONTRACTS: ContractConfig[] = [
  { id: 'c1', name: 'Доставка продуктов',    basePayout: 500,       duration: 300,  refreshCost: 100 },
  { id: 'c2', name: 'Промышленный груз',     basePayout: 5000,      duration: 900,  refreshCost: 1000 },
  { id: 'c3', name: 'Техника и оборудование',basePayout: 50000,     duration: 3600, refreshCost: 10000 },
  { id: 'c4', name: 'Межрегиональная логистика', basePayout: 500000, duration: 14400, refreshCost: 100000 },
];

export const BALANCE = {
  UPGRADE_COST_EXPONENT: 1.15,
  OFFLINE_MAX_HOURS: 8,
  AUTOSAVE_INTERVAL_MS: 10000,
  AD_INTERSTITIAL_INTERVAL_MS: 150000, // 2.5 minutes
  BOOST_DURATION_SEC: 300, // 5 minutes for x3 boost
  BOOST_MULTIPLIER_AD: 3,
  BOOST_MULTIPLIER_RANDOM_MAX: 10,
  CONTRACT_AD_MULTIPLIER: 20,
  LOOT_AD_MIN: 2,
  LOOT_AD_MAX: 20,
  PRESTIGE_DIVISOR: 100_000_000,
  INCOME_DISPLAY_PRECISION: 2,
};
