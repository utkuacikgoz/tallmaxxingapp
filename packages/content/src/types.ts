/**
 * Program content schema (brief §12). All content is bundled; nothing is fetched.
 * Every paragraph that needs expert review carries a `<!-- REVIEW -->` marker in a comment next to it.
 */

/** Age bands used to pick numbers and items. Ages outside 2–21 never reach the program. */
export type AgeBand = '2-5' | '6-8' | '9-12' | '13-17' | '18-21';

export type Sex = 'female' | 'male';

/**
 * Text that differs by who is reading: the parent path talks about "them / your child",
 * the teen path talks to "you". A plain string is used for both.
 * Placeholders in braces are filled at runtime: {bedtime}, {sleepRange}, {calcium}, {name}.
 */
export type Copy = string | { parent: string; teen: string };

export interface Source {
  /** Short, plain label, e.g. "WHO physical activity guidelines (2020)". */
  label: string;
  url: string;
}

/** Icon names the app can render (SF Symbols on iOS, Material Symbols on Android). */
export type IconName =
  | 'stretch'
  | 'moon'
  | 'meal'
  | 'sun'
  | 'water'
  | 'jump'
  | 'run'
  | 'ball'
  | 'milk'
  | 'ruler'
  | 'book'
  | 'bed'
  | 'phoneOff'
  | 'cart'
  | 'heart'
  | 'bolt'
  | 'leaf'
  | 'list'
  | 'chart'
  | 'calendar'
  | 'pill'
  | 'egg';

export type HabitCategory = 'sleep' | 'activity' | 'nutrition' | 'posture' | 'daylight' | 'hydration';

/**
 * A habit row on the Today tab. Today shows 5 habits, one per slot, picked by age band and weekday:
 * slot "move" (activity or posture), "sleep", "food", "outside" (daylight), "water" (hydration).
 */
export interface Habit {
  key: string;
  slot: 'move' | 'sleep' | 'food' | 'outside' | 'water';
  category: HabitCategory;
  icon: IconName;
  /** Row title, ≤ 32 characters, e.g. "Morning stretch & posture", "Lights out by {bedtime}". */
  title: Copy;
  /** Row subtitle, ≤ 44 characters, e.g. "8-minute mobility routine", "Aim for {sleepRange}". */
  subtitle: Copy;
  bands: AgeBand[];
  /** Optional routine the row opens. */
  routineKey?: string;
  /** One or two sentences: why this habit supports normal growth. No cm claims. */
  why: Copy;
  source: Source;
}

export interface RoutineStep {
  title: string;
  /** One sentence how-to, plain and safe. */
  detail: string;
  /** Seconds or reps label, e.g. "30 s" or "10 reps". */
  amount: string;
}

/** Follow-along routine, 5–10 minutes. Framed as fitness and posture, never "stretch to get taller". */
export interface Routine {
  key: string;
  title: string;
  minutes: number;
  focus: 'posture' | 'mobility' | 'bone' | 'core' | 'family';
  bands: AgeBand[];
  intro: Copy;
  steps: RoutineStep[];
  source: Source;
}

export type Aisle = 'produce' | 'dairy' | 'protein' | 'bakery' | 'pantry' | 'frozen';

export interface Ingredient {
  item: string;
  aisle: Aisle;
  /** Shopping quantity for one family meal, e.g. "1 carton", "6". */
  qty: string;
}

export interface Meal {
  key: string;
  name: string;
  slot: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  /** One line, e.g. "Calcium + protein in one bowl". */
  why: string;
  highlights: Array<'protein' | 'calcium' | 'vitaminD'>;
  tags: Array<'vegetarian' | 'dairyFree'>;
  minutes: number;
  ingredients: Ingredient[];
}

export interface Tip {
  key: string;
  category: HabitCategory | 'growth';
  title: string;
  body: Copy;
  source: Source;
}

export interface WeekPlanDay {
  day: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  /** Short focus, e.g. "Set the bedtime". */
  focus: string;
  /** Exactly 3 tasks, each ≤ 60 characters. */
  tasks: [Copy, Copy, Copy];
  endsWith: string;
}

export interface FocusTarget {
  key: 'sleep' | 'calcium' | 'active' | 'vitaminD';
  icon: IconName;
  label: string;
  /** Value per band, e.g. "9–12 h". */
  value: Record<AgeBand, string>;
  /** Suffix, e.g. "a day". */
  per: string;
  source: Source;
}

export interface GuideSection {
  id: string;
  title: string;
  /** Plain text paragraphs. Bullets start with "• ". */
  paragraphs: string[];
}

export interface Guide {
  id: string;
  title: string;
  subtitle: string;
  sections: GuideSection[];
  sources: Source[];
}

export interface NotificationLines {
  morning: Copy[];
  bedtime: Copy[];
  streak: Copy[];
  weekly: Copy[];
  checkin: Copy[];
  spurt: Copy[];
  /** Free users: the single 3-month re-measure reminder. */
  remeasure: Copy[];
}

export interface SeasonalPack {
  id: string;
  title: string;
  /** Months (1–12) the pack is active in, northern hemisphere. */
  months: number[];
  subtitle: string;
  tips: Tip[];
}
