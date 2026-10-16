/**
 * Bundled growth references and Khamis–Roche coefficients. Data only: the maths lives in
 * @tallsoon/engine. Provenance and checksums: ../SOURCES.md.
 */
import cdcJson from '../data/cdc_statage.json';
import krJson from '../data/khamis_roche_coefficients.json';
import whoJson from '../data/who2007_hfa.json';

export type LmsRow = readonly [number, number, number, number];

export interface LmsTableJson {
  id: string;
  name: string;
  source: string;
  originalSource: string;
  retrieved: string;
  male: LmsRow[];
  female: LmsRow[];
}

export interface KhamisRocheRow {
  sex: 'male' | 'female';
  age: number;
  intercept: number;
  stature_coef: number;
  weight_coef: number;
  midparent_coef: number;
  units: string;
  source_urls: string[];
  verified_by_n_sources: number;
  errorBound90Cm?: number;
}

export interface KhamisRocheJson {
  method: string;
  rows: KhamisRocheRow[];
}

export const cdcStature = cdcJson as unknown as LmsTableJson;
export const who2007HeightForAge = whoJson as unknown as LmsTableJson;
export const khamisRoche = krJson as unknown as KhamisRocheJson;

/** US adult averages used when one parent's height is unknown (NHANES 2015–2018, brief §13.4). */
export const populationAdultHeightCm = { mother: 161.3, father: 175.3 } as const;
