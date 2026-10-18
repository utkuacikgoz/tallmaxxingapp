import { describe, expect, it } from '@jest/globals';

import { shouldRequestMeasurementReview } from '@/services/review-opportunity';

describe('measurement review opportunity', () => {
  it('waits until the second newly saved measurement and asks at most once', () => {
    expect(shouldRequestMeasurementReview({ measurementCount: 1, reviewRequested: false, isNewMeasurement: true })).toBe(false);
    expect(shouldRequestMeasurementReview({ measurementCount: 2, reviewRequested: false, isNewMeasurement: true })).toBe(true);
    expect(shouldRequestMeasurementReview({ measurementCount: 3, reviewRequested: true, isNewMeasurement: true })).toBe(false);
  });

  it('does not treat edits or free-row replacements as a newly logged measurement', () => {
    expect(shouldRequestMeasurementReview({ measurementCount: 2, reviewRequested: false, isNewMeasurement: false })).toBe(false);
  });
});
