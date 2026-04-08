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
8. [API reference](#api-reference)
9. [Pricing engine](#pricing-engine)
   - [Current fair price formula](#current-fair-price-formula)
   - [Forward projection formula](#forward-projection-formula)
   - [Confidence score](#confidence-score)
10. [Frontend workspace guide](#frontend-workspace-guide)
11. [Analytics instrumentation](#analytics-instrumentation)
12. [Data model](#data-model)
13. [Seed data](#seed-data)
14. [Export formats](#export-formats)
15. [Extending the product](#extending-the-product)
16. [Build history](#build-history)

---

## What this product does

Given any residential real estate project in India, this engine computes:

- **Current fair asking price per sq ft** — derived from benchmark price, location premium, developer premium, product and specification premium, connectivity premium, infrastructure premium, demand momentum, supply pressure discount, and risk discount.
- **Fair price band** — a ±range around the point estimate.
- **Benchmark delta** — premium or discount relative to the market benchmark.
- **Confidence score** — based on data completeness, comparable quality, and assumption freshness.
- **1Y / 3Y / 5Y forward projections** — under bear, base, bull, and custom scenario assumptions.
- **Scenario comparison** — all four scenarios compared side by side at each time horizon.
- **Sensitivity analysis** — how fair price moves when each key driver shifts ±10%.
- **Factor contribution breakdown** — which pricing factors added or discounted value, and by how much.
- **Narrative interpretation** — plain-English summary, interpretation bullets, and risk flags.

All outputs are saveable as named snapshots and exportable as JSON or CSV.

---

## Key features

**Search-first workflow** — start by searching or filtering the project dictionary; selecting a project prefills all analysis inputs from its dictionary record.

**Editable assumptions** — every input field can be overridden per project without affecting other projects. Overrides are stored in-memory per session.

**Multi-scenario analysis** — bear, base, bull, and custom scenario profiles are selectable; the projection engine applies each scenario's CAGR assumptions to produce the full 1Y / 3Y / 5Y output set.

**Sensitivity engine** — sweeps six key drivers (benchmark price, absorption rate, inventory overhang, amenity score, infra score, legal clarity) across downside and upside cases to show which variable moves the fair price most.

**Save and reopen** — analysis runs can be saved as named snapshots. Any saved run can be reopened in the workspace to view its full result set, including all projection and sensitivity outputs.

**Compare runs** — select any two saved analyses and view a structured side-by-side comparison table covering all key metrics, with "Better" highlights and interpretation summaries.

**Export** — results export as JSON (full structured payload) or CSV (projection table rows).

**Analytics layer** — a typed event-tracking module instruments ten user interactions. Console-logged in development; swap the implementation to forward to PostHog, Segment, or Amplitude.

**Variable glossary** — every input variable is documented with definition, unit, acceptable range, formula impact, and example value.

---

## Architecture overview

```
Browser (Next.js)
       │
       │  REST (JSON / CSV)
       ▼
FastAPI backend  ──►  SQLite database
       │
       ├── /api/v1/dictionaries/*   (cities, projects, variables, scenarios, …)
       ├── /api/v1/pricing/*        (fair price, projection, save, export)
       └── /api/v1/health
```

The backend is stateless except for the SQLite file (swappable for Postgres). All pricing and projection logic lives in `apps/api/app/services/pricing_engine.py`. The frontend fetches dictionaries at page load (server component) and drives analysis interactivity through client components.

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
│   │   │   │       ├── health.py         # GET /health
│   │   │   │       └── pricing.py        # POST endpoints for analysis + save
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
│   │   │   │   ├── project.py
│   │   │   │   ├── saved_analysis.py
│   │   │   │   ├── scenario_profile.py
│   │   │   │   └── variable_definition.py
│   │   │   ├── schemas/                  # Pydantic request/response schemas
│   │   │   │   └── pricing.py            # All pricing I/O types
│   │   │   ├── services/
│   │   │   │   ├── analysis_store.py     # Save / fetch / export logic
│   │   │   │   ├── pricing_engine.py     # Core fair price + projection engine
│   │   │   │   └── seed_loader.py        # Seed data ingestion on startup
│   │   │   └── main.py                   # FastAPI app factory + lifespan
│   │   ├── requirements.txt
│   │   └── tests/
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
│           │   │   ├── analysis-workspace.tsx    # Main client orchestrator
│           │   │   ├── compare-runs-section.tsx  # Side-by-side comparison UI
│           │   │   ├── current-fair-price-results.tsx
│           │   │   ├── editable-field-card.tsx
│           │   │   ├── projection-charts.tsx
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
│           │   ├── analysis-form.ts      # Form groups + prefill logic
│           │   ├── analytics.ts          # Event tracking module
│           │   ├── api.ts                # All API call functions
│           │   └── export.ts             # Client-side export helpers
│           └── types/
│               ├── analysis-form.ts
│               ├── city.ts
│               ├── health.ts
│               ├── pricing.ts            # All pricing response types
│               ├── project.ts
│               ├── scenario-profile.ts
│               └── variable-definition.ts
│
├── data/                             # Raw / reference data files
├── docs/
│   └── SCOPE_TRACKER.md              # Frozen scope + delivery tracker
├── infra/                            # Infrastructure config (future)
├── packages/                         # Shared packages (future)
└── scripts/                          # Utility scripts
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

The database is created automatically on first startup and seed data is loaded if the tables are empty. No migration step is required for V1.

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

## API reference

All routes are prefixed with `/api/v1`.

### Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/health` | Returns service name, version, and status |

### Dictionaries

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/dictionaries/cities` | List all active cities |
| `GET` | `/api/v1/dictionaries/micromarkets` | List micromarkets (filter by `city_id`) |
| `GET` | `/api/v1/dictionaries/localities` | List localities (filter by `micromarket_id`) |
| `GET` | `/api/v1/dictionaries/developers` | List all developers |
| `GET` | `/api/v1/dictionaries/projects` | List projects (filter by `city_id`, `q` search, `limit`) |
| `GET` | `/api/v1/dictionaries/variable-definitions` | Full variable dictionary with metadata |
| `GET` | `/api/v1/dictionaries/scenario-profiles` | Bear / base / bull / custom scenario configs |
| `GET` | `/api/v1/dictionaries/infrastructure-records` | Infrastructure records (filter by `city_id`) |

### Pricing

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/pricing/current-fair-price` | Run current fair price analysis only |
| `POST` | `/api/v1/pricing/projection-summary` | Run full analysis: fair price + projections + sensitivity |
| `POST` | `/api/v1/pricing/save-analysis` | Save a named projection analysis snapshot |
| `GET` | `/api/v1/pricing/saved-analyses` | List all saved analyses |
| `GET` | `/api/v1/pricing/saved-analyses/{analysis_id}` | Retrieve a saved analysis with full result payload |
| `POST` | `/api/v1/pricing/export-csv` | Export projection results as a CSV string |

#### Pricing request body (`POST /api/v1/pricing/projection-summary`)

```json
{
  "project_name": "Prestige Lakeside Habitat",
  "city_id": 1,
  "micromarket_id": 3,
  "locality_id": 7,
  "project_stage": "Under Construction",
  "launch_date": "2022-01-01",
  "expected_possession_date": "2026-06-01",
  "total_land_acres": "50",
  "total_units": "1200",
  "towers_count": "8",
  "floors_count": "28",
  "avg_unit_size_sqft": "1450",
  "density_units_per_acre": "24",
  "parking_ratio": "1.2",
  "open_space_pct": "40",
  "amenity_score": "78",
  "construction_quality_score": "82",
  "legal_clarity_score": "90",
  "benchmark_current_asking_price": "9800",
  "benchmark_radius_km": "3",
  "avg_rent": "38000",
  "inventory_overhang_months": "14",
  "distance_to_metro_km": "1.2",
  "social_infra_score": "72",
  "scenario_code": "base"
}
```

---

## Pricing engine

All computation is in `apps/api/app/services/pricing_engine.py`. No formula logic lives in the frontend.

### Current fair price formula

```
Current Fair Price =
  Base Benchmark Price
  + Location Premium          (micromarket and locality demand index)
  + Developer Premium         (brand score and delivery track record)
  + Product Premium           (land parcel, unit mix, density)
  + Specification Premium     (amenity score, construction quality)
  + Connectivity Premium      (metro distance, social infra score)
  + Infrastructure Premium    (upcoming infra weighted by probability)
  + Demand Momentum           (absorption rate, booking velocity)
  − Supply Pressure Discount  (inventory overhang, new launches)
  − Risk Discount             (legal clarity, possession delay risk)
  ± Scenario Adjustment       (bear: −2%, base: 0%, bull: +3%, custom: variable)
```

Each factor is computed as a percentage adjustment and applied multiplicatively to the benchmark price. The final fair price is rounded to the nearest integer.

**Fair price band** is computed as ±5% around the fair price point estimate (widening when confidence is lower).

**Benchmark delta** is:
```
((fair_price − benchmark_price) / benchmark_price) × 100
```

### Forward projection formula

```
Future Price(t) =
  Current Fair Price ×
  (1 + Market CAGR
     + Infra Uplift(t)
     + Demand Drift
     + Developer Drift
     − Supply Drag
     − Affordability Drag
     − Risk Drag) ^ t
```

Where `t` ∈ {1, 3, 5} years. Each scenario profile defines a different `Market CAGR`:
- Bear: −2% annual adjustment
- Base: 0% (market-rate growth only)
- Bull: +3% annual uplift
- Custom: configurable via the scenario profile record

### Confidence score

Scored 0–100, based on:
- Data completeness (% of tracked fields filled)
- Data freshness (recency of benchmark price)
- Comparable count quality
- Infrastructure confidence weighting
- Number of assumption overrides applied

---

## Frontend workspace guide

### 1. Project search
Select a city to narrow the dictionary, then type a project name or address in the search box. Click any project card to select it as the subject project. The analysis form is immediately prefilled from that project's dictionary record.

### 2. Scenario selection
Choose bear, base, bull, or custom scenario. This sets the market CAGR assumption for the projection engine. Changing scenario clears any existing result to prevent stale display.

### 3. Input overrides
Every field group card is editable. Changes are stored as per-project overrides in memory — switching projects preserves each project's overrides independently.

### 4. Running analysis
Click **Run fair price, projection and sensitivity analysis** in the right-rail sidebar. The engine returns:
- Current fair price + band + benchmark delta + confidence
- 1Y / 3Y / 5Y projections for the selected scenario
- Scenario comparison table (all four scenarios)
- Interpretation bullets + risk flags + confidence explanation
- Sensitivity sweeps across six key drivers
- Factor contribution breakdown
- Projection trend line chart + scenario comparison bar chart

### 5. Saving a run
Click **Save** in the sidebar. The run is saved with an auto-generated name (`[project] · [SCENARIO] · [timestamp]`) and immediately appears in the Saved analyses panel.

### 6. Reopening a saved analysis
In the Saved analyses panel (right rail), click **Open** next to any saved run. The full result is loaded into the main results area. A banner identifies the run being viewed with name, project, scenario, and save date. Click **Clear** to return to the current workspace state.

### 7. Comparing two saved runs
Check the boxes on any two saved analyses in the panel. A **Compare 2 selected →** button appears. Click it to load a full-width comparison table beneath the workspace showing all metrics side by side with "Better" highlights.

### 8. Exporting
With an analysis result active, click **JSON** to download the full structured result or **CSV** to download the projection table rows.

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
| `City` | city_id, city_name, state_name, tier, demand_index, affordability_index |
| `Micromarket` | micromarket_id, city_id, avg_price, absorption_index, infra_momentum_index |
| `Locality` | locality_id, micromarket_id, city_id, avg_price, livability_index |
| `Developer` | developer_id, brand_score, on_time_delivery_score, litigation_risk_score |
| `Project` | project_id, developer_id, city/micromarket/locality IDs, all physical + pricing fields |
| `VariableDefinition` | field_key, display_name, category, description, why_it_matters, unit, allowed_values |
| `ScenarioProfile` | scenario_code, scenario_name, market_cagr, is_default |
| `InfrastructureRecord` | infra_type, city/locality IDs, status, distance_to_project_km, probability_weight |
| `SavedAnalysis` | analysis_id (UUID), analysis_name, result (JSON blob) |

---

## Seed data

The database is seeded automatically on startup by `apps/api/app/services/seed_loader.py`. The seed includes:

- Indian cities across Tier 1 and Tier 2 markets (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Pune, Chennai, Kolkata, Ahmedabad, and others)
- Key micromarkets within each city
- Representative localities
- Developer profiles covering major national and regional developers
- 20+ residential projects covering new launch, under construction, and near-possession stages
- A comprehensive variable dictionary covering all input families (project identity, product, connectivity, market benchmarks, supply-demand, developer, regulatory, macro, infra, scenario)
- Bear / base / bull / custom scenario profiles
- Infrastructure records representing upcoming metro lines, expressways, and civic projects

To reset the database and reseed: delete `pan_india_price_projection.db` and restart the API server.

---

## Export formats

### JSON export
Full `ProjectionAnalysisResponse` payload serialised with 2-space indentation. Filename: `[project-slug]-[scenario].json`.

### CSV export
Projection table rows including year, label, projected price, scenario, and key summary fields. Filename: `[project-slug]-[scenario].csv`.

Both exports are triggered client-side after a result is in memory. No server round-trip is required for JSON export.

---

## Extending the product

### Adding a new city or project
Add records to the relevant seed functions in `seed_loader.py` and restart the API to trigger a fresh seed pass (or insert directly into the SQLite file).

### Adding a new input variable
1. Add a `VariableDefinition` seed record with the new `field_key`.
2. Add the field to `PricingAnalysisInput` in `schemas/pricing.py`.
3. Add the field to `AnalysisFormValues` in `types/analysis-form.ts` and `analysis-form.ts`.
4. Reference the field in `pricing_engine.py` in the relevant factor computation.

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

---

## Scope boundaries (V1)

**In scope:** PAN India primary residential market, city / micromarket / locality / project level analysis, new launch / under construction / near-possession stages, bear / base / bull / custom scenarios, save and export, compare saved runs, analytics instrumentation.

**Out of scope for V1:** commercial pricing, land pricing, rental-resale hybrid valuation, GIS map UI, automated external API sync, user authentication and roles, mobile app, multilingual UI, ML auto-training pipeline.

---

*Built iteratively across Steps 0–11. All formula logic is confined to the backend pricing engine. All UI label and input metadata is config-driven through the variable dictionary. No hardcoded display strings appear in component code.*
