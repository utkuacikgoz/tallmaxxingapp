# Reference data sources

Retrieved 2026-10-16. Numbers were taken from downloaded files only (no values typed from memory).

## CDC 2000 stature-for-age (data/cdc_statage.json)
- What: CDC 2000 growth charts, stature-for-age LMS, ages 24-240 months, 218 rows per sex ([agemos,L,M,S]). Note: the table ends at 240.0 months (not 240.5).
- Citation: Kuczmarski RJ et al. 2000 CDC growth charts for the United States: methods and development. Vital Health Stat 11(246), 2002.
- Original: https://www.cdc.gov/growthcharts/data/zscore/statage.csv (blocked from sandbox; not downloaded directly)
- Used: PyPI package growthcharts 0.2.1, file growthcharts/data/lenage.csv (statage.csv layout: Sex,Agemos,L,M,S,P3..P97).
- sha256 of JSON: ac8237b7931e46659c331b99f1c9f54166c1b4d37b1d99675187d178d8fb6f55
- Verification: (1) P3/P50/P97 columns of the CSV recomputed from L,M,S via the LMS formula (z=+-1.880794): max deviation 2.5e-7 cm. (2) Second copy, PyPI rcpchgrowth 4.6.5 data_tables/cdc2-20.json: all ages/L/M/S identical, max abs difference 4e-8. (3) M at 240 mo: male 176.849, female 163.338.

## WHO 2007 height-for-age 5-19 years (data/who2007_hfa.json)
- What: WHO Growth Reference 2007 height-for-age LMS, months 61-228, 168 rows per sex (L=1 throughout).
- Citation: de Onis M et al. Development of a WHO growth reference for school-aged children and adolescents. Bull World Health Organ 2007;85:660-667.
- Original: https://www.who.int/tools/growth-reference-data-for-5to19-years/indicators/height-for-age (blocked from sandbox)
- Used: npm @pedi-growth/core 1.1.2, dist/data/hfa-boys-5-19.json and hfa-girls-5-19.json.
- sha256 of JSON: 7534051f7b793e7efe57deb3215842804685719e390fe53f23c3c55397d7b579
- Verification: compared with PyPI rcpchgrowth 4.6.5 data_tables/who/who_2007_children.json (which also has a 60-month row, dropped here); L, M, S identical for all 168 rows per sex (max diff 0). Sanity at 228 mo: boys M 176.5432, girls M 163.1548. Not checked against the official WHO file itself or its SD columns; both copies are third-party redistributions.

## Khamis-Roche
See khamis_roche_coefficients.json (provided by product owner)
