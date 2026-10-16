import type { Routine } from './types';

const NHS_EXERCISE = {
  label: 'NHS exercise guidelines',
  url: 'https://www.nhs.uk/live-well/exercise/',
};
const WHO_PA = {
  label: 'WHO physical activity guidelines (2020)',
  url: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity',
};
const CDC_PA = {
  label: 'CDC physical activity basics',
  url: 'https://www.cdc.gov/physical-activity-basics/index.html',
};
const NHS_SLEEP = {
  label: 'NHS sleep and tiredness',
  url: 'https://www.nhs.uk/live-well/sleep-and-tiredness/',
};

export const routines: Routine[] = [
  // <!-- REVIEW -->
  {
    key: 'posture-reset',
    title: 'Posture reset',
    minutes: 6,
    focus: 'posture',
    bands: ['2-5', '6-8', '9-12', '13-17', '18-21'],
    intro: {
      parent: 'Six easy minutes to build body awareness and strength. Do it together and keep it light.',
      teen: 'Six easy minutes to build body awareness and strength. Move slowly and keep it comfortable.',
    },
    steps: [
      { title: 'Wall stand', detail: 'Stand with heels, bottom and shoulders lightly touching a wall and breathe normally.', amount: '30 s' },
      { title: 'Shoulder rolls', detail: 'Roll both shoulders up, back and down in slow circles.', amount: '10 reps' },
      { title: 'Chin tucks', detail: 'Glide your chin straight back as if making a gentle double chin, then relax.', amount: '8 reps' },
      { title: 'Cat and cow', detail: 'On hands and knees, round your back up, then let it dip down, moving slowly.', amount: '8 reps' },
      { title: 'Superman hold', detail: 'Lie on your tummy, lift arms and legs a little off the floor, then lower with control.', amount: '3 x 10 s' },
      { title: 'Tall stand', detail: 'Stand up, imagine a string lifting the top of your head, and take three slow breaths.', amount: '30 s' },
    ],
    source: NHS_EXERCISE,
  },
  // <!-- REVIEW -->
  {
    key: 'mobility-flow',
    title: 'Mobility flow',
    minutes: 8,
    focus: 'mobility',
    bands: ['6-8', '9-12', '13-17', '18-21'],
    intro: {
      parent: 'A gentle flow that keeps joints moving well. Stop any move that hurts, and keep every move comfortable.',
      teen: 'A gentle flow that keeps your joints moving well. Stop any move that hurts, and keep every move comfortable.',
    },
    steps: [
      { title: 'Arm circles', detail: 'Stand tall and make big, slow circles with both arms, forward then backward.', amount: '10 reps' },
      { title: 'Hip circles', detail: 'Hands on hips, draw a big circle with your hips in each direction.', amount: '8 reps' },
      { title: 'Low lunge reach', detail: 'Step into a gentle lunge and reach one arm overhead, then switch sides.', amount: '30 s each' },
      { title: 'Child pose', detail: 'Sit back on your heels, rest your forehead down and breathe slowly.', amount: '30 s' },
      { title: 'Seated twist', detail: 'Sit cross-legged and turn your upper body gently to each side.', amount: '20 s each' },
      { title: 'Ankle rolls', detail: 'Sit or stand and roll each ankle in slow circles.', amount: '10 reps' },
      { title: 'Easy forward fold', detail: 'Stand with soft knees and let your arms hang down. Do not force it.', amount: '30 s' },
    ],
    source: NHS_EXERCISE,
  },
  // <!-- REVIEW -->
  {
    key: 'bone-boost',
    title: 'Jump and skip',
    minutes: 7,
    focus: 'bone',
    bands: ['2-5', '6-8', '9-12', '13-17'],
    intro: {
      parent: 'Healthy impact helps bones build strength during the growing years. Use a clear, flat space and shoes with grip.',
      teen: 'Healthy impact helps your bones build strength during the growing years. Use a clear, flat space and shoes with grip.',
    },
    steps: [
      { title: 'Warm-up march', detail: 'March on the spot and swing your arms to get warm.', amount: '60 s' },
      { title: 'Jumping jacks', detail: 'Jump feet out and arms up, then back in, landing softly on bent knees.', amount: '20 reps' },
      { title: 'Skipping', detail: 'Skip around the room or the yard, or use a rope if you have one.', amount: '60 s' },
      { title: 'Squat jumps', detail: 'Squat down, jump up, and land softly with knees bent.', amount: '10 reps' },
      { title: 'Hopscotch hops', detail: 'Hop on one foot, then the other, along a line of chalk or tape.', amount: '10 each' },
      { title: 'Cool-down walk', detail: 'Walk slowly and take deep breaths until your heart rate settles.', amount: '60 s' },
    ],
    source: WHO_PA,
  },
  // <!-- REVIEW -->
  {
    key: 'core-steady',
    title: 'Core and balance',
    minutes: 8,
    focus: 'core',
    bands: ['9-12', '13-17', '18-21'],
    intro: {
      parent: 'A strong middle helps posture and every sport. No equipment needed, and good form beats speed.',
      teen: 'A strong middle helps your posture and every sport. No equipment needed, and good form beats speed.',
    },
    steps: [
      { title: 'Plank', detail: 'Hold a straight line from head to heels on forearms and toes, or on knees if you need.', amount: '20 s' },
      { title: 'Dead bug', detail: 'Lie on your back, arms up, and slowly lower the opposite arm and leg, then switch.', amount: '10 reps' },
      { title: 'Bird dog', detail: 'On hands and knees, reach one arm and the opposite leg out, hold, then switch.', amount: '8 each' },
      { title: 'Side plank', detail: 'Lie on your side, prop up on your forearm, lift your hips and hold.', amount: '15 s each' },
      { title: 'Glute bridge', detail: 'Lie on your back with knees bent and lift your hips, then lower slowly.', amount: '12 reps' },
      { title: 'One-leg balance', detail: 'Stand on one leg near a wall for support and hold steady.', amount: '30 s each' },
    ],
    source: WHO_PA,
  },
  // <!-- REVIEW -->
  {
    key: 'family-activity',
    title: 'Family activity',
    minutes: 10,
    focus: 'family',
    bands: ['2-5', '6-8', '9-12', '13-17', '18-21'],
    intro: {
      parent: 'Ten minutes, the whole family, zero equipment. Let your child pick the order and keep it playful.',
      teen: 'Ten minutes with the family, zero equipment. Pick the order and keep it fun.',
    },
    steps: [
      { title: 'Follow the leader', detail: 'One person leads a silly walk, hop or dance and everyone copies. Swap leaders each minute.', amount: '2 min' },
      { title: 'Freeze dance', detail: 'Play a song, dance, and freeze when the music stops.', amount: '2 min' },
      { title: 'Obstacle course', detail: 'Use cushions, chairs and lines of tape to make a course to hop, crawl and balance through.', amount: '3 min' },
      { title: 'Partner balance', detail: 'Stand on one leg facing a partner and gently tap hands, keeping your balance.', amount: '1 min' },
      { title: 'Family stretch circle', detail: 'Stand in a circle and take turns calling out an easy move for everyone to try.', amount: '2 min' },
    ],
    source: CDC_PA,
  },
  // <!-- REVIEW -->
  {
    key: 'animal-moves',
    title: 'Animal moves',
    minutes: 6,
    focus: 'bone',
    bands: ['2-5', '6-8'],
    intro: {
      parent: 'Big, silly moves build balance, strength and coordination. Join in, it is more fun that way.',
      teen: 'Big, silly moves build balance, strength and coordination.',
    },
    steps: [
      { title: 'Frog jumps', detail: 'Squat low and jump forward like a frog, landing softly.', amount: '10 jumps' },
      { title: 'Bear crawl', detail: 'Walk on hands and feet with your bottom up high.', amount: '30 s' },
      { title: 'Crab walk', detail: 'Sit, lift your hips on hands and feet, and walk sideways like a crab.', amount: '30 s' },
      { title: 'Flamingo stand', detail: 'Stand on one leg like a flamingo and count out loud.', amount: '10 s each' },
      { title: 'Bunny hops', detail: 'Hop with both feet together around the room.', amount: '30 s' },
      { title: 'Sleepy sloth', detail: 'Move in super slow motion, then lie down and breathe.', amount: '60 s' },
    ],
    source: WHO_PA,
  },
  // <!-- REVIEW -->
  {
    key: 'desk-reset',
    title: 'Desk reset',
    minutes: 5,
    focus: 'posture',
    bands: ['9-12', '13-17', '18-21'],
    intro: {
      parent: 'A quick break for anyone who has been sitting a while. No gear, just a chair and a wall.',
      teen: 'A quick break for when you have been sitting a while. No gear, just a chair and a wall.',
    },
    steps: [
      { title: 'Stand and shake out', detail: 'Stand up and shake out your arms and legs.', amount: '30 s' },
      { title: 'Chair squats', detail: 'Sit down to the chair and stand back up without using your hands.', amount: '10 reps' },
      { title: 'Doorway chest opener', detail: 'Rest your forearms on a door frame and lean in gently until you feel a light pull.', amount: '20 s' },
      { title: 'Neck tilts', detail: 'Tilt your ear toward each shoulder slowly, without pulling.', amount: '15 s each' },
      { title: 'Wall angels', detail: 'Stand with your back on a wall and slide your arms up and down like a snow angel.', amount: '8 reps' },
    ],
    source: NHS_EXERCISE,
  },
  // <!-- REVIEW -->
  {
    key: 'evening-wind-down',
    title: 'Evening wind-down moves',
    minutes: 6,
    focus: 'mobility',
    bands: ['6-8', '9-12', '13-17', '18-21'],
    intro: {
      parent: 'Slow, easy moves and calm breathing to help the body switch to rest mode before bed.',
      teen: 'Slow, easy moves and calm breathing to help your body switch to rest mode before bed.',
    },
    steps: [
      { title: 'Slow neck rolls', detail: 'Drop your chin to your chest and roll your head gently side to side.', amount: '30 s' },
      { title: 'Reach and fold', detail: 'Reach both arms overhead, then fold forward with soft knees and hang.', amount: '5 reps' },
      { title: 'Happy baby', detail: 'Lie on your back, hold your feet and rock gently side to side.', amount: '30 s' },
      { title: 'Legs up the wall', detail: 'Lie on your back with your legs resting up against a wall.', amount: '2 min' },
      { title: 'Belly breathing', detail: 'Rest a hand on your belly and breathe in for 4, out for 6.', amount: '1 min' },
    ],
    source: NHS_SLEEP,
  },
];
