import { cdcStature, khamisRoche, populationAdultHeightCm, who2007HeightForAge } from '@tallsoon/reference';

import { createEngine } from '../predict';
import type { KhamisRocheCoefficients } from '../methods';

export const engine = createEngine({
  cdc: cdcStature,
  who: who2007HeightForAge,
  khamisRoche: { rows: khamisRoche.rows as unknown as KhamisRocheCoefficients[] },
  populationAdultHeightCm,
});
