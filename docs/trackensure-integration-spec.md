# Trackensure Integration Spec — final reference for the ETL build

This is the consolidated, actionable spec for building the Trackensure → our
Postgres ETL. It supersedes the original "what we know + open questions"
brief and `trackensure-api-answers.md` as the thing to hand a developer or a
coding agent — those two files are kept as the research trail (who asked
what, when, and why), but everything a build needs should be here in one
place. Where something is still genuinely unconfirmed, it's marked
**OPEN** rather than guessed at.

No credentials, cookies, or tokens appear anywhere in this document or were
ever handled by the AI that produced it — see "Security" at the end.

---

## 1. What this integration is for

Our own FMCSA compliance dashboard needs three things Trackensure — and only
Trackensure — can provide (everything else, inspections/violations/crashes/
authority/insurance/SMS scores, comes from public FMCSA/DOT open data; see
`fmcsa-api-integration.md`):

1. **The watchlist** — which carriers we track, keyed by DOT number, plus
   which ELD brand ("provider") each uses and whether they're active.
2. **Support tickets** per carrier (Trackensure calls these "support tasks").
3. **The ELD → FMCSA data-export log** — did a carrier's driver actually
   transfer ELD data to FMCSA, and when (Trackensure calls these "prevented
   data exports," which is a legacy/confusing name — see §5).

Everything below is either what the brief's original captured samples showed,
or what was confirmed live against `trackensure.com` in a browser session on
2026-09-05 (logged in as an existing Trackensure admin user, no credentials
ever passed through the AI — see "Security").

---

## 2. Auth & operating constraints (decided)

- **Base URL:** `https://trackensure.com`. Session-cookie auth
  (`JSESSIONID`) via `POST /auth?actionName=login`; every other call reuses
  the cookie. `clubeld.com` is the same backend for another ELD brand.
- **No service account, no IP allow-listing.** Confirmed not available. The
  ETL runs under a personal Trackensure login. Build in throttling by
  default — a fixed 2–5s delay between requests, exponential backoff on any
  429/403/CAPTCHA-shaped response — and be ready to fall back to a rotating
  proxy / fingerprint rotation (what the prior full scrape needed) if a
  fixed IP with a real login still gets flagged. Log every throttle/block
  event; there's no published rate limit to target, so the safe rate has to
  be found empirically and revisited over time.
- **Session lifetime unknown (OPEN).** Design for a disposable cookie:
  re-login at the start of every ETL run, re-login-and-retry once on any
  401/403 mid-run. Don't try to persist a session across runs.
- **The "API" support-service-type tag is unrelated to an integration API.**
  It's a per-*customer* flag ("this carrier has Trackensure's API product"),
  not a token-based endpoint for us. The brief separately mentions an
  official/token API that's "broken" — what specifically is broken about it
  is still **OPEN**; worth a direct question before writing it off entirely,
  since "broken" could mean anything from "wrong data" to "fully
  decommissioned."
- **Operational risk to flag, not block on:** a personal account backing a
  production pipeline breaks if that person's access changes. Worth
  revisiting the service-account ask periodically.

---

## 3. Canonical value lists (confirmed live, 2026-09-05)

These replace any partial/inferred lists from the original brief.

**ELD brands (`eldType`), from `GET /app-admin/ecosystem/server?actionName=getELDTypes`
— 17 total, not the ~7 originally observed:**

| `eldType` | Label |
|---|---|
| `teeld` | TrackEnsure ELD |
| `alfaeld` | Alfa ELD |
| `vistaeld` | Vista ELD |
| `swifteld` | Swift ELD |
| `driverbookeld` | DriverBook ELD |
| `protrackingeld` | ProTracking ELD |
| `sharpeld` | Sharp ELD |
| `uskoeld` | Smart eLog |
| `tripeld` | Trip ELD |
| `wheelseld` | Wheels eLog |
| `ambereld` | Amber ELD |
| `sprinteld` | Sprint ELD |
| `phantomeld` | Phantom ELD |
| `vectoreld` | Vector ELD |
| `orioneld` | Orion ELD |
| `twentyfourhoseld` | 24HOS ELD |
| `interstateeld` | Interstate ELD |

Use this list (not a hand-maintained guess) anywhere the ETL needs to
enumerate brands — e.g. calling `filterOrganizationsForAdminDashboard` once
per brand if an unfiltered call turns out not to return everything (§4).

**Account service tags (`supportServiceTypeList[].supportServiceType`), from
`GET /organization?actionName=getSupportServiceTypesList` — 17 total:**

`Debitor, Priority Company, Safety Service Company, Fleet Editor Company, OTH
Company, Violator Company, Audit Company, Banned Company, Personal Safety
Service, Personal Monitoring Service, Safety for Extra Services Approved,
Trigger, API, Clear ELD, Partnership Terminated, Truck/Trailer Links, Safety
Quality Control`

**Our "client" flag = presence of `"Safety for Extra Services Approved"` in
this list (confirmed by Devorius).** `Violator Company` and `Banned Company`
are also in this vocabulary — not wired into our data model yet, but worth
keeping in mind if a future feature wants a risk/standing flag beyond
score-based risk.

---

## 4. Watchlist (organizations)

**List call:** `POST /organization?actionName=filterOrganizationsForAdminDashboard`
Body: `{"active":"Y","eldType":"teeld","organizationName":"","expMark":""}`

- Filtering behavior: `active` is a real server-side filter (confirmed by
  the request shape) — pull `"Y"` and `"N"` separately and union by
  `organizationId` to get everything, rather than assuming omission works.
- `eldType` reads as an "any of" match against an org's brand list, not an
  exclusive filter (an org filtered under `"teeld"` came back with brands
  `["vistaeld","teeld"]`) — to get every org regardless of brand, call once
  per brand in the table above and merge by `organizationId`, or test
  omitting the key first.
- **Authoritative active flag:** `account.active` on this list endpoint.
  `getGeneralInfo.active` (the profile endpoint, §4b) is presumed to be the
  same underlying value — diff the two for a few orgs before trusting that
  assumption in production.
- **Exclude `organizationId == 4`** ("Titan Technologies Inc.") from the
  watchlist — confirmed live to be Trackensure's own internal/aggregate org,
  not a real carrier (its support tasks show `targetType: "internal"`, see
  §5). More generally, prefer filtering by `targetType` where it's present
  on a record (tickets) over hardcoding org IDs, since it's a real field
  meant for exactly this distinction.
- **New account-level fields worth capturing** (not in the original brief):
  `subscriptionType` (e.g. `"stripe"`), `referralCode`, `billingAddressId`,
  `primaryUserId`, `createDate` (the org's real registration date — useful
  as a "customer since" field).
- **Audit status is a real, live field:** `organizationDTO.hasActiveAudit`
  (boolean) appears on the org object across multiple endpoints (list,
  ticket, export). There is also a dedicated Trackensure "Audit" module
  (`organizationAudit?actionName=getOrganizationAuditOverdueDeadlineCount` /
  `...OverduePauseCount`, and a full UI section) — **not explored further at
  Devorius's request** (not something he currently needs surfaced, and the
  module wasn't self-explanatory enough to reverse-engineer from the outside
  without walking through it together). If audit status becomes a feature
  later, `hasActiveAudit` alone is enough to start with; the fuller
  `organizationAudit` endpoint family is there if more detail is wanted.
- There is also a **"Blacklist Board"** nav section (`#/blacklist`) —
  likewise not explored. Flagging its existence in case a future "banned/
  flagged carrier" feature wants it; no data shape captured.

**Profile call:** `GET /fleet/companyProfile?actionName=getGeneralInfo&orgId=<id>`
— unchanged from the original brief (address, mc number, contact, etc.).
**Do not store** `aclUsers[].password`/`salt` or `additionalContact` — see
§7.

---

## 5. Tickets (support tasks = carrier support requests)

**Call:** `POST /supportTask?actionName=getSupportTaskListLTByFilterAndPageNumber`
(page 1), then `...ByFilterLT` for later pages, filterable by `orgId`.

- **`targetType` field: `"client"` vs `"internal"`.** Use this to exclude
  Trackensure's own internal/organizational tasks (org 4's tasks all show
  `targetType: "internal"`) — this is a cleaner filter than an org-ID
  denylist, and generalizes if there are other internal-only orgs we haven't
  seen yet.
- **`requestType` — expanded set, confirmed live in addition to the
  brief's list:** `special_request, lock_data, organizational_task,
  audit_photoshop_work, path_planner_log_editing` (plus everything already
  in the brief). Treat the requestType vocabulary as open-ended — new values
  can appear — rather than a fixed enum to validate against.
- Suggested label map and carrier-facing/ops-internal split: unchanged from
  `trackensure-api-answers.md` §11–12 — still a draft for Devorius to sanity
  check against the real business meaning of each type when he has time, not
  a blocker for a first build.
- Default list order in a real pull was **not a clean single-field sort**
  (task IDs came back as 10357159, 10357139, 10357113, 10356424, 10355917,
  10355751, 10357047 — not monotonic) — likely sorted by some combination of
  status/pinned/priority rather than plain `createDate` or `taskId`
  descending. **OPEN**: don't rely on response order; sort client-side by
  `createDate` after pulling.
- `getSupportTaskBannerData` (small stats endpoint) returns
  `{unfinishedSupportTaskCount, availableSupportTaskCount, nextAlertDate,
  transferredSupportTaskCount}` — cheap to poll for an "open tickets" tile
  without pulling the full list.

---

## 6. TE-handled roadside inspections (`supportTaskTicket`) — merge with FMCSA data

**Decision (confirmed by Devorius): merge into one unified inspections view**,
not a separate tab.

**Call:** `POST /supportTaskTicket?actionName=getSupportTaskTicketListWithRequiredSize`

- The live "Ticket" UI screen has an **Organization filter field**
  (`name/id/dot/mc`) even though the brief's captured request body showed no
  `orgId`/filter parameter. This means the endpoint almost certainly accepts
  an org-scoping parameter that wasn't captured in the one sample body we
  have — **OPEN**: the exact parameter name needs to be captured from a real
  filtered search (type an org into that field, watch the resulting request
  body) before the ETL can pull per-carrier instead of one giant unfiltered
  pull.
- Confirmed default sort **is** clean here: results came back strictly
  descending by `ticketId` (17508, 17503, 17502, 17490, ...), which also
  tracks `createDate` descending.
- Total record count observed: **358** at test time — small enough that a
  full pull is fine even before the org-filter parameter is confirmed.
- **Join strategy for the merge:** `organizationDTO.usdotNumber` +
  `inspectionDate` (+ ideally `inspectionLocation`/state, since a carrier can
  have more than one inspection on the same day) against the FMCSA
  inspection datasets (`876r-jsdb`/`fx4q-ay7w` — see
  `fmcsa-api-integration.md`). Enrich the matched FMCSA inspection row with
  TE's extra fields (`patrol`, `inspectorName`, `inspectorBadge`,
  `ticketDetails`, `supportTaskTicketSolutionDTO`) when a match exists; where
  no FMCSA record matches yet (publish-cycle lag), show the TE ticket
  standalone with a "pending federal record" indicator rather than dropping
  it.
- `currentLetterType` and `supportTaskTicketSolutionDTO` are still **OPEN**
  — every sample seen so far has them `null`; their shape will need to come
  from a record that actually has a resolution letter attached.

---

## 7. Uploads (`preventedDataExport` — ELD → FMCSA transfer log)

**Call:** `POST /preventedDataExport?actionName=getPreventedDataExportListWithRequiredSize`

- **`status`/`state` meaning — confirmed by Devorius:**
  `status` = whether the export itself succeeded (`"success"` = the data
  actually reached FMCSA). `state` = whether a Trackensure support agent has
  processed/reviewed that record (`"unprocessed"` = not yet reviewed by
  staff) — an internal workflow flag, unrelated to FMCSA delivery.
  **"Did this carrier's ELD data reach FMCSA on date X" = `status ==
  "success"` alone; ignore `state` for that purpose.**
- **`dataExportType` is NOT always `"FMCSA"` — confirmed live.** A real
  record came back with `dataExportType: "HOS"` (a hours-of-service export,
  unrelated to the FMCSA-transfer feature). **The ETL must filter
  `dataExportType == "FMCSA"` explicitly** — this isn't defensive
  over-caution, it's a real, observed value that would otherwise pollute the
  "uploaded to FMCSA" signal.
- **`exportMethod` is NOT always `"web-service"` — confirmed live.** A real
  record came back with `exportMethod: "email"` (`reason: "Unloading to
  Email (Personal)"`). Keep `exportMethod` as a data-quality/context field;
  it's not yet clear whether non-`"web-service"` methods should count toward
  "the driver transferred ELD data to FMCSA," since an email export could be
  a personal/manual copy rather than the official FMCSA web-service
  transfer — **OPEN**, worth confirming which `exportMethod` values actually
  count as a real FMCSA transfer versus a side-channel copy.
- **Volume is large: 601,526 total records observed.** This is not a table
  to full-pull on every run — window by `createDate`/`exportDateFrom` and
  keep a rolling incremental pull, not a periodic full re-scan.
- Like the ticket screen, the live "Transferred Data" UI has Organization /
  Driver / Status / Type / Method / State / Provider filter fields — the
  exact request parameter names for these are **OPEN** (same caveat as §6:
  need to watch a real filtered request to capture them) but their existence
  strongly suggests server-side filtering is supported beyond what the
  brief's one sample body showed.

---

## 8. Ingest strategy

- **Bootstrap:** the existing bulk snapshot (`all_companies.json`,
  `all_tickets.jsonl`, etc.) is **a few months old** (confirmed by
  Devorius) — use it to backfill ticket/export history so the dashboard
  doesn't launch with empty history, but do a **fresh full
  `organization` + `driver` pull** before going live rather than trusting
  the snapshot's org list, active flags, or ELD-brand mapping.
- **Incremental pulls:** `supportTask` and `preventedDataExport` both expose
  a `dateFrom`/`dateTo` window, which filters on *creation* date, not
  `updateDate` — a support task whose `status` changes after creation won't
  be caught by narrowing to "since last run" alone. Pull new records by
  `createDate` window each run, *and* separately re-poll a rolling recent
  window (30–60 days) to catch status changes on already-ingested rows.
  `organization`/`driver` show no date filter at all in their documented
  bodies — treat those as full-repull-and-diff by design.
- **History depth:** rather than an arbitrary Trackensure-side window,
  match FMCSA's own SMS lookback (roughly 24 months for
  inspections/violations, somewhat longer for crashes) so the
  Trackensure-side and federal-side history in the same dashboard cover
  comparable timeframes.

---

## 9. Security & PII — what NOT to persist

Reaffirmed and **expanded** after live testing turned up more of this than
the original brief showed:

- **Never persist:** `aclUsers[].password`/`salt` (bcrypt hashes on the org
  profile), `driver.opentextPassword` (plaintext driver passwords).
- **Newly confirmed to also avoid:** `contactDTO.additionalContact` and the
  main `contact.additionalContact` field routinely contain free-text internal
  notes with other people's personal phone numbers and internal call-routing
  instructions (in Ukrainian/Russian, e.g. "call this number first, this one
  is backup, don't call after hours unless urgent") — this is staff/contact
  PII that has nothing to do with carrier compliance data and should never
  reach our database. Likewise `driverProfileDTO.driverMark.note` and
  `.salesNote` carry internal sales/support commentary about individual
  drivers (attendance notes, pricing notes) — also out of scope for a
  compliance dashboard and should be excluded even though they ride along on
  records we do want (tickets, exports, driver profiles).
- **General rule:** when pulling any DTO that nests `contactDTO`,
  `driverProfileDTO`, or `aclUsers`, allowlist the specific fields we
  actually use (name, DOT, provider, dates, statuses) rather than persisting
  the DTO wholesale — these nested objects consistently carry more PII than
  the field names alone suggest.
- **No credentials of any kind were requested, received, or used by the AI
  that produced this document.** All live findings in §3–§7 came from
  Devorius's own logged-in browser session, observed read-only (page loads,
  network requests, one UI search) — no login form was touched, no
  destructive/mutating action was taken (per the brief's own §2.8 note that
  mutating endpoints like `updateMonitoringServiceDriverAssignedUsersByIds`
  should never be called by this integration's read path), and the two
  additional admin sections that came up in navigation (Audit, Blacklist
  Board) were left unexplored at Devorius's request rather than clicked into
  speculatively.

---

## 10. Summary of what's still OPEN

Everything else in this document is either confirmed live or a settled
product decision. What's left, roughly in priority order for whoever picks
this up next:

1. Exact request parameter names for org-scoped filtering on
   `supportTaskTicket` and `preventedDataExport` (the UI has the fields; the
   captured sample bodies don't show them) — capture from a real filtered
   search in the browser.
2. Which `exportMethod` values should count as "the carrier transferred data
   to FMCSA" versus a side-channel/manual copy.
3. Session TTL and safe request rate — both need empirical measurement
   against the live system.
4. What's specifically broken about the official/token API mentioned in the
   original brief.
5. `currentLetterType` / `supportTaskTicketSolutionDTO` shape, once a record
   with a populated value turns up.
6. Final review of the carrier-facing-vs-ops-internal `requestType` split
   (§5) — a draft exists, not yet signed off.
7. `monitoringService` PMS scope (all monitored drivers vs. only
   PMS-subscribed orgs) and a reference table for its violation `type`
   codes.

---

*Compiled 2026-09-05 from the original brief, the answers session with
Devorius, and a live read-only browsing session against trackensure.com
(Support Dashboard, Ticket, Transferred Data, and Customers screens). See
`trackensure-api-answers.md` for the full question-by-question research
trail this spec was distilled from.*
