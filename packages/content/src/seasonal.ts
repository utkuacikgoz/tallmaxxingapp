import type { SeasonalPack, Source } from './types';

const NIH_D: Source = { label: 'NIH Office of Dietary Supplements: Vitamin D', url: 'https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/' };
const NHS_D: Source = { label: 'NHS vitamin D', url: 'https://www.nhs.uk/conditions/vitamins-and-minerals/vitamin-d/' };
const AASM: Source = { label: 'AASM pediatric sleep recommendations', url: 'https://jcsm.aasm.org/doi/10.5664/jcsm.5866' };
const NHS_SLEEP: Source = { label: 'NHS sleep and tiredness', url: 'https://www.nhs.uk/live-well/sleep-and-tiredness/' };
const AAP: Source = { label: 'AAP HealthyChildren.org', url: 'https://www.healthychildren.org/' };
const WHO: Source = { label: 'WHO physical activity guidelines (2020)', url: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity' };

export const seasonalPacks: SeasonalPack[] = [
  {
    id: 'winter',
    title: 'Winter light and vitamin D foods',
    months: [11, 12, 1, 2],
    subtitle: 'Short days, so lean on food and any daylight you can get',
    tips: [
      // <!-- REVIEW -->
      {
        key: 'seasonal-winter-foods',
        category: 'nutrition',
        title: 'Vitamin D foods in winter',
        body: 'Salmon, eggs and fortified milk are vitamin D sources. Add one to meals this week.',
        source: NIH_D,
      },
      // <!-- REVIEW -->
      {
        key: 'seasonal-winter-daylight',
        category: 'daylight',
        title: 'Catch the midday light',
        body: {
          parent: 'Days are short, so a 15-minute walk at lunchtime or after school gets them some daylight. Wrap up warm.',
          teen: 'Days are short, so a 15-minute walk at lunchtime or after school gets you some daylight. Wrap up warm.',
        },
        source: NHS_D,
      },
      // <!-- REVIEW -->
      {
        key: 'seasonal-winter-pediatrician',
        category: 'nutrition',
        title: 'Ask about vitamin D',
        body: 'In low-sunlight months, ask your pediatrician whether vitamin D supplements make sense for your family.',
        source: NHS_D,
      },
    ],
  },
  {
    id: 'back-to-school',
    title: 'Back-to-school sleep reset',
    months: [8, 9],
    subtitle: 'Ease the bedtime back, one step at a time',
    tips: [
      // <!-- REVIEW -->
      {
        key: 'seasonal-bts-shift',
        category: 'sleep',
        title: 'Shift bedtime in small steps',
        body: {
          parent: 'Move their bedtime 15 minutes earlier every couple of days until it matches the school-night target.',
          teen: 'Move your bedtime 15 minutes earlier every couple of days until it matches your school-night target.',
        },
        source: AASM,
      },
      // <!-- REVIEW -->
      {
        key: 'seasonal-bts-morning',
        category: 'daylight',
        title: 'Start with morning light',
        body: 'Get up at the school-day time and step outside for a few minutes. Morning light helps reset the body clock.',
        source: NHS_SLEEP,
      },
      // <!-- REVIEW -->
      {
        key: 'seasonal-bts-lunchbox',
        category: 'nutrition',
        title: 'Pack a lunchbox with calcium',
        body: 'Cheese, yogurt or fortified soy milk with fruit and a protein makes a lunchbox that supports healthy growth.',
        source: AAP,
      },
    ],
  },
  {
    id: 'summer',
    title: 'Summer outdoors',
    months: [6, 7],
    subtitle: 'Move more, stay safe in the sun',
    tips: [
      // <!-- REVIEW -->
      {
        key: 'seasonal-summer-play',
        category: 'activity',
        title: 'Long days, more play',
        body: 'Summer is perfect for the daily 60 minutes: swimming, bike rides, ball games and park trips all count.',
        source: WHO,
      },
      // <!-- REVIEW -->
      {
        key: 'seasonal-summer-sun',
        category: 'daylight',
        title: 'Sun safety first',
        body: {
          parent: 'Use shade, a hat and sunscreen when the sun is strong. Short sun-safe outings still help the body make vitamin D.',
          teen: 'Use shade, a hat and sunscreen when the sun is strong. Short sun-safe outings still help your body make vitamin D.',
        },
        source: AAP,
      },
      // <!-- REVIEW -->
      {
        key: 'seasonal-summer-water',
        category: 'hydration',
        title: 'Drink more on hot days',
        body: 'Active days in the heat call for more water. Keep a bottle handy and sip often.',
        source: AAP,
      },
    ],
  },
  {
    id: 'exam-season',
    title: 'Exam season sleep',
    months: [4, 5],
    subtitle: 'Sleep is part of the study plan',
    tips: [
      // <!-- REVIEW -->
      {
        key: 'seasonal-exam-sleep',
        category: 'sleep',
        title: 'Do not trade sleep for study',
        body: {
          parent: 'Late-night cramming can backfire. Sleep helps memory and focus, so protect their bedtime even in exam weeks.',
          teen: 'Late-night cramming can backfire. Sleep helps memory and focus, so protect your bedtime even in exam weeks.',
        },
        source: AASM,
      },
      // <!-- REVIEW -->
      {
        key: 'seasonal-exam-breaks',
        category: 'activity',
        title: 'Move between study blocks',
        body: 'A 10-minute walk or the desk reset between study blocks clears the head and gets the body moving.',
        source: WHO,
      },
      // <!-- REVIEW -->
      {
        key: 'seasonal-exam-caffeine',
        category: 'sleep',
        title: 'Skip the late caffeine',
        body: 'Energy drinks and coffee late in the day can delay sleep. Water and a snack with protein go further.',
        source: AAP,
      },
    ],
  },
];
