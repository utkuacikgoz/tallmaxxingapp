#!/usr/bin/env node
// Fails the build if any testimonial that could be shown lacks consent (brief §11.7),
// or contains a height-gain claim.
const path = require('path');
const data = require(path.join(__dirname, '../assets/data/testimonials.json'));
const banned = /(\bcm\b|\binch|\bgrew\b|taller|\bgrow\b \d)/i;
let failed = false;
for (const t of data.testimonials) {
  if (!t.approved) continue;
  if (!t.consentDate || !t.consentEvidence || !t.attribution || !t.source) {
    console.error(`Testimonial ${t.id}: approved but missing consent fields`);
    failed = true;
  }
  if (banned.test(t.text)) {
    console.error(`Testimonial ${t.id}: contains a height/gain claim`);
    failed = true;
  }
}
if (failed) process.exit(1);
console.log(`Testimonials OK (${data.testimonials.filter((t) => t.approved).length} approved)`);
