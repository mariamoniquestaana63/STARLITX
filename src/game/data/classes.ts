export type CharacterClass = "warrior" | "mage" | "rogue" | "cleric";

export interface ClassDefinition {
  id: CharacterClass;
  name: string;
  title: string;
  description: string;
  lore: string;
  color: number;
  stats: {
    health: number;
    attack: number;
    defense: number;
    speed: number;
  };
  skills: Skill[];
}

export interface Skill {
  name: string;
  description: string;
  mpCost: number;
  cooldown: number;
  effect: "damage" | "heal" | "buff" | "debuff";
  multiplier: number;
}

export const CLASSES: ClassDefinition[] = [
  {
    id: "warrior",
    name: "Warrior",
    title: "Knight of the Abyss",
    description: "Unyielding iron. Fights with brutal force and heavy armor.",
    lore:
      "Tempered in the fires of Solomon's first descent, Warriors have faced the Abyss and emerged scarred but unbroken.",
    color: 0xe67e22,
    stats: { health: 150, attack: 22, defense: 16, speed: 10 },
    skills: [
      {
        name: "Cleave",
        description: "A sweeping strike that deals 1.8x damage.",
        mpCost: 20,
        cooldown: 2,
        effect: "damage",
        multiplier: 1.8,
      },
      {
        name: "Iron Will",
        description: "Reduces incoming damage by 50% for one turn.",
        mpCost: 25,
        cooldown: 3,
        effect: "buff",
        multiplier: 0.5,
      },
    ],
  },
  {
    id: "mage",
    name: "Mage",
    title: "Sorcerer of Forbidden Seals",
    description: "Arcane devastation. Destroys enemies before they can react.",
    lore:
      "Wielding sigils torn from demonkind itself, Mages bend reality — at a cost to their own fragile bodies.",
    color: 0x8e44ad,
    stats: { health: 80, attack: 36, defense: 5, speed: 14 },
    skills: [
      {
        name: "Soul Burst",
        description: "Unleashes condensed soul energy for 2.5x damage.",
        mpCost: 30,
        cooldown: 2,
        effect: "damage",
        multiplier: 2.5,
      },
      {
        name: "Void Drain",
        description: "Drains demon's power, dealing 1.5x and restoring 15 MP.",
        mpCost: 15,
        cooldown: 3,
        effect: "damage",
        multiplier: 1.5,
      },
    ],
  },
  {
    id: "rogue",
    name: "Rogue",
    title: "Shadow of the 72nd Key",
    description: "Swift and lethal. Strikes from darkness with critical precision.",
    lore:
      "Born in the underground cults surrounding Solomon's Abyss, Rogues learned to move unseen between the demon seals.",
    color: 0x27ae60,
    stats: { health: 105, attack: 27, defense: 8, speed: 22 },
    skills: [
      {
        name: "Shadow Strike",
        description:
          "Strikes from blind spot. 40% chance to deal 3x crit damage.",
        mpCost: 20,
        cooldown: 1,
        effect: "damage",
        multiplier: 1.5,
      },
      {
        name: "Vanish",
        description: "Disappear for one turn — next attack always crits.",
        mpCost: 30,
        cooldown: 4,
        effect: "buff",
        multiplier: 3.0,
      },
    ],
  },
  {
    id: "cleric",
    name: "Cleric",
    title: "Invoker of Solomon's Name",
    description:
      "Divine endurance. Sustains through battles with holy healing and light.",
    lore:
      "Priests who memorized Solomon's sacred prayers, Clerics channel divine light even in the deepest darkness of the Abyss.",
    color: 0xf1c40f,
    stats: { health: 120, attack: 17, defense: 12, speed: 9 },
    skills: [
      {
        name: "Holy Smite",
        description: "Channels divine energy for 1.6x damage against demons.",
        mpCost: 20,
        cooldown: 2,
        effect: "damage",
        multiplier: 1.6,
      },
      {
        name: "Sacred Heal",
        description: "Restores 40% of max HP.",
        mpCost: 35,
        cooldown: 3,
        effect: "heal",
        multiplier: 0.4,
      },
    ],
  },
];

export function getClass(id: CharacterClass): ClassDefinition {
  return CLASSES.find((c) => c.id === id)!;
}

export function getBaseStats(cls: CharacterClass) {
  return getClass(cls).stats;
}

export function getScaledStats(cls: CharacterClass, level: number) {
  const base = getBaseStats(cls);
  const factor = 1 + (level - 1) * 0.12;
  return {
    health: Math.floor(base.health * factor),
    maxHealth: Math.floor(base.health * factor),
    attack: Math.floor(base.attack * factor),
    defense: Math.floor(base.defense * factor),
    speed: base.speed,
  };
}

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}
