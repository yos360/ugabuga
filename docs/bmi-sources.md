# BMI sources and scope

Reviewed 2026-10-14. Adults aged 20+ only in this release.

- CDC adult categories: https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html
- Formula: kg / (cm / 100)^2. Classification uses the unrounded value: <18.5, <25, <30, >=30.
- CDC 2000 BMI-for-age LMS source: https://www.cdc.gov/growthcharts/cdc-data-files.htm
- Official public-domain table: https://www.cdc.gov/growthcharts/data/zscore/bmiagerev.csv

The official CSV download returned HTTP Access Denied twice from this environment, including a download-query retry. No substitute data was fabricated or copied from an unofficial source. As explicitly permitted in the task, pediatric BMI is omitted. The page blocks ages under 20, explains that pediatric assessment requires age/sex percentiles, and refers families to a pediatrician / Tipat Halav. No adult thresholds are applied to children. Adding the pediatric calculator later requires the official table in the repository plus LMS tests against its published percentile columns.

Inputs never enter URLs, storage, analytics, or network requests. BMI is described as an estimate rather than a diagnosis, with no weight-loss recommendations.
