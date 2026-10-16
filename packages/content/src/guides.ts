import type { Guide } from './types';

// <!-- REVIEW --> Whole guide: timing ranges and "when to talk to a pediatrician" thresholds need clinician sign-off.
export const pubertyGuide: Guide = {
  id: 'puberty',
  title: 'Puberty and the growth spurt',
  subtitle: 'What is typical, and when to ask your pediatrician',
  sections: [
    {
      id: 'timing',
      title: 'When does puberty usually start?',
      paragraphs: [
        'Puberty starts at different ages for every child, and a wide range is normal.',
        '• Girls: signs usually begin between about 8 and 13 years old.',
        '• Boys: signs usually begin between about 9 and 14 years old.',
        'Starting a little earlier or later than friends is common and is usually just a family pattern.',
      ],
    },
    {
      id: 'spurt',
      title: 'The growth spurt',
      paragraphs: [
        'During puberty, growth speeds up for a couple of years. This is called the growth spurt.',
        '• In girls, the spurt tends to come early in puberty, often around ages 10 to 12.',
        '• In boys, it tends to come later, often around ages 12 to 15.',
        'Appetite, energy needs and sleep needs often go up during the spurt. Regular meals, plenty of sleep and daily activity support healthy growth.',
      ],
    },
    {
      id: 'slowing',
      title: 'How growth slows afterward',
      paragraphs: [
        'After the spurt, growth slows down gradually and then stops as the growth plates in the bones close.',
        '• Girls often grow most slowly by about two years after their first period.',
        '• Boys often keep growing a bit longer, commonly into the later teen years.',
        'Muscle and bone strength keep building after growth in height has slowed, so healthy habits still matter.',
      ],
    },
    {
      id: 'talk',
      title: 'When to talk to a pediatrician',
      paragraphs: [
        'Most children are just on their own timeline. It is a good idea to book a visit if you notice any of these:',
        '• No signs of puberty by age 13 in girls or by age 14 in boys.',
        '• Very early signs, before age 8 in girls or before age 9 in boys.',
        '• Growth that seems to stop or slow sharply.',
        '• Periods that have not started by about age 15, or within about three years of the first signs in girls.',
        'Your pediatrician can check growth over time and decide whether any tests are needed. Bring your TallSoon measurements to the visit.',
      ],
    },
    {
      id: 'support',
      title: 'What helps at home',
      paragraphs: [
        '• Keep a steady bedtime that gives the right hours of sleep for their age.',
        '• Offer calcium, protein and fruit and veg at meals.',
        '• Aim for about 60 minutes of play, sport or walking a day.',
        '• Be kind about changes. Every body develops on its own schedule, and talking calmly about it helps.',
      ],
    },
  ],
  sources: [
    { label: 'AAP HealthyChildren.org', url: 'https://www.healthychildren.org/' },
    { label: 'NHS health A to Z', url: 'https://www.nhs.uk/conditions/' },
    { label: 'Hormone Health Network (Endocrine Society)', url: 'https://www.hormone.org/' },
    { label: 'Pediatric Endocrine Society patient resources', url: 'https://pedsendo.org/' },
  ],
};

// <!-- REVIEW --> Measuring method follows CDC and AAP guidance; confirm wording before launch.
export const measureGuide: Guide = {
  id: 'measure',
  title: 'How to measure height at home',
  subtitle: 'Five minutes, a wall and a flat object',
  sections: [
    {
      id: 'prep',
      title: 'Get ready',
      paragraphs: [
        '• Measure in the morning. Height dips a little through the day, so mornings are the most consistent.',
        '• Take off shoes, hats and hair ties or bulky hairstyles that add thickness.',
        '• Pick a hard, flat floor and a straight wall with no skirting board or carpet in the way.',
        'You will need a pencil, a tape measure or ruler, and a flat object like a hardcover book.',
      ],
    },
    {
      id: 'stand',
      title: 'Stand against the wall',
      paragraphs: [
        '• Feet flat and together, with heels, bottom, upper back and the back of the head touching the wall.',
        '• Arms relaxed at the sides, shoulders level.',
        '• Look straight ahead so the chin is level with the floor, not tilted up or down.',
        '• Take a normal breath in and stand tall.',
      ],
    },
    {
      id: 'mark',
      title: 'Mark and measure',
      paragraphs: [
        '• Rest the flat object on the top of the head, flat against the wall, and press down gently on any hair.',
        '• Draw a light pencil line on the wall along the bottom edge of the object.',
        '• Step away, then measure from the floor to the line with a tape measure that is held straight.',
        '• Write down the number right away.',
      ],
    },
    {
      id: 'twice',
      title: 'Measure twice',
      paragraphs: [
        'Repeat the whole measurement a second time. If the two numbers are within a few millimeters of each other, use the average.',
        'If they differ by more than that, measure a third time and use the middle value.',
      ],
    },
    {
      id: 'track',
      title: 'Keep it consistent',
      paragraphs: [
        '• Measure the same way, at the same time of day, every 3 months.',
        '• Growth is not a straight line, so look at the trend over time rather than one number.',
        '• Share the numbers with your pediatrician at check-ups.',
      ],
    },
  ],
  sources: [
    { label: 'CDC growth chart training: measuring height', url: 'https://www.cdc.gov/growthcharts/' },
    { label: 'AAP HealthyChildren.org', url: 'https://www.healthychildren.org/' },
    { label: 'NHS health A to Z', url: 'https://www.nhs.uk/conditions/' },
  ],
};
