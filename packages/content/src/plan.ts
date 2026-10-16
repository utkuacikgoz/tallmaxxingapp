import type { FocusTarget, WeekPlanDay } from './types';

export const weekOnePlan: WeekPlanDay[] = [
  {
    day: 1,
    focus: 'Set the bedtime',
    tasks: [
      { parent: 'Pick a bedtime for your child and lock it in', teen: 'Pick your bedtime and lock it in' },
      'Set your reminder times for the day',
      'Tick your first 3 habits today',
    ],
    endsWith: 'First tick 🎉',
  },
  {
    day: 2,
    focus: 'Measure properly',
    tasks: [
      'Read the how-to-measure guide (2 minutes)',
      { parent: 'Measure your child in the morning, no shoes', teen: 'Measure in the morning, no shoes' },
      'Save the number as your baseline',
    ],
    endsWith: 'Baseline saved',
  },
  {
    day: 3,
    focus: 'Plan the groceries',
    tasks: [
      'Look over this week’s meal ideas',
      'Check the list for calcium and protein foods',
      'Share the grocery list with the family',
    ],
    endsWith: 'List shared',
  },
  {
    day: 4,
    focus: 'Family activity',
    tasks: [
      'Pick a time for the 10-minute family activity',
      { parent: 'Let your child choose the first game', teen: 'Choose the first game' },
      'Do the activity and tick it off',
    ],
    endsWith: 'Activity ticked',
  },
  {
    day: 5,
    focus: 'Posture and mobility',
    tasks: [
      'Open the posture reset routine',
      { parent: 'Do it together, nice and slow', teen: 'Do it slow and keep it comfortable' },
      'Finish with the mobility flow if you have time',
    ],
    endsWith: 'Routine done',
  },
  {
    day: 6,
    focus: 'Sleep check',
    tasks: [
      'Look back at this week’s bedtimes',
      { parent: 'Ask your child how mornings felt', teen: 'Notice how your mornings felt' },
      'Nudge bedtime 15 minutes if it would help',
    ],
    endsWith: 'Bedtime tweak',
  },
  {
    day: 7,
    focus: 'Your first score',
    tasks: [
      'See your first Growth Habits Score',
      'Look over your 7-day card',
      'Pick one habit to keep going next week',
    ],
    endsWith: 'Share your week',
  },
];

export const focusTargets: FocusTarget[] = [
  {
    key: 'sleep',
    icon: 'moon',
    label: 'Sleep',
    value: {
      '2-5': '10–13 h',
      '6-8': '9–12 h',
      '9-12': '9–12 h',
      '13-17': '8–10 h',
      '18-21': '7–9 h',
    },
    per: 'a night',
    source: {
      label: 'AASM and AAP pediatric sleep recommendations',
      url: 'https://jcsm.aasm.org/doi/10.5664/jcsm.5866',
    },
  },
  {
    key: 'calcium',
    icon: 'milk',
    label: 'Calcium',
    value: {
      '2-5': '700–1,000 mg',
      '6-8': '1,000 mg',
      '9-12': '1,300 mg',
      '13-17': '1,300 mg',
      '18-21': '1,000–1,300 mg',
    },
    per: 'a day',
    source: {
      label: 'NIH Office of Dietary Supplements: Calcium',
      url: 'https://ods.od.nih.gov/factsheets/Calcium-HealthProfessional/',
    },
  },
  {
    key: 'active',
    icon: 'run',
    label: 'Active time (adults 18+: 150–300 min a week, about 20–40 a day)',
    value: {
      '2-5': '180 min of play',
      '6-8': '60 min',
      '9-12': '60 min',
      '13-17': '60 min',
      '18-21': '20–40 min',
    },
    per: 'a day',
    source: {
      label: 'WHO physical activity guidelines (2020)',
      url: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity',
    },
  },
  {
    key: 'vitaminD',
    icon: 'sun',
    label: 'Vitamin D, from food and sunlight',
    value: {
      '2-5': '600 IU',
      '6-8': '600 IU',
      '9-12': '600 IU',
      '13-17': '600 IU',
      '18-21': '600 IU',
    },
    per: 'a day',
    source: {
      label: 'NIH Office of Dietary Supplements: Vitamin D',
      url: 'https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/',
    },
  },
];
