import catalog from '../../../mobile/src/i18n/en';

export type LegalSection = {
  heading: string;
  paragraphs: readonly string[];
};

export type LegalLink = {
  label: string;
  href: string;
};

export type LegalDocument = {
  title: string;
  intro: string;
  sections: readonly LegalSection[];
  links?: readonly LegalLink[];
};

export type WebsiteLegalCatalog = {
  effectiveDate: string;
  privacy: LegalDocument;
  terms: LegalDocument;
  healthDisclaimer: LegalDocument;
  support: LegalDocument;
};

/** English website legal copy, kept in the shared copy catalog and typed for Astro pages. */
export const legalWebsite: WebsiteLegalCatalog = catalog.legalWebsite;

export const privacyPolicy = legalWebsite.privacy;
export const termsOfUse = legalWebsite.terms;
export const healthDisclaimer = legalWebsite.healthDisclaimer;
export const supportInformation = legalWebsite.support;
