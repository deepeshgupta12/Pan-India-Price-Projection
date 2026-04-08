# PAN India Real Estate — Asking Price Projection Engine

A full-stack analytical workspace for estimating **current fair asking prices** and **1Y / 3Y / 5Y forward price projections** for primary-market residential real estate projects across India.

The product is built as a local monorepo with a FastAPI backend and a Next.js frontend, supporting project search, editable assumption overrides, multi-scenario pricing, sensitivity analysis, save/export flows, and side-by-side comparison of saved analyses.

---

## Table of Contents

1. [What this product does](#what-this-product-does)
2. [Key features](#key-features)
3. [Architecture overview](#architecture-overview)
4. [Tech stack](#tech-stack)
5. [Repository structure](#repository-structure)
6. [Getting started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Backend setup](#backend-setup)
   - [Frontend setup](#frontend-setup)
   - [Environment variables](#environment-variables)
7. [Running the product](#running-the-product)
8. [Running tests](#running-tests)
9. [API reference](#api-reference)
10. [Pricing engine](#pricing-engine)
    - [Current fair price formula](#current-fair-price-formula)
    - [Pricing factors (6)](#pricing-factors-6)
    - [Forward projection formula](#forward-projection-formula)
    - [Confidence score](#confidence-score)
11. [Frontend workspace guide](#frontend-workspace-guide)
12. [Input form groups](#input-form-groups)
13. [Analytics instrumentation](#analytics-instrumentation)
14. [Data model](#data-model)
15. [Seed data](#seed-data)
16. [Export formats](#export-formats)
17. [Extending the product](#extending-the-product)
18. [Build history](#build-history)

---

## What this product does

Given any residential real estate project in India, this engine computes:

- **Current fair asking price per sq ft** — derived from six factors: specification quality, market and supply-demand conditions, connectivity and infrastructure, developer premium, macro-economic conditions, and stage/regulatory risk.
- **Fair price band** — a ±5% range around the point estimate.
- **Benchmark delta** — premium or discount relative to the market benchmark.
- **Confidence score** — a five-driver model covering data completeness, benchmark quality, developer profile, supply-demand data, and legal clarity.
- **1Y / 3Y / 5Y forward projections** — under bear, base, bull, and custom scenario assumptions, with marginal adjustments from location, supply, and infrastructure quality on top of the scenario CAGR.
- **Scenario comparison** — all four scenarios compared side by side at each time horizon.
- **Sensitivity analysis** — six key drivers swept across downside and upside to identify the variable that moves fair price most.
- **Factor contribution breakdown** — which pricing factors added or discounted value, and by how much.
- **Narrative interpretation** — plain-English summary, interpretation bullets, and risk flags.

All outputs are saveable as named snapshots and exportable as JSON or CSV.

---

## Key features

**Search-first workflow** — start by searching or filtering the project dictionary; selecting a project prefills all 44 analysis input fields from its dictionary record.

**Editable assumptions** — every input field can be overridden per project without affecting other projects. Overrides are stored in-memory per session. Select inputs (stage, RERA status, scenario) render as dropdowns; all numeric fields validate min/max on blur.

**Data quality warning** — if fewer than 60% of input fields are populated after an analysis run, an amber banner identifies the input families to fill to improve confidence.

**Multi-scenario analysis** — bear, base, bull, and custom scenario profiles are selectable. All scenario CAGRs and adjustment factors are read from the database (no hardcoded values in the engine). Changing scenario clears any existing result.

**Data-driven pricing engine** — six pricing factors each read directly from user inputs and DB-injected ScenarioProfile values. Developer premium uses brand score, on-time delivery, and litigation risk. Macro adjustment uses repo rate, inflation, and GDP growth. Infrastructure uplift is scaled by the scenario's infra-realization coefficient.

**Sensitivity engine** — sweeps six key drivers (benchmark price, amenity score, inventory overhang, metro distance, developer brand score, infra uplift) across downside and upside cases.

**Save and reopen** — analysis runs can be saved as named snapshots. Any saved run can be reopened in the workspace to view its full result set.

**Compare runs** — select any two saved analyses to view a structured side-by-side comparison table covering all key metrics with "Better" highlights.

**Export** — results export as JSON (full structured payload) or CSV (projection table rows).

**Analytics layer** — a typed event-tracking module instruments ten user interactions. Console-logged in development; swap the implementation to forward to PostHog, Segment, or Amplitude.

**Variable glossary** — every input variable is documented with definition, unit, acceptable range, formula impact, and example value.

**Unit-tested engine** — 49 unit tests covering every pricing factor, scenario CAGR path, sensitivity logic, risk flag assertions, and helper utilities.

---

## Architecture overview

```
Browser (Next.js)
       │
       │  REST (JSON / CSV)
       ▼
FastAPI backend  ──►  SQLite database
       │
       ├── /api/v1/health               (health check, seed status)
       ├── /api/v1/dictionaries/*       (cities, projects, variables, scenarios, infra …)
       └── /api/v1/pricing/*            (fair price, projection, sensitivity, save, export)
```

The backend is stateless except for the SQLite file (swappable for Postgres). All pricing and projection logic lives in `apps/api/app/services/pricing_engine.py`. The pricing route injects ScenarioProfile values from the DB before calling the engine, so the engine contains no hardcoded lookup tables. The frontend fetches dictionaries at page load (server component) and drives analysis interactivity through client components.

---

## Tech stack

### Backend
| Layer | Technology |
|---|---|
| API framework | FastAPI 0.135 |
| Runtime | Python 3.10+ |
| Data validation | Pydantic v2 + pydantic-settings |
| ORM | SQLAlchemy 2.0 |
| Database | SQLite (Postgres-ready schema) |
| Server | Uvicorn |
| Test framework | pytest |
| Config | python-dotenv / env file |

### Frontend
| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Icons | Lucide React |
| Runtime | Node.js 22 |

---

## Repository structure

```
pan-india-price-projection/
│
├── apps/
│   ├── api/                          # FastAPI backend
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── router.py
│   │   │   │   └── routes/
│   │   │   │       ├── dictionaries.py   # GET endpoints for all dictionaries
│   │   │   │       ├── health.py         # GET /health, GET /seed-status
│   │   │   │       └── pricing.py        # POST endpoints for analysis + save + sensitivity
│   │   │   ├── core/
│   │   │   │   └── config.py             # Pydantic settings
│   │   │   ├── db/
│   │   │   │   ├── base.py
│   │   │   │   ├── init_db.py            # Table creation on startup
│   │   │   │   └── session.py            # DB session dependency
│   │   │   ├── models/                   # SQLAlchemy ORM models
│   │   │   │   ├── city.py
│   │   │   │   ├── developer.py
│   │   │   │   ├── infrastructure_record.py
│   │   │   │   ├── locality.py
│   │   │   │   ├── micromarket.py
│   │   │   │   ├── project.py            # +avg_rent, inventory_overhang_months,
│   │   │   │   │                         #  distance_to_metro_km, social_infra_score
│   │   │   │   ├── saved_analysis.py
│   │   │   │   ├── scenario_profile.py
│   │   │   │   └── variable_definition.py
│   │   │   ├── schemas/
│   │   │   │   └── pricing.py            # PricingAnalysisInput (45 fields), all response types
│   │   │   ├── services/
│   │   │   │   ├── analysis_store.py     # Save / fetch / export logic
│   │   │   │   ├── pricing_engine.py     # 6-factor fair price + projection engine (data-driven)
│   │   │   │   └── seed_loader.py        # Seed data ingestion on startup
│   │   │   └── main.py                   # FastAPI app factory + lifespan
│   │   ├── requirements.txt
│   │   └── tests/
│   │       ├── __init__.py
│   │       └── test_pricing_engine.py    # 49 unit tests (all passing)
│   │
│   └── web/                          # Next.js frontend
│       └── src/
│           ├── app/
│           │   ├── globals.css           # Design tokens, fonts, scrollbar
│           │   ├── layout.tsx
│           │   └── page.tsx              # Server component: data fetch + layout
│           ├── components/
│           │   ├── analysis/
│           │   │   ├── analysis-group-card.tsx
│           │   │   ├── analysis-workspace.tsx    # Main client orchestrator + data quality banner
│           │   │   ├── compare-runs-section.tsx  # Side-by-side comparison UI
│           │   │   ├── current-fair-price-results.tsx
│           │   │   ├── editable-field-card.tsx   # Validated inputs (select, min/max, required)
│           │   │   ├── projection-charts.tsx     # Trend + comparison charts with empty states
│           │   │   ├── saved-analysis-panel.tsx  # Right-rail saved analyses
│           │   │   └── scenario-selector.tsx
│           │   ├── glossary/
│           │   │   └── variable-glossary-card.tsx
│           │   ├── layout/
│           │   │   ├── app-shell.tsx
│           │   │   └── page-header.tsx
│           │   ├── search/
│           │   │   ├── project-card.tsx
│           │   │   └── project-search-panel.tsx
│           │   └── ui/
│           │       ├── info-card.tsx
│           │       ├── section-card.tsx
│           │       └── stat-pill.tsx
│           ├── lib/
│           │   ├── analysis-form.ts      # 8 input groups, 44 fields, full prefill logic
│           │   ├── analytics.ts          # Event tracking module
│           │   ├── api.ts                # All API call functions
│           │   └── export.ts             # Client-side export helpers
│           └── types/
│               ├── analysis-form.ts      # AnalysisFormValues (44 fields), AnalysisFieldConfig
│               ├── city.ts
│               ├── health.ts
│               ├── pricing.ts            # All pricing response types
│               ├── project.ts            # +avg_rent, inventory_overhang_months, etc.
│               ├── scenario-profile.ts
│               └── variable-definition.ts
│
├── data/
│   └── seeds/
│       ├── cities.json                   # 9 Tier-1 cities
│       ├── micromarkets.json             # 15 micromarkets
│       ├── localities.json               # 15 localities
│       ├── developers.json               # 10 developers
│       ├── projects.json                 # 12 projects across all cities
│       ├── variable_definitions.json     # 30 variable definitions
│       ├── infrastructure_records.json   # 12 infra records
│       └── scenario_profiles.json        # bear / base / bull / custom
│
├── docs/
│   └── SCOPE_TRACKER.md                  # Frozen scope + delivery tracker (Steps 0–12)
├── infra/                                # Infrastructure config (future)
├── packages/                             # Shared packages (future)
└── scripts/                              # Utility scripts
```

---

## Getting started

### Prerequisites

- **Python 3.10+** — backend runtime
- **Node.js 18+** — frontend runtime (Node 22 recommended)
- **pip** — Python package manager
- **npm** — Node package manager

### Backend setup

```bash
# Navigate to the API directory
cd apps/api

# Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate          # macOS / Linux
# .venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# (Optional) Create a .env file to override defaults
cp .env.example .env               # if the example exists, else create manually
```

### Frontend setup

```bash
# Navigate to the web directory
cd apps/web

# Install dependencies
npm install
```

### Environment variables

#### Backend — `apps/api/.env`

```dotenv
APP_ENV=development
DEBUG=true
API_HOST=0.0.0.0
API_PORT=9000
DATABASE_URL=sqlite:///./pan_india_price_projection.db
CORS_ALLOW_ORIGINS=http://localhost:3000
```

All fields have sensible defaults built into `config.py` so the backend runs without a `.env` file out of the box.

#### Frontend — `apps/web/.env.local`

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:9000
```

If this variable is not set, the frontend defaults to `http://localhost:9000`.

---

## Running the product

### Start the backend

```bash
cd apps/api
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 9000 --reload
```

The API will be available at:
- API base: `http://localhost:9000`
- Interactive docs (Swagger UI): `http://localhost:9000/docs`
- ReDoc: `http://localhost:9000/redoc`
- OpenAPI JSON: `http://localhost:9000/openapi.json`

The database is created automatically on first startup. Seed data is loaded for all 8 tables (cities, micromarkets, localities, developers, projects, variable definitions, infrastructure records, scenario profiles) if the tables are empty. No migration step is required.

To verify seed health after startup: `GET /api/v1/seed-status`

### Start the frontend

```bash
cd apps/web
npm run dev
```

The frontend will be available at `http://localhost:3000`.

### Run both together (from repo root)

```bash
# Terminal 1
cd apps/api && source .venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 9000 --reload

# Terminal 2
cd apps/web && npm run dev
```

---

## Running tests

```bash
cd apps/api
source .venv/bin/activate
python -m pytest tests/ -v
```

The test suite covers 49 cases across the full pricing engine:

| Test class | What it covers |
|---|---|
| `TestToFloat` | String / None / comma-separated / float passthrough |
| `TestClamp` | Boundary clamping in all directions |
| `TestDataCompleteness` | Completeness scoring across empty and filled payloads |
| `TestConfidenceScore` | Five-driver model floor, cap, and ordering |
| `TestScenarioCAGR` | DB-injected values, custom override, fallback defaults |
| `TestProjectionGrowthRate` | Bounds, bull > bear ordering, overhang drag, metro uplift |
| `TestComputeBasePricing` | All six factor directions, band ordering, factor count, summary text |
| `TestComputeCurrentFairPrice` | Response shape, scenario code preservation |
| `TestComputeProjectionAnalysis` | Projection labels, monotonic growth, scenario count, risk flags |

Expected output: **49 passed**.

---

## API reference

All routes are prefixed with `/api/v1`.

### Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/health` | Returns service name, version, and status |
| `GET` | `/api/v1/seed-status` | Returns row count for each seed table; `seed_loaded: true` when all tables are populated |

### Dictionaries

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/dictionaries/cities` | List all active cities |
| `GET` | `/api/v1/dictionaries/micromarkets` | List micromarkets (filter by `city_id`) |
| `GET` | `/api/v1/dictionaries/localities` | List localities (filter by `city_id`, `micromarket_id`) |
| `GET` | `/api/v1/dictionaries/developers` | List all developers |
| `GET` | `/api/v1/dictionaries/projects` | List projects (filter by `city_id`, `q` search, `limit`) |
| `GET` | `/api/v1/dictionaries/variable-definitions` | Full variable dictionary with metadata (filter by `category`) |
| `GET` | `/api/v1/dictionaries/scenario-profiles` | Bear / base / bull / custom scenario configs |
| `GET` | `/api/v1/dictionaries/infrastructure-records` | Infrastructure records (filter by `city_id`, `infra_type`) |

### Pricing

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/pricing/current-fair-price` | Run current fair price analysis only |
| `POST` | `/api/v1/pricing/projection-summary` | Run full analysis: fair price + projections + sensitivity |
| `POST` | `/api/v1/pricing/sensitivity` | Run standalone sensitivity analysis only |
| `POST` | `/api/v1/pricing/save-analysis` | Save a named projection analysis snapshot |
| `GET` | `/api/v1/pricing/saved-analyses` | List all saved analyses |
| `GET` | `/api/v1/pricing/saved-analyses/{analysis_id}` | Retrieve a saved analysis with full result payload |
| `POST` | `/api/v1/pricing/export-csv` | Export projection results as a CSV string |

#### Example pricing request body (`POST /api/v1/pricing/projection-summary`)

```json
{
  "project_name": "DLF Privana SPR",
  "city_id": 1,
  "micromarket_id": 2,
  "locality_id": 2,
  "project_stage": "New Launch",
  "rera_status": "Registered",
  "total_units": "1100",
  "avg_unit_size_sqft": "2250",
  "density_units_per_acre": "73",
  "parking_ratio": "2.0",
  "open_space_pct": "72",
  "amenity_score": "9.1",
  "construction_quality_score": "9.0",
  "legal_clarity_score": "8.9",
  "benchmark_current_asking_price": "19800",
  "benchmark_radius_km": "3",
  "comparable_sold_psf": "18500",
  "avg_rent": "52000",
  "inventory_overhang_months": "14",
  "absorption_rate_pct": "62",
  "new_supply_upcoming_units": "3500",
  "developer_brand_score": "9.3",
  "developer_on_time_score": "8.7",
  "developer_litigation_score": "3.2",
  "repo_rate_pct": "6.5",
  "inflation_rate_pct": "5.0",
  "gdp_growth_pct": "6.8",
  "distance_to_metro_km": "3.0",
  "distance_to_cbd_km": "8",
  "distance_to_airport_km": "22",
  "social_infra_score": "7.5",
  "infra_uplift_pct": "4.5",
  "scenario_code": "base"
}
```

> **Note:** The route automatically injects ScenarioProfile adjustment values from the database before calling the engine, so you do not need to supply `scenario_market_cagr` or related fields manually.

---

## Pricing engine

All computation is in `apps/api/app/services/pricing_engine.py`. No formula logic lives in the frontend. No hardcoded scenario lookup tables exist in the engine — all scenario values are injected from the database by the route layer.

### Current fair price formula

```
Current Fair Price =
  Benchmark Price × (1 + total_adjustment_pct)

total_adjustment_pct =
    specification_adjustment
  + market_and_supply_demand_adjustment
  + connectivity_and_infrastructure_adjustment
  + developer_premium_adjustment
  + macro_and_risk_adjustment
  + stage_and_regulatory_adjustment
```

Clamped to [−25%, +30%].

**Fair price band** is ±5% around the fair price point estimate.

**Benchmark delta** is:
```
((fair_price − benchmark_price) / benchmark_price) × 100
```

### Pricing factors (6)

| Factor | Key inputs | Direction |
|---|---|---|
| **Specification** | amenity score, construction quality, legal clarity, open space %, parking ratio, density | Each driver adjusts ±% relative to a neutral baseline |
| **Market and supply-demand** | avg rent, inventory overhang, absorption rate, comparable sold PSF, upcoming supply, scenario supply-stress | Higher rent and absorption → positive; high overhang and upcoming supply → negative |
| **Connectivity and infrastructure** | metro distance, CBD distance, airport distance, social infra score, infra uplift % | Proximity to transit and employment → positive; infra uplift scaled by scenario infra-realization coefficient |
| **Developer premium** | brand score, on-time delivery score, litigation risk score, scenario developer-premium drift | Strong brand and delivery record → positive; high litigation → negative |
| **Macro and risk** | repo rate, CPI inflation, GDP growth, scenario affordability drag, scenario risk drag | High rates and inflation → negative; strong GDP → positive |
| **Stage and regulatory** | project stage, RERA status | New Launch: −0.5%, Under Construction: −2%, Pre-Launch: −3%, Ready to Move: 0%; Not Registered: −4% |

### Forward projection formula

```
Future Price(t) =
  Current Fair Price ×
  (1 + growth_rate) ^ t

growth_rate =
    scenario_market_cagr        ← read from DB ScenarioProfile
  + amenity_growth_adjustment
  + connectivity_growth_adjustment
  + infra_quality_adjustment
  − supply_drag
  + scenario_supply_stress
  + scenario_infra_realization
```

Where `t` ∈ {1, 3, 5} years. Scenario CAGRs from the database:
- Bear: 4% base CAGR
- Base: 8% base CAGR
- Bull: 12% base CAGR
- Custom: user-supplied rate via `custom_growth_rate_pct`

### Confidence score

Five-driver model, scored 0–100 with a floor of 50:

| Driver | Max points | Description |
|---|---|---|
| Data completeness | 10 | Linear scale from 0–100% completeness across all 30 tracked fields |
| Benchmark quality | 10 | Benchmark price present + radius ≤ 2 km earns full points |
| Developer profile | 10 | Brand score + on-time score both present |
| Supply-demand data | 10 | Inventory overhang + absorption rate both present |
| Legal clarity | 10 | Legal clarity score ≥ 8 earns close to full points |

Labels: **High confidence** (≥ 85) · **Moderate confidence** (≥ 70) · **Low confidence** (< 70).

---

## Frontend workspace guide

### 1. Project search
Select a city to narrow the dictionary, then type a project name or address in the search box. Click any project card to select it as the subject project. All 44 analysis input fields are immediately prefilled from that project's dictionary record.

### 2. Scenario selection
Choose bear, base, bull, or custom. Changing scenario clears any existing result. The engine reads the scenario's CAGR and all adjustment factors from the database — no frontend configuration required.

### 3. Input overrides
Every field group card is editable. Numeric fields validate min/max on blur and show an inline error if out of range. Required fields show a red asterisk. Select inputs (project stage, RERA status, scenario code) render as dropdowns. Changes are stored as per-project overrides in memory — switching projects preserves each project's overrides independently.

### 4. Data quality warning
After running analysis, if fewer than 60% of the 30 tracked input fields are populated, an amber warning banner appears identifying the input families to complete. Filling more fields improves both the confidence score and the accuracy of all factor adjustments.

### 5. Running analysis
Click **Run fair price, projection and sensitivity analysis** in the right-rail sidebar. The engine returns:
- Current fair price + band + benchmark delta + confidence score
- 1Y / 3Y / 5Y projections for the selected scenario
- Scenario comparison table (bear, base, bull)
- Interpretation bullets + risk flags + confidence explanation
- Sensitivity sweeps across six key drivers
- All six pricing factor contributions
- Projection trend line chart + scenario comparison bar chart

### 6. Saving a run
Click **Save** in the sidebar. The run is saved with an auto-generated name (`[project] · [SCENARIO] · [timestamp]`) and immediately appears in the Saved analyses panel.

### 7. Reopening a saved analysis
In the Saved analyses panel (right rail), click **Open** next to any saved run. The full result is loaded into the main results area. A banner identifies the run being viewed with name, project, scenario, and save date. Click **Clear** to return to the current workspace state.

### 8. Comparing two saved runs
Check the boxes on any two saved analyses in the panel. A **Compare 2 selected →** button appears. Click it to load a full-width comparison table beneath the workspace showing all metrics side by side with "Better" highlights.

### 9. Exporting
With an analysis result active, click **JSON** to download the full structured result or **CSV** to download the projection table rows.

---

## Input form groups

The analysis form is organised into eight groups. All groups are always visible and independently editable.

| Group | Fields | Key drivers |
|---|---|---|
| **Project basics** | Name, stage, RERA status, total units, launch date, possession date | Stage drives construction risk discount; RERA status drives legal risk penalty |
| **Product and configuration** | Unit size, density, parking, open space, amenity score, quality score, legal clarity, land area, towers, floors | All feed the specification factor |
| **Market and benchmark** | Benchmark price, radius, comparable sold PSF, avg rent | Benchmark is the pricing baseline; sold PSF and rent feed market adjustment |
| **Supply and demand** | Inventory overhang, absorption rate, upcoming new supply | Feed the supply-demand component of the market factor |
| **Developer profile** | Brand score, on-time delivery score, litigation risk score | All feed the developer premium factor |
| **Macro inputs** | Repo rate, CPI inflation, GDP growth | Feed the macro adjustment factor; sensible defaults pre-populated |
| **Connectivity and infrastructure** | Metro distance, CBD distance, airport distance, social infra score, infra uplift % | Feed connectivity and infrastructure factors |
| **Scenario adjustments** | Scenario code, custom growth rate | Custom rate only used when scenario = "custom" |

---

## Analytics instrumentation

Events are defined and fired in `apps/web/src/lib/analytics.ts`. In development they log to the browser console under `[analytics]`. To send events to a real provider, replace the body of `trackEvent()`.

| Event | Fired when |
|---|---|
| `searched_project` | User types in search box or changes city filter |
| `selected_project` | User clicks a project card |
| `changed_scenario` | User selects a different scenario profile |
| `edited_input` | User modifies any analysis input field |
| `ran_analysis` | User clicks Run analysis |
| `saved_analysis` | Analysis successfully saved |
| `exported_json` | User clicks JSON export |
| `exported_csv` | User clicks CSV export |
| `opened_saved_analysis` | User clicks Open on a saved run |
| `compared_saved_analyses` | User triggers a side-by-side comparison |

---

## Data model

### Core entities

| Model | Key fields |
|---|---|
| `City` | city_code, city_name, state_name, zone, tier, demand_index, affordability_index, macro_growth_index |
| `Micromarket` | micromarket_code, city_id, market_type, avg_price, avg_rent, inventory_overhang_months, absorption_index, infra_momentum_index |
| `Locality` | locality_code, micromarket_id, city_id, avg_price, avg_rent, livability_index, social_infra_index, connectivity_index |
| `Developer` | developer_code, brand_score, on_time_delivery_score, quality_score, litigation_risk_score, consumer_sentiment_score, premium_index_vs_market |
| `Project` | project_code, developer_id, city/micromarket/locality IDs, all physical fields, avg_rent, inventory_overhang_months, distance_to_metro_km, social_infra_score |
| `VariableDefinition` | field_key, display_name, category, description, why_it_matters, unit, min_value, max_value, required_flag, input_type |
| `ScenarioProfile` | scenario_code, scenario_name, market_cagr, supply_stress_adjustment, infra_realization_adjustment, affordability_drag_adjustment, developer_premium_drift, risk_drag_adjustment |
| `InfrastructureRecord` | infra_type, city/locality IDs, status, distance_to_project_km, type_weight, status_weight, probability_weight, time_relevance_weight_1y/3y/5y, estimated_uplift_min/max_pct |
| `SavedAnalysis` | analysis_id (UUID), analysis_name, result (JSON blob) |

### ScenarioProfile fields used by the engine

All six ScenarioProfile numeric fields are injected into `PricingAnalysisInput` by the pricing route before calling the engine:

| Field | Role in engine |
|---|---|
| `market_cagr` | Base CAGR for all forward projections |
| `supply_stress_adjustment` | Added to market adjustment factor |
| `infra_realization_adjustment` | Scales infrastructure uplift impact and added to projection growth |
| `affordability_drag_adjustment` | Added to macro adjustment factor |
| `developer_premium_drift` | Added to developer premium factor |
| `risk_drag_adjustment` | Added to macro adjustment factor |

---

## Seed data

The database is seeded automatically on startup by `apps/api/app/services/seed_loader.py`. All tables are seeded only if empty, so restarting a live server never overwrites data. To force a fresh seed, delete `pan_india_price_projection.db` and restart.

Current seed coverage:

| Table | Count | Coverage |
|---|---|---|
| Cities | 9 | All major Tier 1 markets: Gurgaon, Noida, Mumbai, Bangalore, Hyderabad, Pune, Chennai, Kolkata, Ahmedabad |
| Micromarkets | 15 | 1–2 key micromarkets per city |
| Localities | 15 | 1 locality per micromarket |
| Developers | 10 | DLF, Sobha, Godrej Properties, Prestige Group, Brigade Group, Mahindra Lifespaces, Lodha Group, Tata Housing, Puravankara, Independent/Unknown |
| Projects | 12 | Spread across all 9 cities, all stages (new launch, under construction, ready to move), all 10 developers |
| Variable definitions | 30 | All input families: project basics, product, market benchmark, supply-demand, developer profile, macro, connectivity, infrastructure, scenario adjustments |
| Infrastructure records | 12 | Metro, expressway, bridge, rail records across all 9 cities |
| Scenario profiles | 4 | Bear (4% CAGR), Base (8% CAGR), Bull (12% CAGR), Custom |

---

## Export formats

### JSON export
Full `ProjectionAnalysisResponse` payload serialised with 2-space indentation. Includes all six pricing factors, all projection points, all sensitivity scenarios, risk flags, and confidence explanation. Filename: `[project-slug]-[scenario].json`.

### CSV export
Projection table rows including year, label, projected price, scenario, and key summary fields. Filename: `[project-slug]-[scenario].csv`.

Both exports are triggered client-side after a result is in memory. No server round-trip is required for JSON export.

---

## Extending the product

### Adding a new city or project
Add records to the relevant seed JSON files in `data/seeds/` and delete `pan_india_price_projection.db` to trigger a fresh seed on the next startup.

### Adding a new input variable
1. Add a `VariableDefinition` record to `data/seeds/variable_definitions.json`.
2. Add the field to `PricingAnalysisInput` in `apps/api/app/schemas/pricing.py`.
3. Add the field to `AnalysisFormValues` in `apps/web/src/types/analysis-form.ts`.
4. Add the field config (label, placeholder, unit, min, max) to the appropriate group in `apps/web/src/lib/analysis-form.ts`.
5. Reference the new field in `apps/api/app/services/pricing_engine.py` in the relevant factor computation.
6. Add a test case in `apps/api/tests/test_pricing_engine.py` verifying the factor direction.

### Switching to Postgres
Change `DATABASE_URL` in `.env` to a Postgres connection string. SQLAlchemy 2.0 and all models are Postgres-compatible out of the box.

### Adding a real analytics provider
In `apps/web/src/lib/analytics.ts`, replace the body of `trackEvent()`:
```typescript
function trackEvent(name: AnalyticsEventName, payload?: AnalyticsPayload): void {
  // Example: PostHog
  window.posthog?.capture(name, payload);
}
```

### Adding user authentication
The backend is stateless by design. Add a JWT middleware layer to FastAPI and pass the user token from the frontend. Saved analyses can then be scoped by user ID.

### Replacing the flat analysis store with the DB model
`apps/api/app/services/analysis_store.py` currently persists analyses as a flat JSON file. To migrate to the `SavedAnalysis` SQLAlchemy model (which is already defined), replace the file-based read/write calls with SQLAlchemy session queries.

---

## Build history

| Step | Delivery |
|---|---|
| Step 0 | Monorepo initialisation, Git, folder scaffold, README, .gitignore |
| Step 1 | FastAPI backend foundation — config, DB base, health route |
| Step 2 | Next.js frontend — app shell, layout, API health integration |
| Step 3 | SQLAlchemy models and seed-ready database foundation |
| Step 4 | Seed ingestion and all dictionary GET APIs |
| Step 5 | Frontend dictionary consumption, search-first input shell |
| Step 6 | Editable analysis form state and project-prefill workflow |
| Step 7 | Backend pricing API — current fair price engine, Swagger, frontend result cards |
| Step 8 | Forward projection engine, scenario comparison, visual output charts |
| Step 9 | Sensitivity layer, interpretation bullets, risk flags, confidence explanation |
| Step 10 | Save/export flows (save, JSON, CSV), saved analyses list, dashboard polish |
| Step 11 | Analytics instrumentation, saved analysis reopen UX, compare runs, full polish pass |
| Step 12 | Gap resolution — data-driven engine rewrite, 9-city seed, 10 developers, 12 projects, 30 variable definitions, 8 input groups, 44 form fields, field validation, data quality banner, 49 unit tests |

---

## Scope boundaries (V1)

**In scope:** PAN India primary residential market, city / micromarket / locality / project level analysis, new launch / under construction / ready to move stages, bear / base / bull / custom scenarios, six-factor data-driven pricing engine, developer premium, macro adjustment, infra uplift, save and export, compare saved runs, analytics instrumentation, unit test suite.

**Out of scope for V1:** commercial pricing, land pricing, rental-resale hybrid valuation, GIS map UI, automated external API sync, user authentication and roles, mobile app, multilingual UI, ML auto-training pipeline.

---

*Built iteratively across Steps 0–12. All formula logic is confined to the backend pricing engine. All scenario values are read from the database at runtime — no hardcoded lookup tables remain in the engine. All UI label and input metadata is config-driven through the variable dictionary.*
