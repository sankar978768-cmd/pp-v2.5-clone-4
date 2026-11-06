import { BirdId, PakshaType } from '../types';

export type RelationshipType = 'self' | 'friend' | 'enemy' | 'neutral';

export interface BirdFriendEnemyConfig {
  birdId: BirdId;
  friends: BirdId[];
  enemies: BirdId[];
}

export interface RelationshipMeta {
  type: RelationshipType;
  label: string;
  tamilLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  description: string;
  tamilDescription: string;
}

/**
 * User-provided redefined relationship table for all birds respective to pirai (Valarpirai & Theipirai).
 *
 * Enemy Table:
 * Bird    | Valarpirai        | Theipirai
 * Vulture | Cock, Crow        | Cock, Owl
 * Owl     | Peacock, Cock     | Peacock, Vulture
 * Crow    | Peacock, Vulture  | Peacock, Cock
 * Cock    | Vulture, Owl      | Vulture, Crow
 * Peacock | Crow, Owl         | Crow, Owl
 *
 * Friends Table:
 * Bird    | Valarpirai        | Theipirai
 * Vulture | Peacock, Owl      | Peacock, Crow
 * Owl     | Crow, Vulture     | Crow, Cock
 * Crow    | Owl, Cock         | Owl, Vulture
 * Cock    | Peacock, Crow     | Peacock, Owl
 * Peacock | Vulture, Cock     | Vulture, Cock
 */
export const BIRD_PIRAI_RELATIONSHIPS: Record<PakshaType, Record<BirdId, BirdFriendEnemyConfig>> = {
  valarpirai: {
    vulture: {
      birdId: 'vulture',
      friends: ['peacock', 'owl'],
      enemies: ['cock', 'crow'],
    },
    owl: {
      birdId: 'owl',
      friends: ['crow', 'vulture'],
      enemies: ['peacock', 'cock'],
    },
    crow: {
      birdId: 'crow',
      friends: ['owl', 'cock'],
      enemies: ['peacock', 'vulture'],
    },
    cock: {
      birdId: 'cock',
      friends: ['peacock', 'crow'],
      enemies: ['vulture', 'owl'],
    },
    peacock: {
      birdId: 'peacock',
      friends: ['vulture', 'cock'],
      enemies: ['crow', 'owl'],
    },
  },
  theipirai: {
    vulture: {
      birdId: 'vulture',
      friends: ['peacock', 'crow'],
      enemies: ['cock', 'owl'],
    },
    owl: {
      birdId: 'owl',
      friends: ['crow', 'cock'],
      enemies: ['peacock', 'vulture'],
    },
    crow: {
      birdId: 'crow',
      friends: ['owl', 'vulture'],
      enemies: ['peacock', 'cock'],
    },
    cock: {
      birdId: 'cock',
      friends: ['peacock', 'owl'],
      enemies: ['vulture', 'crow'],
    },
    peacock: {
      birdId: 'peacock',
      friends: ['vulture', 'cock'],
      enemies: ['crow', 'owl'],
    },
  },
};

export const ALL_BIRD_IDS: BirdId[] = ['vulture', 'owl', 'crow', 'cock', 'peacock'];

export function getBirdFriends(birdId: BirdId, paksha: PakshaType = 'valarpirai'): BirdId[] {
  return BIRD_PIRAI_RELATIONSHIPS[paksha]?.[birdId]?.friends || [];
}

export function getBirdEnemies(birdId: BirdId, paksha: PakshaType = 'valarpirai'): BirdId[] {
  return BIRD_PIRAI_RELATIONSHIPS[paksha]?.[birdId]?.enemies || [];
}

export function getBirdNeutrals(birdId: BirdId, paksha: PakshaType = 'valarpirai'): BirdId[] {
  const friends = getBirdFriends(birdId, paksha);
  const enemies = getBirdEnemies(birdId, paksha);
  return ALL_BIRD_IDS.filter((b) => b !== birdId && !friends.includes(b) && !enemies.includes(b));
}

export function getBirdRelationship(
  mainBird: BirdId,
  otherBird: BirdId,
  paksha: PakshaType = 'valarpirai'
): RelationshipType {
  if (mainBird === otherBird) return 'self';
  const friends = getBirdFriends(mainBird, paksha);
  if (friends.includes(otherBird)) return 'friend';
  const enemies = getBirdEnemies(mainBird, paksha);
  if (enemies.includes(otherBird)) return 'enemy';
  return 'neutral';
}

export const RELATIONSHIP_META: Record<RelationshipType, RelationshipMeta> = {
  self: {
    type: 'self',
    label: 'Self',
    tamilLabel: 'சுயம்',
    badgeBg: 'bg-sky-100 dark:bg-sky-950/70 badge-rel-self',
    badgeText: 'text-slate-900 dark:text-sky-200',
    badgeBorder: 'border-sky-300 dark:border-sky-800/80',
    description: 'Own bird energy. Baseline self strength in sub-periods.',
    tamilDescription: 'சொந்த பட்சியின் மூல ஆற்றல்.',
  },
  friend: {
    type: 'friend',
    label: 'Friend',
    tamilLabel: 'நட்பு',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/70 badge-rel-friend',
    badgeText: 'text-slate-900 dark:text-emerald-200',
    badgeBorder: 'border-emerald-300 dark:border-emerald-800/80',
    description: 'Friendly ally. Amplifies auspicious outcomes, harmony, and power in sub-periods.',
    tamilDescription: 'நட்பு பட்சி. சுப காரியங்களுக்கும் அந்தர்தசைக்கும் கூடுதல் நற்பலன்கள் தரும்.',
  },
  enemy: {
    type: 'enemy',
    label: 'Enemy',
    tamilLabel: 'பகை',
    badgeBg: 'bg-rose-100 dark:bg-rose-950/70 badge-rel-enemy',
    badgeText: 'text-slate-900 dark:text-rose-200',
    badgeBorder: 'border-rose-300 dark:border-rose-800/80',
    description: 'Adversary bird. Diminishes vitality; demands heightened caution during sub-periods.',
    tamilDescription: 'பகை பட்சி. ஆற்றல் குறையும்; இந்த பட்சியின் அந்தர்தசையில் மிகுந்த எச்சரிக்கை தேவை.',
  },
  neutral: {
    type: 'neutral',
    label: 'Neutral',
    tamilLabel: 'சமம்',
    badgeBg: 'bg-slate-100 dark:bg-slate-800/80 badge-rel-neutral',
    badgeText: 'text-slate-900 dark:text-slate-200',
    badgeBorder: 'border-slate-300 dark:border-slate-700',
    description: 'Balanced relationship. Delivers standard, moderate effects without alliance or friction.',
    tamilDescription: 'சம பட்சி. நடுநிலையான நடுத்தர பலன்களைத் தரும்.',
  },
};

export interface RelationshipTagInfo {
  tag: 'S' | 'F' | 'E' | 'N';
  labelEn: string;
  labelTa: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

/**
 * Returns user-specified single-letter shorthand tags:
 * F - Friend
 * E - Enemy
 * S - Self
 */
export function getRelationshipTag(rel: RelationshipType): RelationshipTagInfo {
  switch (rel) {
    case 'self':
      return {
        tag: 'S',
        labelEn: 'Self',
        labelTa: 'சுயம்',
        badgeBg: 'bg-sky-100 dark:bg-sky-950/70 badge-rel-self',
        badgeText: 'text-sky-900 dark:text-sky-200',
        badgeBorder: 'border-sky-300 dark:border-sky-800/80',
      };
    case 'friend':
      return {
        tag: 'F',
        labelEn: 'Friend',
        labelTa: 'நட்பு',
        badgeBg: 'bg-emerald-100 dark:bg-emerald-950/70 badge-rel-friend',
        badgeText: 'text-emerald-900 dark:text-emerald-200',
        badgeBorder: 'border-emerald-300 dark:border-emerald-800/80',
      };
    case 'enemy':
      return {
        tag: 'E',
        labelEn: 'Enemy',
        labelTa: 'பகை',
        badgeBg: 'bg-rose-100 dark:bg-rose-950/70 badge-rel-enemy',
        badgeText: 'text-rose-900 dark:text-rose-200',
        badgeBorder: 'border-rose-300 dark:border-rose-800/80',
      };
    default:
      return {
        tag: 'N',
        labelEn: 'Neutral',
        labelTa: 'சமம்',
        badgeBg: 'bg-slate-100 dark:bg-slate-800/80 badge-rel-neutral',
        badgeText: 'text-slate-800 dark:text-slate-200',
        badgeBorder: 'border-slate-300 dark:border-slate-700',
      };
  }
}

