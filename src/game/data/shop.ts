export type ShopItemType = "consumable" | "upgrade";

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: ShopItemType;
  color: number;
  baseCost: number;
  inventoryItemId?: string; // for consumables
  statBoost?: { stat: "maxHealth" | "attack" | "defense"; amount: number }; // for upgrades
}

export const SHOP_CATALOG: ShopItem[] = [
  // Consumables
  {
    id: "shop_blood_vial",
    name: "Blood Vial",
    description: "Restore 50 HP in battle.",
    type: "consumable",
    color: 0xe74c3c,
    baseCost: 15,
    inventoryItemId: "blood_vial",
  },
  {
    id: "shop_solomon_elixir",
    name: "Solomon's Elixir",
    description: "Restore 120 HP in battle.",
    type: "consumable",
    color: 0xc9a227,
    baseCost: 35,
    inventoryItemId: "solomon_elixir",
  },
  {
    id: "shop_soul_essence",
    name: "Soul Essence",
    description: "Restore 35 MP in battle.",
    type: "consumable",
    color: 0x3498db,
    baseCost: 20,
    inventoryItemId: "soul_essence",
  },
  {
    id: "shop_abyssal_shard",
    name: "Abyssal Shard",
    description: "Empower your next attack.",
    type: "consumable",
    color: 0x9b59b6,
    baseCost: 40,
    inventoryItemId: "abyssal_shard",
  },
  // Stat upgrades
  {
    id: "upgrade_hp",
    name: "Health Crystal",
    description: "+20 max HP permanently.",
    type: "upgrade",
    color: 0x27ae60,
    baseCost: 28,
    statBoost: { stat: "maxHealth", amount: 20 },
  },
  {
    id: "upgrade_atk",
    name: "Demon's Edge",
    description: "+4 ATK permanently.",
    type: "upgrade",
    color: 0xe67e22,
    baseCost: 32,
    statBoost: { stat: "attack", amount: 4 },
  },
  {
    id: "upgrade_def",
    name: "Seal Ward",
    description: "+3 DEF permanently.",
    type: "upgrade",
    color: 0x95a5a6,
    baseCost: 28,
    statBoost: { stat: "defense", amount: 3 },
  },
];

export function getFloorShop(floor: number): ShopItem[] {
  // Pick 4 items: 2 consumables + 2 upgrades, shuffled per floor
  const seed = floor * 31337;
  const shuffled = [...SHOP_CATALOG].sort((a, b) => {
    const ha = Math.sin(seed + a.id.charCodeAt(0)) * 10000;
    const hb = Math.sin(seed + b.id.charCodeAt(0)) * 10000;
    return (ha - Math.floor(ha)) - (hb - Math.floor(hb));
  });
  const consumables = shuffled.filter((i) => i.type === "consumable").slice(0, 2);
  const upgrades = shuffled.filter((i) => i.type === "upgrade").slice(0, 2);
  return [...consumables, ...upgrades];
}

export function scaledCost(item: ShopItem, floor: number): number {
  // Prices rise slightly on deeper floors
  return Math.floor(item.baseCost * (1 + Math.floor(floor / 15) * 0.2));
}
