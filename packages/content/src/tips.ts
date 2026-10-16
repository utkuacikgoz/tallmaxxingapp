import type { Source, Tip } from './types';

const AAP: Source = { label: 'AAP HealthyChildren.org', url: 'https://www.healthychildren.org/' };
const AASM: Source = { label: 'AASM pediatric sleep recommendations', url: 'https://jcsm.aasm.org/doi/10.5664/jcsm.5866' };
const NIH_CA: Source = { label: 'NIH Office of Dietary Supplements: Calcium', url: 'https://ods.od.nih.gov/factsheets/Calcium-HealthProfessional/' };
const NIH_D: Source = { label: 'NIH Office of Dietary Supplements: Vitamin D', url: 'https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/' };
const WHO: Source = { label: 'WHO physical activity guidelines (2020)', url: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity' };
const NHS_SLEEP: Source = { label: 'NHS sleep and tiredness', url: 'https://www.nhs.uk/live-well/sleep-and-tiredness/' };
const NHS_D: Source = { label: 'NHS vitamin D', url: 'https://www.nhs.uk/conditions/vitamins-and-minerals/vitamin-d/' };
const CDC_WATER: Source = { label: 'CDC healthy drinks', url: 'https://www.cdc.gov/healthy-weight-growth/water-healthy-drinks/index.html' };
const ENDO: Source = { label: 'Hormone Health Network (Endocrine Society)', url: 'https://www.hormone.org/' };
const CDC_PA: Source = { label: 'CDC physical activity basics', url: 'https://www.cdc.gov/physical-activity-basics/index.html' };

export const tips: Tip[] = [
  // <!-- REVIEW -->
  {
    key: 'tip-deep-sleep',
    category: 'sleep',
    title: 'Deep sleep does the work',
    body: {
      parent: 'Growth hormone is released mostly during deep sleep. A steady bedtime gives them the best chance at plenty of it.',
      teen: 'Growth hormone is released mostly during deep sleep. A steady bedtime gives you the best chance at plenty of it.',
    },
    source: AASM,
  },
  // <!-- REVIEW -->
  {
    key: 'tip-sleep-hours',
    category: 'sleep',
    title: 'Hours matter by age',
    body: 'Experts recommend 10–13 hours for ages 3–5, 9–12 for ages 6–12, and 8–10 for teens. Naps count for the youngest.',
    source: AASM,
  },
  // <!-- REVIEW -->
  {
    key: 'tip-weekend-sleep',
    category: 'sleep',
    title: 'Weekends count too',
    body: {
      parent: 'A bedtime that swings by hours on weekends can leave them groggy on Monday. Try to stay within an hour.',
      teen: 'A bedtime that swings by hours on weekends can leave you groggy on Monday. Try to stay within an hour.',
    },
    source: NHS_SLEEP,
  },
  // <!-- REVIEW -->
  {
    key: 'tip-screens',
    category: 'sleep',
    title: 'Dim the screens',
    body: {
      parent: 'Screens right before bed can delay sleep. A screen-free last hour helps them fall asleep more easily.',
      teen: 'Screens right before bed can delay sleep. A screen-free last hour helps you fall asleep more easily.',
    },
    source: AAP,
  },
  // <!-- REVIEW -->
  {
    key: 'tip-bone-bank',
    category: 'growth',
    title: 'The growing years build the bone bank',
    body: {
      parent: 'Most peak bone mass is built by the end of the teen years, so these years are the time to build it.',
      teen: 'Most peak bone mass is built by the end of the teen years, so right now is your chance to build it.',
    },
    source: NIH_CA,
  },
  // <!-- REVIEW -->
  {
    key: 'tip-calcium-needs',
    category: 'nutrition',
    title: 'Calcium needs go up at 9',
    body: 'The daily target is 1,000 mg for ages 4–8, then 1,300 mg for ages 9–18, when bones are building fastest.',
    source: NIH_CA,
  },
  // <!-- REVIEW -->
  {
    key: 'tip-calcium-nodairy',
    category: 'nutrition',
    title: 'Calcium without dairy',
    body: 'Fortified soy milk, calcium-set tofu and canned salmon with bones all bring calcium. Check labels for the amount.',
    source: NIH_CA,
  },
  // <!-- REVIEW -->
  {
    key: 'tip-vitd-foods',
    category: 'nutrition',
    title: 'Where vitamin D hides',
    body: 'Salmon, eggs and fortified milk are good sources. It helps the body absorb calcium. Ask your pediatrician about vitamin D supplements.',
    source: NIH_D,
  },
  // <!-- REVIEW -->
  {
    key: 'tip-vitd-sun',
    category: 'daylight',
    title: 'Sunlight and vitamin D',
    body: 'Skin makes vitamin D in sunlight, but sunscreen and shade matter too. Short, regular time outside is plenty to start.',
    source: NHS_D,
  },
  // <!-- REVIEW -->
  {
    key: 'tip-protein',
    category: 'nutrition',
    title: 'Protein for building',
    body: {
      parent: 'Growing bodies use protein to build and repair muscle. Spread it across meals: eggs, beans, fish, yogurt or chicken.',
      teen: 'Your body uses protein to build and repair muscle. Spread it across meals: eggs, beans, fish, yogurt or chicken.',
    },
    source: AAP,
  },
  // <!-- REVIEW -->
  {
    key: 'tip-active-minutes',
    category: 'activity',
    title: '60 minutes a day',
    body: 'WHO recommends an average of 60 minutes a day of moderate to vigorous activity for ages 5–17. Play, sport and walking all count.',
    source: WHO,
  },
  // <!-- REVIEW -->
  {
    key: 'tip-bone-loading',
    category: 'activity',
    title: 'Jumping builds strong bones',
    body: 'Activities with impact, like jumping, skipping and running, help bones build strength during childhood and the teen years.',
    source: WHO,
  },
  // <!-- REVIEW -->
  {
    key: 'tip-posture',
    category: 'posture',
    title: 'Posture is a fitness skill',
    body: {
      parent: 'Good posture comes from a strong core and good habits, not from standing stiffly. Short movement breaks help.',
      teen: 'Good posture comes from a strong core and good habits, not from standing stiffly. Short movement breaks help.',
    },
    source: CDC_PA,
  },
  // <!-- REVIEW -->
  {
    key: 'tip-water',
    category: 'hydration',
    title: 'Water is the default drink',
    body: 'Plain water keeps energy and focus up through the day. Milk or fortified alternatives with meals add calcium.',
    source: CDC_WATER,
  },
  // <!-- REVIEW -->
  {
    key: 'tip-natural-pace',
    category: 'growth',
    title: 'Everyone grows at their own pace',
    body: {
      parent: 'Kids start puberty and have growth spurts at different ages, and that is normal. Tracking the trend over time says more than one number.',
      teen: 'People start puberty and have growth spurts at different ages, and that is normal. Your own trend over time says more than one number.',
    },
    source: ENDO,
  },
  // <!-- REVIEW -->
  {
    key: 'tip-measure-trend',
    category: 'growth',
    title: 'Measure the same way each time',
    body: 'Measure at the same time of day, with the same method, every few months. Morning is best, since height dips slightly through the day.',
    source: AAP,
  },
  // <!-- REVIEW -->
  {
    key: 'tip-family-habits',
    category: 'activity',
    title: 'Habits spread through families',
    body: {
      parent: 'Kids copy what they see. When you walk, eat and sleep on a steady rhythm, they find it easier to do the same.',
      teen: 'Habits are easier with company. Invite someone at home to join your walk, your meal or your bedtime routine.',
    },
    source: AAP,
  },
];
