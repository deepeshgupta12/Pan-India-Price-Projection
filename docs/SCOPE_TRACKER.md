# PAN India Real Estate Asking Price Projection Engine

## Project Purpose
Build an end-to-end web product that estimates:
- current fair average asking price
- future asking price projections
- 1Y / 3Y / 5Y scenarios
- bear / base / bull / custom cases
- factor contribution
- upcoming infrastructure impact
- confidence / sensitivity / risk indicators

for PAN India residential primary-market projects.

---

## Frozen Scope

### In Scope
- PAN India support
- City, micromarket, locality, project-level analysis
- Residential primary market projects
- New launch, under-construction, near-possession stages
- Project dictionary
- Variable dictionary
- Developer dictionary
- Geography dictionary
- Comparable projects engine
- Infrastructure impact engine
- Pricing engine
- Projection engine
- Sensitivity engine
- Save/export engine
- Search-first flow
- Manual analysis flow
- Input glossary page
- Beautiful cards and interactive graphs
- Local monorepo with backend + frontend
- GitHub publishing

### Out of Scope for V1
- Commercial pricing
- Land pricing
- Rental-resale hybrid valuation
- Full GIS map UI
- Automated external API sync
- User auth and roles
- Mobile app
- Multilingual UI
- Advanced PDF styling
- ML auto-training pipeline

---

## Product Modules

### 1. Project Dictionary
Fields:
- project_id
- project_name
- developer_id
- developer_name
- city_id
- city_name
- micromarket_id
- micromarket_name
- locality_id
- locality_name
- address_text
- asset_class
- project_stage
- launch_date
- expected_possession_date
- total_land_acres
- total_units
- towers_count
- floors_count
- unit_mix_summary
- avg_unit_size_sqft
- density_units_per_acre
- parking_ratio
- open_space_pct
- amenity_score
- construction_quality_score
- legal_clarity_score
- rera_status
- benchmark_current_asking_price
- benchmark_radius_km
- status_active
- source
- last_updated_at

### 2. Variable Dictionary
Every UI input must include:
- field_key
- display_name
- category
- description
- why_it_matters
- placeholder
- help_text
- allowed_values
- unit
- min_value
- max_value
- default_value
- required_flag
- editable_flag
- input_type
- tooltip_text
- example
- formula_dependency
- output_impact

### 3. Developer Dictionary
- developer_id
- developer_name
- city_presence_count
- completed_projects_count
- under_construction_count
- avg_delivery_delay_months
- on_time_delivery_score
- brand_score
- quality_score
- litigation_risk_score
- consumer_sentiment_score
- premium_index_vs_market
- source
- last_updated_at

### 4. Geography Dictionary
City:
- city_id
- city_name
- zone
- state_name
- tier
- demand_index
- affordability_index
- macro_growth_index

Micromarket:
- micromarket_id
- micromarket_name
- city_id
- market_type
- avg_price
- avg_rent
- inventory_overhang
- absorption_index
- future_supply_index
- infra_momentum_index

Locality:
- locality_id
- locality_name
- micromarket_id
- city_id
- avg_price
- avg_rent
- search_demand_index
- livability_index
- social_infra_index
- connectivity_index

### 5. Comparable Projects Engine
Inputs:
- radius
- city / micromarket / locality
- stage
- product type
- ticket size band
- BHK configuration
- developer category
- density band

Outputs:
- comparable projects list
- average comparable asking price
- premium / discount vs comp set
- fair price band

### 6. Infrastructure Impact Engine
Each infra record:
- infra_id
- infra_name
- infra_type
- city_id
- micromarket_id
- locality_id
- latitude
- longitude
- status
- planned_start_date
- expected_completion_date
- confidence_level
- source_name
- source_url
- distance_to_project_km
- type_weight
- status_weight
- distance_weight
- probability_weight
- time_relevance_weight_1y
- time_relevance_weight_3y
- time_relevance_weight_5y
- estimated_uplift_min_pct
- estimated_uplift_max_pct
- remarks
- last_updated_at

Infra types:
- metro
- expressway
- road widening
- flyover / interchange
- railway / RRTS
- airport connectivity
- office hub
- mall / retail hub
- school / education cluster
- hospital cluster
- social infrastructure
- public utility / civic upgrade

Outputs:
- total infra impact score
- 1Y infra uplift
- 3Y infra uplift
- 5Y infra uplift
- delayed-risk adjustment
- high-confidence vs speculative uplift split

### 7. Pricing Engine
Current fair price structure:
- base benchmark price
- location premium
- developer premium
- product premium
- specification premium
- connectivity premium
- infrastructure premium
- demand momentum adjustment
- supply pressure discount
- risk discount

Outputs:
- fair price per sq ft
- fair unit price
- fair price range
- premium / discount vs benchmark

### 8. Projection Engine
Windows:
- 1 year
- 3 years
- 5 years

Scenarios:
- bear
- base
- bull
- custom

Drivers:
- city momentum
- micromarket CAGR
- supply pressure
- absorption
- infra completion
- developer brand persistence
- affordability drag
- macro rate drag
- policy drag

Outputs:
- projected asking price range
- annualized growth range
- factor contributions

### 9. Sensitivity Engine
Parameters:
- absorption
- infra completion probability
- home loan rate
- benchmark price
- supply overhang
- developer premium
- density
- amenity score

Outputs:
- sensitivity chart
- top variables influencing output
- confidence warnings

### 10. Save / Export Engine
V1 outputs:
- export JSON
- export CSV
- analysis snapshot save
- scenario save

---

## Detailed Input Families

### A. Project Identity Inputs
- project_name
- city
- micromarket
- locality
- developer
- project_stage
- launch_date
- expected_possession_date
- asset_type
- segment
- target_buyer_type

### B. Product / Physical Inputs
- land_parcel_acres
- total_units
- towers_count
- floors_count
- avg_unit_size_sqft
- bhk_mix_1
- bhk_mix_2
- bhk_mix_3
- bhk_mix_4
- density_units_per_acre
- parking_ratio
- open_space_pct
- clubhouse_size_sqft
- amenity_score
- construction_quality_score
- frontage_score
- view_premium_score

### C. Connectivity Inputs
- distance_to_metro_km
- distance_to_rrts_km
- distance_to_expressway_km
- distance_to_cbd_km
- travel_time_to_job_hub_min
- road_access_score
- social_infra_score
- school_count_5km
- hospital_count_5km
- mall_count_5km

### D. Market Benchmark Inputs
- locality_avg_asking_price
- micromarket_avg_asking_price
- city_avg_asking_price
- nearby_projects_avg_asking_price
- ready_to_move_avg_price
- resale_avg_price
- avg_rent
- rental_yield_pct

### E. Supply-Demand Inputs
- unsold_inventory_units
- inventory_overhang_months
- absorption_rate_monthly
- new_launches_12m
- enquiry_index
- site_visit_index
- booking_velocity_index
- search_demand_index

### F. Developer Inputs
- brand_score
- on_time_delivery_score
- quality_score
- litigation_risk_score
- premium_index_vs_market
- customer_sentiment_score

### G. Regulatory / Risk Inputs
- rera_status
- legal_clarity_score
- approvals_completion_pct
- possession_delay_risk_score
- title_risk_score

### H. Macro Inputs
- city_growth_index
- mortgage_rate_pct
- inflation_pct
- construction_cost_index
- income_growth_index
- affordability_pressure_index
- policy_risk_index

### I. Infrastructure Inputs
- number_of_upcoming_infra_items
- infra aggregate or per-item structured records
- weighted infra score
- expected 1Y / 3Y / 5Y infra uplift

### J. Scenario Inputs
- base_market_cagr
- bear_market_cagr
- bull_market_cagr
- custom_market_cagr
- supply_stress_adjustment
- infra_realization_adjustment
- affordability_drag_adjustment
- developer_premium_drift

---

## Output Scope

### Summary Cards
- current fair asking price
- current fair asking price range
- avg comparable benchmark
- premium / discount vs comps
- 1Y projection
- 3Y projection
- 5Y projection
- confidence score
- data completeness score
- risk score
- infra uplift score

### Detailed Panels
- factor contribution table
- comparable projects table
- infrastructure table
- sensitivity panel
- scenario assumptions panel
- price decomposition panel

### Graphs
- projection trend line chart
- bear / base / bull comparison bar chart
- factor contribution waterfall chart
- sensitivity tornado chart
- benchmark comparison chart
- infra contribution chart

---

## Pages

### Page 1. Home / Search
- search project
- start manual analysis
- view recent analyses

### Page 2. Analysis Input Page
Grouped input cards:
- project basics
- market benchmarks
- product configuration
- connectivity
- developer profile
- supply-demand
- infrastructure
- macro and scenarios

Each field must show:
- label
- short explanation
- tooltip icon
- placeholder
- unit
- validation state
- optional example
- visible default value if applicable

### Page 3. Output Dashboard
- hero summary cards
- current fair price section
- scenario outputs
- projection graphs
- factor contribution
- comparable projects
- infrastructure effect
- sensitivity / risk / confidence
- export and save

### Page 4. Compare Scenarios
- compare same project under multiple assumptions
- compare projects within same city or across cities

### Page 5. Input Glossary
For every variable:
- definition
- how to use it
- example value
- why it matters
- formula impact

---

## UX Rules
1. No field should appear without explanation.
2. Every dropdown should have helper text.
3. Every placeholder should be meaningful.
4. All outputs should be human-readable first, quantitative second.
5. Results should show ranges and confidence, not just one number.
6. Inputs should be grouped by mental model.
7. The user must be able to see what a field means, why it matters, acceptable range, and sample value.
8. Warnings should appear if data quality is weak.
9. Cards must feel premium and analytical.
10. Charts must be interactive and readable.

---

## Backend Scope
Responsibilities:
- serve dictionaries
- validate inputs
- compute fair price
- compute scenarios
- compute infra impact
- compute sensitivity
- save analyses
- export structured outputs

V1 APIs:
- GET /health
- GET /seed-status
- GET /cities
- GET /micromarkets
- GET /localities
- GET /projects
- GET /developers
- GET /variables
- GET /infrastructure-types
- POST /analyses
- POST /analyses/run
- POST /analyses/sensitivity
- GET /analyses
- GET /analyses/{id}

---

## Frontend Scope
Responsibilities:
- searchable project selection
- dynamic input rendering from variable dictionary
- grouped cards UI
- input tooltips and placeholders
- charts and tables
- scenario adjustments
- export triggers
- saved analysis navigation

Visual system:
- premium card-based design
- analytical dashboards
- interactive filters
- responsive desktop-first plus mobile support

---

## Data Model Freeze
Seed datasets:
- cities
- micromarkets
- localities
- developers
- projects
- variable_definitions
- infrastructure_projects
- scenario_profiles
- saved_analyses

---

## Formula Structure Freeze

### Current Fair Price
Current Fair Price =
Base Benchmark Price
+ Location Premium
+ Developer Premium
+ Product Premium
+ Specification Premium
+ Connectivity Premium
+ Infrastructure Premium
+ Demand Momentum Adjustment
- Supply Pressure Discount
- Risk Discount

### Future Price
Future Price(t) =
Current Fair Price ×
(1 + Market CAGR + Infra Uplift + Demand Drift + Developer Drift - Supply Drag - Affordability Drag - Risk Drag)^t

### Confidence Score
Based on:
- data completeness
- data freshness
- comparable count
- infra confidence
- assumption overrides

---

## Non-Functional Requirements
- modular code
- reusable components
- config-driven variables
- no hardcoded UI labels
- no formula logic buried in frontend
- easy city expansion
- easy variable expansion
- explainable outputs

---

## Analytics Events
- searched_project
- selected_project
- opened_manual_analysis
- edited_input
- viewed_input_help
- viewed_variable_glossary
- ran_analysis
- changed_scenario
- viewed_factor_breakdown
- viewed_infra_impact
- exported_analysis
- saved_analysis

---

## Tech Stack Freeze
Frontend:
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts
- TanStack Table

Backend:
- FastAPI
- Python 3.11
- Pydantic
- SQLAlchemy
- SQLite in V1 with Postgres-ready structure
- Pandas
- NumPy

Repo:
- monorepo

---

## Build Plan

### Step 0
- repo initialization
- monorepo creation
- tracker + README + env examples
- backend/frontend folder scaffold
- first git commit

### Step 1
- backend skeleton with full files

### Step 2
- frontend skeleton with full files

### Step 3
- seed dictionaries and model engine

### Step 4
- analysis APIs

### Step 5
- UI forms with helper text and glossary

### Step 6
- dashboard cards and graphs

### Step 7
- save/export and polish

---

## Implementation Tracker

### Step 0: Repo Initialization
Status: Pending
- [ ] create monorepo root
- [ ] initialize git
- [ ] create backend folders
- [ ] create frontend folders
- [ ] create packages/data/docs/scripts/infra folders
- [ ] create README.md
- [ ] create .gitignore
- [ ] create .env.example
- [ ] create docs/SCOPE_TRACKER.md
- [ ] first commit
- [ ] connect GitHub remote

### Step 1: Backend Skeleton
Status: Pending
- [ ] FastAPI app bootstrap
- [ ] config settings
- [ ] database setup
- [ ] base models
- [ ] route structure
- [ ] test scaffold

### Step 2: Frontend Skeleton
Status: Pending
- [ ] Next.js app setup
- [ ] Tailwind setup
- [ ] UI foundation
- [ ] app layout
- [ ] dashboard shell
- [ ] reusable card components

### Step 3: Seed Data + Model Engine
Status: Pending
- [ ] city seed data
- [ ] micromarket seed data
- [ ] locality seed data
- [ ] developer seed data
- [ ] project seed data
- [ ] variable dictionary seed data
- [ ] infra seed data
- [ ] scenario profile seed data
- [ ] calculation engine v1

### Step 4: Analysis APIs
Status: Pending
- [ ] dictionary endpoints
- [ ] create analysis endpoint
- [ ] run analysis endpoint
- [ ] sensitivity endpoint
- [ ] saved analysis endpoints

### Step 5: Input UX + Glossary
Status: Pending
- [ ] dynamic form renderer
- [ ] field-level help text
- [ ] placeholders and examples
- [ ] glossary page

### Step 6: Dashboard UI
Status: Pending
- [ ] summary cards
- [ ] projection line chart
- [ ] scenario chart
- [ ] factor contribution chart
- [ ] comparable table
- [ ] infra impact section
- [ ] sensitivity section

### Step 7: Save / Export / Polish
Status: Pending
- [ ] save analysis flow
- [ ] export JSON
- [ ] export CSV
- [ ] analytics events scaffold
- [ ] final cleanup

---

## Rules for Ongoing Implementation
- Do not assume files exist unless already created in the repo.
- Do not modify existing files without seeing the full file first.
- Always work step by step.
- Always provide full file contents, never patch snippets.
- Always keep this tracker updated after each completed step.
- Always align implementation to the frozen scope above.

---

## Implementation Progress Tracker

### Completed
- Step 0: Monorepo initialized
- Step 1: FastAPI backend foundation with config and health route
- Step 2: Next.js frontend foundation with app shell and API health integration

### In Progress
- Step 3: Database foundation and seed-ready backend models

### Pending
- SQLAlchemy setup
- Seed dictionaries
- Project dictionary APIs
- Variable dictionary APIs
- Analysis engine
- Frontend dictionary-driven forms
- Charts and dashboards
- Save/export flows

---

## Stepwise Delivery Progress

### Completed
- Step 0: Monorepo initialized
- Step 1: FastAPI backend foundation with config and health route
- Step 2: Next.js frontend foundation with dashboard shell and API health integration
- Step 3: SQLAlchemy database foundation and seed-ready core models
- Step 4: Seed ingestion and dictionary APIs

### In Progress
- Step 5: Frontend dictionary consumption and search-first analysis input shell

### Pending
- Frontend project search UI
- Frontend grouped input cards
- Variable glossary rendering
- Comparable project UX
- Pricing engine implementation
- Projection engine implementation
- Sensitivity engine implementation
- Interactive charts
- Save/export flows