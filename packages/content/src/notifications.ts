import type { NotificationLines } from './types';

// <!-- REVIEW --> Notification copy mentions sleep and growth, keep claims soft.
export const notificationLines: NotificationLines = {
  morning: [
    { parent: 'Good morning! Today’s 5 habits are ready for {name}.', teen: 'Good morning! Your 5 habits for today are ready.' },
    { parent: 'Fresh day, fresh ticks. Open today’s plan for {name}.', teen: 'Fresh day, fresh ticks. Open today’s plan.' },
    'Five small habits, one good day. Let’s go!',
    { parent: 'Breakfast with protein and a glass of water? Easy start for {name}.', teen: 'Breakfast with protein and a glass of water? Easy start.' },
    'Daylight, water, movement. Your plan is waiting.',
  ],
  bedtime: [
    { parent: 'Wind-down time. Lights out for {name} at {bedtime}.', teen: 'Wind-down time. Lights out at {bedtime}.' },
    'Growth hormone is released mostly in deep sleep. Time to power down.',
    { parent: 'Screens off, story on. {bedtime} is coming up.', teen: 'Screens off, music low. {bedtime} is coming up.' },
    'A steady bedtime is a daily win. Sleep well!',
    { parent: 'Tonight’s goal: {sleepRange} for {name}.', teen: 'Tonight’s goal: {sleepRange}.' },
  ],
  streak: [
    '{count} days in a row! Keep it rolling.',
    { parent: '{name} is on a {count}-day streak. Nice work!', teen: 'You’re on a {count}-day streak. Nice work!' },
    'Streak alive: {count} days. One tick keeps it going.',
    'Small habits add up. {count} days and counting!',
  ],
  weekly: [
    { parent: '{name}’s week is ready. See the score and the 7-day card.', teen: 'Your week is ready. See your score and 7-day card.' },
    'New week, new card. See how the habits stacked up.',
    'Weekly check-in time! Take a look at your Growth Habits Score.',
    { parent: 'Look back at {name}’s week and pick one habit to focus on.', teen: 'Look back at your week and pick one habit to focus on.' },
  ],
  checkin: [
    'Measuring day! 📏 See the updated prediction in 30 seconds.',
    { parent: 'Time to see how much {name} has grown. Morning, no shoes, back to the wall.', teen: 'Time to see how much you’ve grown. Morning, no shoes, back to the wall.' },
    { parent: 'Check-in time for {name}: one measurement, one updated prediction.', teen: 'Check-in time: one measurement, one updated prediction.' },
    'New month, new measurement. Your growth curve is waiting.',
  ],
  spurt: [
    'Growth spurt detected! 🚀 This is when sleep and protein matter most.',
    { parent: '{name} is growing fast right now. Keep bedtime steady and protein on the plate.', teen: 'You’re growing fast right now. Keep bedtime steady and protein on the plate.' },
    'Spurt season: bigger appetites are normal. Calcium and protein help.',
  ],
  remeasure: [
    { parent: 'It’s been about 3 months. Time to re-measure {name} the same way.', teen: 'It’s been about 3 months. Time to re-measure the same way.' },
    'Re-measure day! Morning, no shoes, back against the wall.',
    { parent: 'Three months on. A fresh measurement for {name} shows the trend.', teen: 'Three months on. A fresh measurement shows your trend.' },
    'Measure twice, save once. Your 3-month re-measure is here.',
  ],
};
