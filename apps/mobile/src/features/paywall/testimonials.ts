import data from '../../../assets/data/testimonials.json';

export interface Testimonial {
  id: string;
  text: string;
  attribution: string;
  source: 'TestFlight' | 'support email' | 'App Store review' | 'Play review';
  consentDate: string | null;
  consentEvidence: string | null;
  approved: boolean;
}

/** Placeholders show until there are at least this many real, consented quotes. */
export const MIN_REAL_TESTIMONIALS = 12;

export function consentedTestimonials(): Testimonial[] {
  return (data.testimonials as Testimonial[]).filter((t) => t.approved && !!t.consentDate && !!t.consentEvidence);
}
