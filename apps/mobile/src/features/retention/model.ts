import { daysBetween } from '@tallsoon/engine';

export type Milestone = '7' | '30' | '100' | 'checkin';
export const milestoneKeys: readonly Milestone[] = ['7', '30', '100', 'checkin'];

/** Calendar-day gates, independent of time zones and daylight-saving transitions. */
export function retentionState(input: {
  today: string;
  planStartedOn: string | null;
  weeklyStartedOn: string | null;
  isPro: boolean;
  plan: 'weekly' | 'annual' | null;
  bestStreak: number;
  measurementCount: number;
}) {
  const day = input.planStartedOn ? daysBetween(input.planStartedOn, input.today) + 1 : 0;
  const weeklyDays = input.weeklyStartedOn ? daysBetween(input.weeklyStartedOn, input.today) : 0;
  return {
    touchpoint: input.isPro && day >= 3 && day < 7 ? 'grocery' as const
      : input.isPro && day >= 7 && day < 14 ? 'weekly' as const : null,
    showAnnual: input.isPro && input.plan === 'weekly' && weeklyDays >= 14,
    milestones: input.isPro ? milestoneKeys.filter((key) => key === 'checkin'
      ? input.measurementCount >= 2 : input.bestStreak >= Number(key)) : [],
  };
}
