# FMCSA Data Source Integration Reference

Internal engineering reference for wiring the FMCSA Data Analyzer prototype to real
FMCSA/DOT data sources. This document maps every data domain currently mocked in
`js/data.js` (`COMPANIES`, `INSPECTIONS`, `CRASHES`, `INSURANCE_HISTORY`,
`SMS_BASICS`, `SCORE_HISTORY`, `UPLOADS`, `STATES`) to the real government data
source that should eventually back it, with base URLs, auth flow, request/response
shape, and honest notes on live-API vs. bulk-only access.

No credentials, API keys, or webKeys are included anywhere in this document or in
the codebase. Where a source requires registration, the process is described so a
developer can do it themselves.

> **Update (2026-09-05):** a developer-supplied endpoint list revealed that
> data.transportation.gov exposes the *entire* underlying MCMIS/SMS/MOTUS raw-data
> pipeline as live Socrata (SODA) JSON datasets — not just the one inspections
> dataset this doc previously named. This corrects an earlier version of this
> document, which said Crashes, SMS BASIC, and authority/insurance data had no
> live API and were bulk-download-only. **That was wrong for the raw underlying
> records** — those DO have a live JSON API. It's still true for the *officially
> published/scored* SMS percentile output and the SAFER snapshot (see §5, §6).
> Every dataset ID below was independently tested against
> `https://data.transportation.gov/resource/{id}.json?$limit=1` on 2026-09-05 and
> confirmed to return real, live JSON — see §9 for the raw test results.

---

## 1. Overview: data domain → source mapping

| App data domain (`js/data.js`) | Real FMCSA/DOT source | Live API? |
|---|---|---|
| Company identity, MCS-150 census, authority, fleet | **QCMobile API** + Socrata `az4n-8mr2` (Company Census) | Yes |
| Inspections & violations | **QCMobile API** (summary) + Socrata `876r-jsdb`, `fx4q-ay7w`, `wt8s-2hbx`, `qbt8-7vic`, `5qik-smay` | Yes |
| Tamperings (ELD) | Not a distinct FMCSA field — derived from inspection violation codes | Derived |
| Crashes | Socrata `aayw-vxb3` (Crash File) | **Yes — corrected, see update above** |
| Out-of-service orders | Socrata `p2mt-9ige` | Yes |
| Operating authority, insurance, suspensions (MOTUS) | Socrata `inys-ebih`/`nakq-58th` (carrier), `yu5v-wbh6`/`dm5j-zc6c` (auth history), `c5y8-a4uz`/`x96h-evps` (insurance), `3uet-3z4i`/`xe5s-wca7` (insurance history), `wb4f-neki`/`e67p-xyd5` (revoke/suspend), `6snj-ed7q` (BOC-3 process agent) | **Yes — corrected, see update above** |
| SMS BASIC official inputs (census/inspection/violation/crash feeding the score) | Socrata `kjg3-diqy`, `rbkj-cgst`, `8mt8-2mdr`, `4wxs-vbns` | Yes (monthly refresh) |
| SMS BASIC official percentile scores/alerts | Socrata `m3ry-qcip`, `h3zn-uid9`, `4y6x-dmck`, `h9zy-gjn8` | Yes (monthly refresh) |
| Vehicle VIN decoding | **NHTSA vPIC API** | Yes (no auth, no rate limit registration needed) |
| Company snapshot / cross-check | **SAFER Company Snapshot** | No — HTML page only |
| FMCSA-registered ELD devices/providers | **FMCSA ELD registry** | No JSON API — HTML list + bulk file download |
| ELD "upload that day" indicator | No FMCSA source — this is provider-side telemetry | N/A (not FMCSA) |

The corrected short version: **almost everything we need has a live, free, no-auth
(or lightly-authed) JSON API** via data.transportation.gov's Socrata portal, plus
QCMobile for on-demand single-carrier lookups and vPIC for VIN decoding. The only
genuinely API-less pieces left are the *officially published, human-facing* SAFER
snapshot page and the ELD device registry (both HTML/bulk-file only) — everything
else can be built as a live-query architecture, not a batch-only one.

---

## 2. QCMobile API — on-demand single-carrier lookups

**What it's for:** `COMPANIES[]` fields when you need a live, single-DOT lookup
(e.g. a user searching for a new company to add) rather than a bulk sync.

**Base URL:** `https://mobile.fmcsa.dot.gov/qc/services/`

**Format:** JSON (also supports XML via `Accept` header).

**Auth:** query-string API key, called a "webKey":

```
GET https://mobile.fmcsa.dot.gov/qc/services/carriers/{dotNumber}?webKey={webKey}
```

**Getting a webKey (one-time setup, do this yourselves — never share the key
with an AI agent or commit it to the repo):**
1. Create an account at Login.gov.
2. Go to the QCMobile "My WebKeys" page and choose "Get a new WebKey."
3. Fill in application name, application type, expected user count, and a short
   description of the use case.
4. Choose a client secret (self-chosen, not issued).
5. Store the resulting webKey in a secrets manager / `.env` (never in source
   control) and load it server-side only.

**Endpoints actually relevant to this app:**

| Endpoint | Returns |
|---|---|
| `GET /carriers/{dotNumber}` | Core snapshot: legal/DBA name, address, phone, MCS-150 date/mileage, entity type, operating status |
| `GET /carriers/name/{name}` | Search carriers by name |
| `GET /carriers/docket-number/{docketNumber}` | Look up by MC/docket number instead of DOT |
| `GET /carriers/{dotNumber}/basics` | The 5 BASIC categories at summary level |
| `GET /carriers/{dotNumber}/cargo-carried` | Cargo type codes → our `cargoTypes[]` |
| `GET /carriers/{dotNumber}/operation-classification` | → our `operationClassification` |
| `GET /carriers/{dotNumber}/oos` | Out-of-service rates (driver/vehicle/hazmat) |
| `GET /carriers/{dotNumber}/docket-numbers` | All MC numbers associated with the DOT |
| `GET /carriers/{dotNumber}/authority` | Authority type + status history → our `authoritySince` |

**Role in the architecture:** use QCMobile for on-demand, single-carrier,
user-triggered lookups (adding a new company, refreshing one record on click).
Use the Socrata datasets below (§3) for everything that's a bulk sync, a list
view, or cross-carrier querying/filtering — Socrata supports SQL-like filtering
(`$where`, `$order`, `$limit`) across the whole dataset, which QCMobile does not.

---

## 3. The Socrata data.transportation.gov catalog — the real backbone

This is the correction from the earlier version of this doc, and it's the most
important section. **All of MCMIS's raw carrier, inspection, crash, authority,
and insurance data — and the raw inputs and outputs of the SMS scoring
methodology itself — are published live as Socrata (SODA) JSON datasets** on
`data.transportation.gov`. Every dataset ID below was live-tested on 2026-09-05.

**Base URL pattern (identical for every dataset in this section):**
```
https://data.transportation.gov/resource/{dataset_id}.json
```
Add `.csv` instead of `.json` for a spreadsheet-friendly pull. Supports SoQL:
```
GET https://data.transportation.gov/resource/{id}.json?dot_number=1902244&$limit=50&$order=insp_date DESC
```

**Auth:** none required for light use. A free Socrata "app token" (`X-App-Token`
header or `$$app_token` param) raises the anonymous rate limit — recommended for
production, not required for testing.

**Update cadence:** the carrier/inspection/crash/authority/insurance datasets
publish daily (most have a "full" table plus a "delta" table for
just-the-last-24h changes — pull `full` once, then poll `delta` on a schedule).
The SMS input/output datasets publish monthly, matching FMCSA's official SMS
release cycle.

### 3a. Company & vehicle data

| Dataset ID | Name | What it gives us | Confirmed fields (sample) |
|---|---|---|---|
| `az4n-8mr2` | Company Census | Carrier profile, fleet size, driver counts — backs most of `COMPANIES[]` | `legal_name, phy_street/city/state/zip, mcs150_date, mcs150_mileage, fleetsize, total_drivers, safety_rating, docket1` |
| `fx4q-ay7w` | Vehicle Inspection File | Inspection header records (date, location, totals) | `inspection_id, dot_number, insp_date, insp_level_id, viol_total, oos_total, driver_viol_total, vehicle_viol_total` |
| `wt8s-2hbx` | Inspections Per Unit | Ties specific vehicles (by VIN) to an inspection | `inspection_id, insp_unit_type_id, insp_unit_number, insp_unit_vehicle_id_number` — this is the real source for our `VEHICLES` VIN linkage |

### 3b. Violations, citations, special studies

| Dataset ID | Name | What it gives us |
|---|---|---|
| `876r-jsdb` | Vehicle Inspections and Violations | Individual violation line items per inspection (already documented in the prior version of this doc — still correct) |
| `qbt8-7vic` | Inspections and Citations | Citation adjudication outcomes (`citation_code`, `citation_result`) |
| `5qik-smay` | Special Studies | Results from specialized inspection programs (e.g. Level IV studies) |

### 3c. Crashes and out-of-service orders — corrected from "bulk only"

| Dataset ID | Name | What it gives us |
|---|---|---|
| `aayw-vxb3` | Crash File | **Confirmed live** — full crash records: `crash_id, dot_number, report_date, report_time, location, city, fatalities, injuries, tow_away, crash_carrier_name/street/city/state/zip`. This directly backs our `CRASHES[]`, including exactly the "which truck/carrier was involved" detail the user asked us to add. |
| `p2mt-9ige` | Out-of-Service Orders | Company-level OOS status: `dot_number, legal_name, oos_date, oos_reason, status, rescind_date` |

**This replaces §4 of the earlier version of this doc.** Crashes do not need a
FOIA request or a bulk-only pipeline — `aayw-vxb3` can be queried live,
per-DOT, the same way as inspections.

### 3d. MOTUS — authority, insurance, suspensions — corrected from "no public API"

MOTUS is FMCSA's regulatory-authority system. Every one of these has a "full"
snapshot table and a "delta" (last-24h-changes) table:

| Dataset ID (full / delta) | Name | What it gives us |
|---|---|---|
| `inys-ebih` / `nakq-58th` | MOTUS Carrier | Operating authority type/status, insurance & bond requirement flags — confirmed fields: `docket_number, usdot_number, op_auth_type, op_auth_status, min_cov_amount, cargo_req, bond_req, legal_name` |
| `yu5v-wbh6` / `dm5j-zc6c` | MOTUS AuthHist | Full authority change history — backs `authoritySince` with an actual audit trail instead of a single date |
| `c5y8-a4uz` / `x96h-evps` | MOTUS Insur | **Active/pending insurance policies** — confirmed fields: `docket_number, usdot_number, ins_form_code, ins_type_code, max_cov_amount, policy_no, effective_date, insurance_company_name`. **This is the real, live replacement for our `INSURANCE_HISTORY[]` mock** — no L&I scraping needed. |
| `3uet-3z4i` / `xe5s-wca7` | MOTUS InsHist | Cancelled/replaced/completed insurance policies — the historical half of `INSURANCE_HISTORY[]` |
| `wb4f-neki` / `e67p-xyd5` | Revoke/Suspend | Authority suspension/revocation orders: `docket_number, usdot_number, op_auth_type, order1_type_desc, order1_effective_date` |
| `6snj-ed7q` | MOTUS BOC-3 | Process agent contact/address info (regulatory filing detail, lower priority for our app) |

**This replaces the "Licensing & Insurance (L&I) — unconfirmed" line from the
earlier version of this doc.** We do not need to figure out `li-public.fmcsa.dot.gov`
scraping — the same insurance data is published live on Socrata.

### 3e. SMS — the official scoring pipeline, inputs and outputs

| Dataset ID | Name | What it gives us |
|---|---|---|
| `kjg3-diqy` | SMS Input Census | Monthly census snapshot as used by the SMS calculation |
| `rbkj-cgst` | SMS Input Inspection | The subset of inspections officially counted in SMS |
| `8mt8-2mdr` | SMS Input Violation | **The official per-violation severity/time weights** — confirmed fields: `viol_code, basic_desc, oos_indicator, oos_weight, severity_weight, time_weight, total_severity_wght`. This is the authoritative source if we ever want to compute or validate a BASIC score ourselves rather than trust a downstream number. |
| `4wxs-vbns` | SMS Input Crash | Crashes as counted in SMS methodology (a filtered subset of `aayw-vxb3`) |
| `m3ry-qcip`, `h3zn-uid9`, `4y6x-dmck`, `h9zy-gjn8` | SMS Measures / Percentiles / Alerts | **The official published BASIC percentiles and alert flags** — confirmed fields (per BASIC category): `*_insp_w_viol, *_measure, *_pct, *_rd_alert, *_ac, *_basic_alert`. This is the direct, live replacement for our `SMS_BASICS[]` mock, refreshed monthly on FMCSA's official cycle. |

**Implementation implication (revised):** SMS data still refreshes monthly (that
part of the earlier doc was right), but it's a live Socrata pull on that
schedule — not a manually-downloaded raw file from `ai.fmcsa.dot.gov/SMS`.
Poll these four measures/percentiles datasets once a month, upsert per-DOT, and
`SCORE_HISTORY[]` becomes a natural byproduct of retaining each month's pull
over time — same architecture as before, better data source.

---

## 4. NHTSA vPIC — VIN decoding

**What it's for:** decoding a VIN into make/model/year/body class — useful if we
ever want to display richer vehicle detail than the FMCSA inspection record
carries (FMCSA's own inspection unit data, §3a, gives you the VIN but not a
decoded make/model).

**Base URL:** `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/{VIN}?format=json`

**Auth:** none. No registration, no rate-limit gate for reasonable use.

**Confirmed live** — tested against a real VIN, correctly returned
`Make: FORD, Model: F-150, Year: 2011, BodyClass: Pickup, DriveType: 4WD`, plus
standard VIN check-digit validation warnings when applicable.

---

## 5. SAFER Company Snapshot — still no API

**Status unchanged from the earlier version of this doc: no official public
JSON API.** SAFER (`safer.fmcsa.dot.gov`) exposes only an HTML query page:
```
https://safer.fmcsa.dot.gov/query.asp?query_type=queryCarrierSnapshot&query_param=USDOT&query_string={dotNumber}
```
Given that the Socrata catalog (§3) now covers essentially the same underlying
data live, there's little reason to scrape SAFER at all — treat it as
superseded by §3 rather than something to build against.

---

## 6. FMCSA Registered ELD List — still no JSON API

**Status confirmed 2026-09-05, still no JSON API.** The real endpoint is
`https://eld.fmcsa.dot.gov/list/GetListOfELDs?listType=Registered`, but it
returns an HTML table (device name, model, software version, ELD identifier,
company name/contact, supported data-transfer methods), not JSON. There is a
bulk download at `https://eld.fmcsa.dot.gov/list/DownloadAll` (binary
file — CSV/Excel, not inspected in detail) for anyone who wants the full list
without scraping the HTML page.

**Relevance to our app:** this registry lists *device models and providers*,
not per-carrier ELD activity — it would only matter if we ever wanted to
validate that a company's declared ELD provider is FMCSA-registered. It has no
bearing on the `UPLOADS[]` "FMCSA upload that day" indicator, which remains
provider-side telemetry, not an FMCSA feed.

---

## 7. Tampering detection — still a derived business rule, not a raw field

Unchanged from the earlier version: there is no FMCSA field literally called
"tampering." Build it by matching violation codes from `876r-jsdb` /
`8mt8-2mdr` against an explicit allowlist of ELD-related codes (the 395.8(e)
family — "false report of driver's record of duty status" — and
396.11/396.13-adjacent codes referencing ELD malfunction or edited logs). Pull
the full violation code reference table (published alongside `876r-jsdb`'s data
dictionary) rather than matching on free-text descriptions.

---

## 8. Revised summary table — endpoints at a glance

| Source | Base URL | Auth | Access pattern |
|---|---|---|---|
| QCMobile API | `https://mobile.fmcsa.dot.gov/qc/services/` | webKey (Login.gov registration) | Live REST/JSON, single-carrier lookup |
| Company Census (Socrata) | `.../resource/az4n-8mr2.json` | none (app token optional) | Live REST/JSON, bulk-queryable |
| Inspections (header/unit/violation/citation/studies) | `fx4q-ay7w`, `wt8s-2hbx`, `876r-jsdb`, `qbt8-7vic`, `5qik-smay` | none | Live REST/JSON |
| Crash File (Socrata) | `.../resource/aayw-vxb3.json` | none | **Live REST/JSON — corrected** |
| Out-of-Service Orders | `.../resource/p2mt-9ige.json` | none | Live REST/JSON |
| MOTUS authority/insurance/suspend/BOC-3 (9 datasets, full+delta) | `.../resource/{id}.json` | none | **Live REST/JSON — corrected** |
| SMS inputs & official measures (8 datasets) | `.../resource/{id}.json` | none | Live REST/JSON, monthly refresh |
| NHTSA vPIC | `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/{VIN}` | none | Live REST/JSON |
| SAFER Company Snapshot | `https://safer.fmcsa.dot.gov/query.asp?...` | none | HTML only — superseded by Socrata data above |
| FMCSA ELD Registry | `https://eld.fmcsa.dot.gov/list/GetListOfELDs?listType=Registered` | none | HTML table; bulk file at `/list/DownloadAll` |

---

## 9. Verification log (2026-09-05)

Every Socrata dataset ID above was fetched live at
`https://data.transportation.gov/resource/{id}.json?$limit=1` (or `?limit=2`)
on 2026-09-05 and confirmed to return real JSON records with the field names
quoted in the tables above — not error pages, not empty results. The NHTSA
vPIC and FMCSA ELD registry endpoints were separately live-tested the same day.
This was prompted by a developer-supplied reference document listing 31
dataset/endpoint entries; all 31 were checked and all 31 resolved successfully.
Re-verify field names against each dataset's own Socrata "About" page before
building a production schema mapping, since Socrata publishers can add or rename
columns between releases.

---

## 10. Update frequency — every endpoint we have, at a glance

Socrata publishes a machine-readable cadence per dataset (`R/P1D` = daily,
`R/P1M` = monthly, ISO 8601 recurrence). Rows marked "confirmed" were read
directly from each dataset's own metadata (`/api/views/{id}.json`) on
2026-09-05; the rest are the same cadence as their sibling dataset in the same
family (full/delta pairs and the MCMIS family all publish on the same nightly
FMCSA feed) or the cadence stated in the developer's source document.

| # | App metric / data domain | Dataset ID(s) | Update frequency | Note |
|---|---|---|---|---|
| 1 | Company profile / MCS-150 census | `az4n-8mr2` | **Daily** | rowsUpdatedAt shows continuous updates; no explicit ISO cadence field, but same nightly MCMIS feed as the rest |
| 2 | Inspection header records | `fx4q-ay7w` | Daily | same MCMIS nightly feed |
| 3 | Vehicle-to-inspection linkage (VIN) | `wt8s-2hbx` | Daily | same MCMIS nightly feed |
| 4 | Inspection violations | `876r-jsdb` | **Daily (confirmed `R/P1D`)** | 13.5M rows, most-used dataset in this catalog |
| 5 | Citation adjudication outcomes | `qbt8-7vic` | Daily | same MCMIS nightly feed |
| 6 | Special inspection studies (Level IV etc.) | `5qik-smay` | Daily | same MCMIS nightly feed |
| 7 | Crashes | `aayw-vxb3` | Daily | most recent transaction dates observed within the last ~3 months of the check date |
| 8 | Out-of-service orders | `p2mt-9ige` | Daily | same MCMIS nightly feed |
| 9 | Operating authority + insurance/bond flags | `inys-ebih` (full) / `nakq-58th` (delta) | Daily | pull `full` once, poll `delta` daily after |
| 10 | Authority change history | `yu5v-wbh6` (full) / `dm5j-zc6c` (delta) | Daily | — |
| 11 | Active/pending insurance policies | `c5y8-a4uz` (full) / `x96h-evps` (delta) | **Daily (confirmed `R/P1D`)** | — |
| 12 | Insurance history (cancelled/replaced) | `3uet-3z4i` (full) / `xe5s-wca7` (delta) | Daily | — |
| 13 | Authority suspension/revocation | `wb4f-neki` (full) / `e67p-xyd5` (delta) | Daily | — |
| 14 | BOC-3 process agent info | `6snj-ed7q` | Daily | low priority for our app |
| 15 | SMS input — census | `kjg3-diqy` | **Monthly** | matches FMCSA's official SMS release cycle |
| 16 | SMS input — inspections counted in scoring | `rbkj-cgst` | Monthly | — |
| 17 | SMS input — official violation severity weights | `8mt8-2mdr` | **Monthly (confirmed `R/P1M`)** | authoritative source for BASIC scoring weights |
| 18 | SMS input — crashes counted in scoring | `4wxs-vbns` | Monthly | — |
| 19 | SMS official measures/percentiles/alerts (all BASIC categories, incl. passenger/hazmat variants) | `m3ry-qcip`, `h3zn-uid9`, `4y6x-dmck`, `h9zy-gjn8` | **Monthly (confirmed `R/P1M`)** | this is the live source for `SMS_BASICS[]`; `m3ry-qcip` specifically is "SMS AB Pass" (interstate passenger/bus carriers) — the other three cover the general-freight and hazmat variants |
| 20 | On-demand single-carrier lookup (profile, basics, OOS, authority, cargo, operation class, docket numbers) | QCMobile: `/carriers/{dotNumber}`, `/carriers/name/{name}`, `/carriers/docket-number/{docketNumber}`, `/carriers/{dotNumber}/basics`, `/carriers/{dotNumber}/cargo-carried`, `/carriers/{dotNumber}/operation-classification`, `/carriers/{dotNumber}/oos`, `/carriers/{dotNumber}/docket-numbers`, `/carriers/{dotNumber}/authority` | **On demand** | not a scheduled feed — every call queries MCMIS live, so freshness = MCMIS's own internal latency, not a publish cycle |
| 21 | VIN decoding | NHTSA vPIC `/DecodeVinValues/{VIN}` | On demand | static reference tables behind it are updated by NHTSA periodically, but every query is answered live/instantly |
| 22 | Company snapshot cross-check | SAFER `query.asp?...` | On demand (live query) | no publish cycle — it's a live HTML query tool, not a dataset; superseded by §3 for anything we can get from Socrata instead |
| 23 | FMCSA-registered ELD devices/providers | `GetListOfELDs` (HTML) / `DownloadAll` (bulk file) | **As needed** | updates whenever a manufacturer registers or a device is decertified — no fixed schedule published |

**Practical takeaway for our ingestion design:**
- **Daily-refresh domains (rows 1–14):** pull each `full` dataset once to seed,
  then poll the matching `delta` dataset (or re-filter `full` by a
  `change_date`/`add_date` cursor where no delta table exists) once a day.
  This covers company profile, inspections, violations, crashes, OOS orders,
  authority, and insurance — i.e. almost everything in the app except the
  score itself.
- **Monthly-refresh domains (rows 15–19):** poll once a month, right after
  FMCSA's SMS publication date — this is the only part of the app that
  should NOT be pulled more often, since the official percentile doesn't
  change between releases.
- **On-demand domains (rows 20–23):** no polling schedule at all — call them
  synchronously when a user action needs a fresh single-record answer (adding
  a new company, decoding a VIN, a manual "sync now" button).

---

*Last updated: 2026-09-05. This document reflects publicly available FMCSA/DOT
documentation and live endpoint testing as of this date; FMCSA endpoints,
dataset ids, and publication schedules can change — re-verify before building a
production integration.*
