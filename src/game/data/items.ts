export type ItemEffect = "heal_hp" | "heal_mp" | "boost_attack";

export interface Item {
  id: string;
  name: string;
  description: string;
  effect: ItemEffect;
  value: number;
  color: number;
  dropWeight: number; // relative drop probability
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
}

export const ITEMS: Item[] = [
  {
    id: "blood_vial",
    name: "Blood Vial",
    description: "A vial of consecrated blood. Restores 50 HP.",
    effect: "heal_hp",
    value: 50,
    color: 0xe74c3c,
    dropWeight: 50,
  },
  {
    id: "solomon_elixir",
    name: "Solomon's Elixir",
    description: "Blessed by the 72nd seal. Restores 120 HP.",
    effect: "heal_hp",
    value: 120,
    color: 0xc9a227,
    dropWeight: 20,
  },
  {
    id: "soul_essence",
    name: "Soul Essence",
    description: "Distilled demonic energy. Restores 35 MP.",
    effect: "heal_mp",
    value: 35,
    color: 0x3498db,
    dropWeight: 35,
  },
  {
    id: "abyssal_shard",
    name: "Abyssal Shard",
    description: "A fragment of the Abyss. Boosts your next attack by 50%.",
    effect: "boost_attack",
    value: 50,
    color: 0x9b59b6,
    dropWeight: 15,
  },
];

export function getItem(id: string): Item | undefined {
  return ITEMS.find((i) => i.id === id);
}

export function rollItemDrop(floor: number): InventoryItem | null {
  // 35% base drop chance, slightly higher on deeper floors
  const dropChance = Math.min(0.35 + floor * 0.003, 0.55);
  if (Math.random() > dropChance) return null;

  // Weighted random pick
  const totalWeight = ITEMS.reduce((s, i) => s + i.dropWeight, 0);
  let roll = Math.random() * totalWeight;
  for (const item of ITEMS) {
    roll -= item.dropWeight;
    if (roll <= 0) return { itemId: item.id, quantity: 1 };
  }
  return { itemId: ITEMS[0].id, quantity: 1 };
}

export function addToInventory(
  inventory: InventoryItem[],
  drop: InventoryItem
): InventoryItem[] {
  const existing = inventory.find((i) => i.itemId === drop.itemId);
  if (existing) {
    return inventory.map((i) =>
      i.itemId === drop.itemId ? { ...i, quantity: i.quantity + drop.quantity } : i
    );
  }
  return [...inventory, drop];
}

export function removeFromInventory(
  inventory: InventoryItem[],
  itemId: string
): InventoryItem[] {
  return inventory
    .map((i) => (i.itemId === itemId ? { ...i, quantity: i.quantity - 1 } : i))
    .filter((i) => i.quantity > 0);
}
