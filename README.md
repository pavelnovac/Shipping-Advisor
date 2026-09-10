# LA FORMA Shipping Cost Calculator

Internal decision-support tool for comparing **final shipping cost** from Moldova with:

- **Poșta Moldovei — EMS**
- **Nova Post**

This is a frontend-only static application. All calculations run in the browser. There is no backend, database, or API key.

This calculator is an internal decision-support tool. Results are based on the tariff documents entered into the application and should be verified if carrier tariffs or conditions change.

## Local development

```bash
npm install
npm run dev
```

Then open the URL printed by Vite (typically `http://localhost:5173`).

```bash
npm test
npm run build
npm run preview
```

## Shipping providers and tariff sources

| Carrier | Data file | Currency | Validity |
| --- | --- | --- | --- |
| Nova Post | `src/data/novaRates.js` | MDL (VAT included) | from **2026-06-01** |
| Poșta Moldovei EMS | `src/data/emsRates.js` | MDL | transcribed from the supplied EMS tariff PDF |

Canonical countries live in `src/data/countries.js` and are keyed by ISO code (`FR`, `DE`, `US`, …), not by the original document names.

## How the comparison works

The recommendation always uses **final cost**, not only the published headline tariff.

- EMS final cost = published EMS tariff on **actual weight**
- Nova final cost = base shipping tariff
  - \+ declared-value commission (if applicable)
  - \+ EU customs / HS-code fee (if applicable)
  - \+ USA 15% invoice surcharge (if applicable)

The cheaper valid final result wins. If both final costs match, the app reports that both options have the same calculated cost.

## Nova Post volumetric weight

Nova billable weight is the greater of actual weight and volumetric weight:

```
volumetricWeightKg = lengthCm × widthCm × heightCm / 5000
billableWeightNova = max(actualWeightKg, volumetricWeightKg)
```

This volumetric rule is **not** applied to EMS. The EMS document does not specify it, so EMS always uses actual weight.

If dimensions are missing, Nova is not estimated. The app will not silently assume volumetric weight equals actual weight.

### Nova weight brackets

`<=2kg`, `<=5kg`, `<=10kg`, `<=20kg`, `<=30kg`

Above 30 kg:

```
<=30kg rate + ceil(billableWeight - 30) × additionalKgRate
```

USA has no published `<=20kg` or `<=30kg` rate. The calculator does **not** invent those brackets. If the shipment cannot be priced unambiguously from the supplied table, it shows **Tariff unavailable for this weight**.

### Extra Nova charges

- **Declared value:** included up to 500 MDL. Above 500 MDL: `declaredValueMDL × 0.5%`. Isolated in `calculateDeclaredValueFee()`.
- **EU customs / HS fee:** 3 EUR per unique HS code, converted with the editable EUR → MDL rate. Applies to Nova EU destinations only (not GB or USA).
- **USA surcharge:** 15% of invoice value, added to shipping cost.

These extras can be toggled in **Calculation settings**. The EUR → MDL rate is stored in `localStorage`.

## EMS additional 500 g

Up to 2 kg EMS uses gram brackets:

- <=250 g
- 251–500 g
- 501–1000 g
- 1001–1500 g
- 1501–2000 g

Above 2 kg:

```
2000g tariff + ceil((weightGrams - 2000) / 500) × additional500gRate
```

Each following 500 g may be complete or incomplete. Examples: 2001 g, 2100 g and 2499 g are one extra step; 2501 g is two extra steps.

## EUR / MDL setting

Default: `1 EUR = 19.5 MDL` in `src/constants/calculator.js`.

Change it in **Calculation settings**. The value is persisted locally and used only to convert Nova’s €3 HS-code fee.

## How to update tariffs

Do not edit rates inside React components.

1. Update `src/data/novaRates.js` and/or `src/data/emsRates.js`.
2. Keep the metadata block (`carrier`, `source`, `validFrom`, `currency`, `lastUpdated`) current.
3. If a new country appears, add it to the tariff file. `src/data/countries.js` derives the searchable country list from EMS destinations and Nova availability.
4. Adjust formulas only in:
   - `src/utils/calculateNova.js`
   - `src/utils/calculateEMS.js`
   - `src/utils/calculateRecommendation.js`
   - `src/utils/currency.js`
5. Run `npm test` and `npm run build`.

## Deploy to GitHub Pages

The Vite `base` path is set to `/Shipping-Advisor/` in GitHub Actions so the app works at:

`https://USERNAME.github.io/Shipping-Advisor/`

Workflow: `.github/workflows/deploy.yml`

1. In the GitHub repository open **Settings → Pages**.
2. Set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow manually).

The workflow installs dependencies, runs tests, builds the static site, and publishes `dist`.

## Project structure

```
src/data/novaRates.js
src/data/emsRates.js
src/data/countries.js
src/utils/calculateNova.js
src/utils/calculateEMS.js
src/utils/calculateRecommendation.js
src/utils/currency.js
src/components/          UI
.github/workflows/deploy.yml
```
