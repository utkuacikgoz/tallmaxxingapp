import type { Habit } from './types';

const WHO_PA = {
  label: 'WHO physical activity guidelines (2020)',
  url: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity',
};
const CDC_PA = {
  label: 'CDC physical activity basics',
  url: 'https://www.cdc.gov/physical-activity-basics/index.html',
};
const AASM_SLEEP = {
  label: 'AASM pediatric sleep recommendations',
  url: 'https://jcsm.aasm.org/doi/10.5664/jcsm.5866',
};
const AAP = {
  label: 'AAP HealthyChildren.org',
  url: 'https://www.healthychildren.org/',
};
const NIH_CALCIUM = {
  label: 'NIH Office of Dietary Supplements: Calcium',
  url: 'https://ods.od.nih.gov/factsheets/Calcium-HealthProfessional/',
};
const NIH_VITD = {
  label: 'NIH Office of Dietary Supplements: Vitamin D',
  url: 'https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/',
};
const NHS_SLEEP = {
  label: 'NHS sleep and tiredness',
  url: 'https://www.nhs.uk/live-well/sleep-and-tiredness/',
};
const CDC_WATER = {
  label: 'CDC healthy drinks',
  url: 'https://www.cdc.gov/healthy-weight-growth/water-healthy-drinks/index.html',
};
const NHS_EXERCISE = {
  label: 'NHS exercise guidelines',
  url: 'https://www.nhs.uk/live-well/exercise/',
};

export const habits: Habit[] = [
  // ---------- MOVE ----------
  // <!-- REVIEW -->
  {
    key: 'move-posture',
    slot: 'move',
    category: 'posture',
    icon: 'stretch',
    title: 'Posture reset',
    subtitle: '6-minute posture routine',
    bands: ['2-5', '6-8', '9-12', '13-17', '18-21'],
    routineKey: 'posture-reset',
    why: {
      parent:
        'Simple posture moves build body awareness and the strength that helps them sit and stand comfortably. It is fitness, not a fix.',
      teen: 'Simple posture moves build body awareness and the strength that helps you sit and stand comfortably. It is fitness, not a fix.',
    },
    source: NHS_EXERCISE,
  },
  // <!-- REVIEW -->
  {
    key: 'move-mobility',
    slot: 'move',
    category: 'posture',
    icon: 'stretch',
    title: 'Mobility flow',
    subtitle: '8-minute gentle mobility',
    bands: ['6-8', '9-12', '13-17', '18-21'],
    routineKey: 'mobility-flow',
    why: {
      parent:
        'Gentle mobility keeps joints moving well and helps them feel good in their body. Think comfort and fitness, nothing more.',
      teen: 'Gentle mobility keeps your joints moving well and helps you feel good in your body. Think comfort and fitness, nothing more.',
    },
    source: NHS_EXERCISE,
  },
  // <!-- REVIEW -->
  {
    key: 'move-jump',
    slot: 'move',
    category: 'activity',
    icon: 'jump',
    title: 'Jump and skip',
    subtitle: '7 minutes of bone-loading play',
    bands: ['2-5', '6-8', '9-12', '13-17'],
    routineKey: 'bone-boost',
    why: {
      parent:
        'Jumping and skipping put healthy impact through the bones, and the growing years are when bones build strength fastest.',
      teen: 'Jumping and skipping put healthy impact through your bones, and the growing years are when bones build strength fastest.',
    },
    source: WHO_PA,
  },
  // <!-- REVIEW -->
  {
    key: 'move-core',
    slot: 'move',
    category: 'activity',
    icon: 'bolt',
    title: 'Core and balance',
    subtitle: '8 minutes, no equipment',
    bands: ['9-12', '13-17', '18-21'],
    routineKey: 'core-steady',
    why: {
      parent:
        'A strong middle supports good posture and makes every sport easier. WHO recommends muscle-strengthening activity on at least 3 days a week.',
      teen: 'A strong middle supports good posture and makes every sport easier. WHO recommends muscle-strengthening activity on at least 3 days a week.',
    },
    source: WHO_PA,
  },
  // <!-- REVIEW -->
  {
    key: 'move-family',
    slot: 'move',
    category: 'activity',
    icon: 'run',
    title: 'Family activity',
    subtitle: '10 minutes, everyone joins in',
    bands: ['2-5', '6-8', '9-12', '13-17', '18-21'],
    routineKey: 'family-activity',
    why: {
      parent:
        'Kids move more when the whole family does. Ten minutes together is an easy way to reach the daily activity target.',
      teen: 'Ten minutes with the family counts toward your daily activity, and it is more fun with company.',
    },
    source: CDC_PA,
  },
  // <!-- REVIEW -->
  {
    key: 'move-animals',
    slot: 'move',
    category: 'activity',
    icon: 'ball',
    title: 'Animal moves',
    subtitle: 'Hop, crawl and stomp for 6 minutes',
    bands: ['2-5', '6-8'],
    routineKey: 'animal-moves',
    why: 'Active play builds balance, strength and coordination. WHO suggests 180 minutes of activity a day for ages 3 to 4, and play counts.',
    source: WHO_PA,
  },
  // <!-- REVIEW -->
  {
    key: 'move-desk',
    slot: 'move',
    category: 'posture',
    icon: 'stretch',
    title: 'Desk reset',
    subtitle: '5-minute posture break',
    bands: ['9-12', '13-17', '18-21'],
    routineKey: 'desk-reset',
    why: {
      parent:
        'Long stretches of sitting are tough on any body. A short break gets them moving and helps them sit comfortably again.',
      teen: 'Long stretches of sitting are tough on any body. A short break gets you moving and helps you sit comfortably again.',
    },
    source: NHS_EXERCISE,
  },
  // <!-- REVIEW -->
  {
    key: 'move-wind',
    slot: 'move',
    category: 'posture',
    icon: 'moon',
    title: 'Evening wind-down moves',
    subtitle: '6 minutes to switch off',
    bands: ['6-8', '9-12', '13-17', '18-21'],
    routineKey: 'evening-wind-down',
    why: {
      parent:
        'Slow, easy movement and deep breaths help the body switch to rest mode, which makes bedtime smoother.',
      teen: 'Slow, easy movement and deep breaths help your body switch to rest mode, which makes bedtime smoother.',
    },
    source: NHS_SLEEP,
  },

  // ---------- SLEEP ----------
  // <!-- REVIEW -->
  {
    key: 'sleep-lights-out',
    slot: 'sleep',
    category: 'sleep',
    icon: 'moon',
    title: 'Lights out by {bedtime}',
    subtitle: 'Aim for {sleepRange}',
    bands: ['2-5', '6-8', '9-12', '13-17', '18-21'],
    why: {
      parent:
        'Growth hormone is released mostly during deep sleep, so a steady bedtime is one of the best things you can do for their growth years.',
      teen: 'Growth hormone is released mostly during deep sleep. A steady bedtime is one of the easiest wins in your growth years.',
    },
    source: AASM_SLEEP,
  },
  // <!-- REVIEW -->
  {
    key: 'sleep-screens-off',
    slot: 'sleep',
    category: 'sleep',
    icon: 'phoneOff',
    title: 'Screens off before bed',
    subtitle: 'Wind down for the last hour',
    bands: ['2-5', '6-8', '9-12', '13-17', '18-21'],
    why: {
      parent:
        'Screens close to bedtime can make it harder to fall asleep. A calm last hour helps them reach the deep sleep their body uses for growth.',
      teen: 'Screens close to bedtime can make it harder to fall asleep. A calm last hour helps you reach the deep sleep your body uses for growth.',
    },
    source: AAP,
  },
  // <!-- REVIEW -->
  {
    key: 'sleep-story',
    slot: 'sleep',
    category: 'sleep',
    icon: 'book',
    title: 'Story time before bed',
    subtitle: 'Same quiet order each night',
    bands: ['2-5', '6-8', '9-12'],
    why: 'A short, predictable bedtime routine tells the body it is time to sleep. Kids settle faster when the steps stay the same.',
    source: NHS_SLEEP,
  },
  // <!-- REVIEW -->
  {
    key: 'sleep-wake-steady',
    slot: 'sleep',
    category: 'sleep',
    icon: 'bed',
    title: 'Same wake-up time',
    subtitle: 'Keep the body clock steady',
    bands: ['9-12', '13-17', '18-21'],
    why: {
      parent:
        'A steady wake-up time, even on weekends, keeps the body clock on track and makes bedtime easier.',
      teen: 'A steady wake-up time, even on weekends, keeps your body clock on track and makes bedtime easier.',
    },
    source: AASM_SLEEP,
  },

  // ---------- FOOD ----------
  // <!-- REVIEW -->
  {
    key: 'food-calcium',
    slot: 'food',
    category: 'nutrition',
    icon: 'milk',
    title: 'A calcium food today',
    subtitle: 'Aim for {calcium}',
    bands: ['2-5', '6-8', '9-12', '13-17', '18-21'],
    why: {
      parent:
        'Bones keep building through the growing years, and calcium is a main building block. Yogurt, milk, cheese or fortified soy all count.',
      teen: 'Your bones keep building through the growing years, and calcium is a main building block. Yogurt, milk, cheese or fortified soy all count.',
    },
    source: NIH_CALCIUM,
  },
  // <!-- REVIEW -->
  {
    key: 'food-protein',
    slot: 'food',
    category: 'nutrition',
    icon: 'egg',
    title: 'Protein at breakfast',
    subtitle: 'Eggs, yogurt, beans or nut butter',
    bands: ['2-5', '6-8', '9-12', '13-17', '18-21'],
    why: {
      parent:
        'Growing bodies use protein to build and repair muscle and tissue. A protein-rich breakfast also keeps them full through the morning.',
      teen: 'Your body uses protein to build and repair muscle and tissue. A protein-rich breakfast also keeps you full through the morning.',
    },
    source: AAP,
  },
  // <!-- REVIEW -->
  {
    key: 'food-color',
    slot: 'food',
    category: 'nutrition',
    icon: 'leaf',
    title: 'Color on the plate',
    subtitle: 'Fruit or veg with each meal',
    bands: ['2-5', '6-8', '9-12', '13-17', '18-21'],
    why: 'Fruit and vegetables bring vitamins, minerals and fiber that support healthy growth. Any color counts, fresh or frozen.',
    source: AAP,
  },
  // <!-- REVIEW -->
  {
    key: 'food-calcium-dairyfree',
    slot: 'food',
    category: 'nutrition',
    icon: 'leaf',
    title: 'Calcium, dairy-free',
    subtitle: 'Fortified soy, calcium-set tofu',
    bands: ['2-5', '6-8', '9-12', '13-17', '18-21'],
    why: {
      parent:
        'No dairy? Fortified soy milk, calcium-set tofu, canned salmon with bones and some leafy greens all bring calcium. Check the label for calcium.',
      teen: 'No dairy? Fortified soy milk, calcium-set tofu, canned salmon with bones and some leafy greens all bring calcium. Check the label.',
    },
    source: NIH_CALCIUM,
  },
  // <!-- REVIEW -->
  {
    key: 'food-vitd',
    slot: 'food',
    category: 'nutrition',
    icon: 'egg',
    title: 'A vitamin D food today',
    subtitle: 'Eggs, salmon or fortified milk',
    bands: ['2-5', '6-8', '9-12', '13-17', '18-21'],
    why: 'Vitamin D helps the body absorb calcium for strong bones. Few foods have much, so eggs, oily fish and fortified milk are worth a spot. Ask your pediatrician about vitamin D supplements.',
    source: NIH_VITD,
  },
  // <!-- REVIEW -->
  {
    key: 'food-snack',
    slot: 'food',
    category: 'nutrition',
    icon: 'meal',
    title: 'Smart snack',
    subtitle: 'Yogurt, fruit, cheese or hummus',
    bands: ['2-5', '6-8', '9-12', '13-17', '18-21'],
    why: {
      parent:
        'Growing kids get hungry between meals. A snack with protein and calcium gives them steady energy and more of what bones use.',
      teen: 'Growing bodies get hungry between meals. A snack with protein and calcium gives you steady energy and more of what your bones use.',
    },
    source: AAP,
  },

  // ---------- OUTSIDE ----------
  // <!-- REVIEW -->
  {
    key: 'outside-daylight',
    slot: 'outside',
    category: 'daylight',
    icon: 'sun',
    title: 'Daylight time',
    subtitle: '20 minutes outside',
    bands: ['2-5', '6-8', '9-12', '13-17', '18-21'],
    why: {
      parent:
        'Daylight helps set the body clock for better sleep, and sunlight on skin helps the body make vitamin D. Use shade and sunscreen when the sun is strong.',
      teen: 'Daylight helps set your body clock for better sleep, and sunlight on skin helps your body make vitamin D. Use shade and sunscreen when the sun is strong.',
    },
    source: NIH_VITD,
  },
  // <!-- REVIEW -->
  {
    key: 'outside-walk',
    slot: 'outside',
    category: 'activity',
    icon: 'run',
    title: 'Go for a walk',
    subtitle: '15 minutes of fresh air',
    bands: ['2-5', '6-8', '9-12', '13-17', '18-21'],
    why: 'Walking is easy exercise that counts toward the daily activity target, and fresh air is a mood boost.',
    source: WHO_PA,
  },
  // <!-- REVIEW -->
  {
    key: 'outside-play',
    slot: 'outside',
    category: 'activity',
    icon: 'ball',
    title: 'Outdoor play',
    subtitle: 'Park, garden or playground',
    bands: ['2-5', '6-8', '9-12'],
    why: 'Outdoor play mixes running, climbing and jumping, which is great for bones, balance and mood. Let them lead the game.',
    source: WHO_PA,
  },
  // <!-- REVIEW -->
  {
    key: 'outside-morning-light',
    slot: 'outside',
    category: 'daylight',
    icon: 'sun',
    title: 'Step outside before school',
    subtitle: 'Morning light helps the body clock',
    bands: ['13-17', '18-21'],
    why: {
      parent:
        'Morning light helps teens keep a steady body clock, which makes an earlier bedtime feel more natural.',
      teen: 'Morning light helps keep your body clock steady, which makes an earlier bedtime feel more natural.',
    },
    source: NHS_SLEEP,
  },

  // ---------- WATER ----------
  // <!-- REVIEW -->
  {
    key: 'water-morning',
    slot: 'water',
    category: 'hydration',
    icon: 'water',
    title: 'Water first thing',
    subtitle: 'A glass with breakfast',
    bands: ['2-5', '6-8', '9-12', '13-17', '18-21'],
    why: 'Bodies lose water overnight. A glass in the morning is an easy start to staying hydrated, which helps focus and energy.',
    source: CDC_WATER,
  },
  // <!-- REVIEW -->
  {
    key: 'water-bottle',
    slot: 'water',
    category: 'hydration',
    icon: 'water',
    title: 'Carry a water bottle',
    subtitle: 'Sip through the day',
    bands: ['6-8', '9-12', '13-17', '18-21'],
    why: {
      parent:
        'A bottle within reach makes it easy for them to sip all day, especially on active days and at school.',
      teen: 'A bottle within reach makes it easy to sip all day, especially on active days and at school.',
    },
    source: CDC_WATER,
  },
  // <!-- REVIEW -->
  {
    key: 'water-meals',
    slot: 'water',
    category: 'hydration',
    icon: 'water',
    title: 'Water with every meal',
    subtitle: 'Make water the default drink',
    bands: ['2-5', '6-8', '9-12', '13-17', '18-21'],
    why: 'Water is the best everyday drink. Making it the default at meals leaves room for milk or fortified alternatives for calcium.',
    source: CDC_WATER,
  },
];
