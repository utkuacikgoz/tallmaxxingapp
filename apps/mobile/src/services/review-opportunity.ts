/** Only a newly saved measurement advances the engagement milestone. */
export function shouldRequestMeasurementReview(input: {
  measurementCount: number;
  reviewRequested: boolean;
  isNewMeasurement: boolean;
}): boolean {
  return input.measurementCount >= 2 && !input.reviewRequested && input.isNewMeasurement;
}
