import { createEngine, type KhamisRocheCoefficients, type PredictOptions } from '@tallsoon/engine';
import { cdcStature, khamisRoche, populationAdultHeightCm, who2007HeightForAge } from '@tallsoon/reference';

import { AppConfig } from '@/config/app-config';
import { useSettings } from '@/state/settings';

/** One engine for the whole app; the web calculator builds the same one (brief §5.1). */
export const engine = createEngine({
  cdc: cdcStature,
  who: who2007HeightForAge,
  khamisRoche: { rows: khamisRoche.rows as unknown as KhamisRocheCoefficients[] },
  populationAdultHeightCm,
});

export function predictOptions(): PredictOptions {
  return { reference: useSettings.getState().reference, unknownParentMode: AppConfig.unknownParentMode };
}

export const krSourcesCount = Math.min(...khamisRoche.rows.map((r) => r.verified_by_n_sources));
