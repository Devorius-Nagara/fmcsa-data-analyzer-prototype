# Answers to "Trackensure API — what we know + open questions"

## Decisions confirmed by Devorius (2026-09-05)

Five of the open items below were product/operational decisions or internal
facts only he could confirm. Resolved:

- **Q14 — `status`/`state` on prevented-data-export rows:** `status` = whether
  the export itself succeeded (`"success"` = data actually reached FMCSA).
  `state` = whether a Trackensure support agent has processed/reviewed that
  record (`"unprocessed"` = not yet reviewed by staff) — an internal workflow
  flag, unrelated to FMCSA delivery. **"Did this carrier's ELD data reach
  FMCSA on date X" = `status == "success"` alone; ignore `state` for that
  purpose.**

- **Q9 — "client" flag:** `supportServiceTypeList` contains `"Safety for
  Extra Services Approved"`. A client is an org that pays for the higher
  safety-service tier, not just any active/watchlisted org.
- **Q18 — bulk dump freshness:** the existing snapshot (`all_companies.json`,
  `all_tickets.jsonl`, etc.) is **a few months old** — treat it as a
  reasonable seed for history/backfill (support tasks, old tickets) but
  **do not trust it for current org/driver state**. Do a fresh full
  `organization` + `driver` pull before going live rather than bootstrapping
  live data from that file.
- **Q3 — service account / IP allow-listing:** **not available.** The ETL
  will run under a personal Trackensure login with throttling, the same way
  the prior scrape did (2–5s cooldown; may still need the rotating
  proxy/fingerprint approach if a fixed IP + personal account still gets
  flagged). This is a real operational risk worth flagging explicitly: a
  personal account backing a production data pipeline breaks if that person's
  access is revoked or their password changes, and ties an automated system's
  audit trail to one human's login. Worth revisiting the service-account ask
  periodically even though the answer is "no" for now — it's an ops
  conversation, not a closed door.
- **Q16 — TE roadside-inspection tickets:** **merge, don't silo.** The
  `supportTaskTicket` records (patrol, inspector, badge, TE's own notes)
  should be combined with the public FMCSA inspection records into a single
  unified inspections view per carrier, rather than a separate tab. Practical
  join key: `usdotNumber` (on `organizationDTO`) + `inspectionDate` — match a
  `supportTaskTicket` row to the FMCSA `876r-jsdb`/`fx4q-ay7w` inspection
  record for the same DOT on the same date (and ideally the same
  `inspectionLocation`/state, since a carrier can have more than one
  inspection on a single day), and enrich that inspection's row with TE's
  extra fields when a match exists, rather than listing FMCSA and TE
  inspections as two separate lists. Where no FMCSA record matches yet (e.g.
  data lag between the incident and FMCSA's publish cycle), show the TE
  ticket standalone with a "pending federal record" indicator instead of
  dropping it.

---


This responds to the open-questions brief (§5) the other agent produced after
being handed the Trackensure API notes. I do not have Trackensure credentials
and will not obtain or use any (see the security note at the end) — nothing
here comes from a live call to trackensure.com. Everything below is derived
from re-reading the brief's own data samples for internal consistency, plus
general API/ETL-design judgment. Items I genuinely cannot answer without
either live testing against the real system or an insider's product decision
are marked **NEEDS CONFIRMATION** — several of those are asked back to Devorius
directly at the end.

---

## Auth & access

**1. Service account.**
Recommended regardless of feasibility: a dedicated, low-privilege service
account (not a personal login) — separate audit trail, revocable
independently of any one employee's access, and it survives that employee
leaving. Whether Trackensure's admin panel supports creating a
scoped/read-only role, or only full-admin accounts, is **NEEDS
CONFIRMATION** — ask whoever administers trackensure.com user accounts.

**2. Session lifetime.**
**NEEDS CONFIRMATION** — nothing in the brief states a TTL, and it can only be
measured empirically (log in, poll a cheap endpoint every few minutes until it
401s, record the duration). Regardless of the measured number, the ETL should
be built to treat the cookie as disposable: re-login at the start of every run
rather than trying to persist/reuse a session across runs, and re-login-and-
retry once on any 401/403 mid-run.

**3. Rate limits / IP allow-listing.**
**Confirmed: not available.** No service account or IP allow-list — the ETL
runs under a personal login with throttling, same as the prior scrape. Design
it to be polite by default (a fixed 2–5s delay between requests, exponential
backoff on any 429/403/CAPTCHA-shaped response) and be ready to fall back to
the same rotating-proxy/fingerprint approach the earlier scrape needed if a
fixed IP alone still gets flagged even with a real login. No published rate
number exists to target — treat "still getting through without a block" as
the only signal available, and log every throttle/block event so the delay
can be tuned empirically over time rather than guessed once and left alone.

**4. The "API" support-service-type entry.**
**NEEDS CONFIRMATION** — this is metadata about what a specific *carrier org*
subscribes to ("this customer has Trackensure's API product enabled"), not a
description of an admin/internal API for us to call. It's a different thing
from the "official/token API" the brief mentions is reportedly broken. Worth
asking directly: is there documentation for that token API at all, and if so,
what specifically is broken about it (wrong data, missing endpoints, stale
values) — "broken" covering three very different problems.

---

## Watchlist / organizations

**5. Get all orgs, and the authoritative active flag.**
The request body's own `"active":"Y"` parameter strongly implies server-side
filtering (why else would it be a request parameter rather than always
returning everything). Two safe approaches, in order of preference: (a) try
omitting the `active` key entirely and see if the server treats that as "no
filter" — cheapest if it works; (b) if the server requires the key, call once
with `"Y"` and once with `"N"` and union the results by `organizationId`. On
which field is authoritative: `account.active` (from the
`filterOrganizationsForAdminDashboard` list endpoint, which is explicitly
filterable on it) is the more likely candidate for "the" flag, since
`getGeneralInfo.active` is probably just the same underlying database column
surfaced on a different endpoint — but whether they can ever disagree (e.g. a
caching lag between the two endpoints) is **NEEDS CONFIRMATION**: pull both
for the same org and diff.

**6. `eldType` in the request body.**
Based on the sample, org `8740` carries brands `["vistaeld","teeld"]` in
`eldTypeMapByOrganization` while the request that returned it filtered on
`"eldType":"teeld"` — so the filter reads as "org has this brand among its
brands" (an "any of" match), not "org's only brand is this." To get every
organization regardless of brand: first try omitting `eldType` (or passing an
empty string) and compare the returned count to the sum of per-brand calls; if
omitting doesn't return the full set, call once per known brand
(`teeld, alfaeld, vistaeld, sharpeld, wheelseld, swifteld, ambereld`, plus any
brand not yet seen) and merge by `organizationId`, since a brand list built
from observed samples can't be proven exhaustive without asking directly.

**7. Which brand is "primary."**
Nothing in the sample indicates the array order is meaningful (it could just
be insertion order from a `Set`, which is not guaranteed stable) —
**NEEDS CONFIRMATION**. A more robust proxy: pull `/fleet/driver` for the org
and take the plurality `eldType` across its drivers as "primary," since that
reflects what's actually in use rather than a possibly-arbitrary list
position. Org id `"4"` mapping to *every* brand looks like an internal
aggregate/test record and is reasonable to hardcode-exclude, but ask whether
there's a canonical list of internal/test org IDs to exclude instead of
guessing from one observed anomaly.

**8. Missing DOT.**
Count is unknowable without a live pull. Architecturally: keep
`usdotNumber` nullable in our schema, key those orgs on Trackensure's own
`organizationId` internally, and simply exclude them from any FMCSA-side join
until a DOT appears. `mcNumber` is not a substitute key for the FMCSA/Socrata
side — those federal datasets key on `dot_number`/`usdot_number`, not MC
number — so it stays a display-only field for us, not a join key. DOT-less
orgs are plausibly brokers or non-`fleet-management` business types (only
motor carriers are required to hold a USDOT number), which fits the
`businessType` field already present in the sample.

**9. The "client" flag.**
**Confirmed:** `supportServiceTypeList` contains `"Safety for Extra Services
Approved"`. Implementation note: this is an array, so check for membership
(`supportServiceTypeList.some(s => s.supportServiceType === "Safety for Extra
Services Approved")`), not equality against a single field — and confirm
whether that tag can appear in `inactiveSupportServiceTypeList` too (seen on
the `getGeneralInfo` profile shape in §2.2) for an org that *used to* be a
paying client but no longer is; if so, "client" should check the active list
only, not either list.

---

## Tickets (support tasks)

**10. Right feed — confirmed by the brief's own text.** `supportTask`,
filtered by `orgId`, is the carrier-support-request feed;
`supportTaskTicket` is the separate roadside-inspection-ticket log (§2.5 says
so explicitly, and it has no `orgId` filter, which fits "TE's own internal
log," not "requests this specific carrier raised"). No live test needed to
confirm this — it's just internally consistent with how the brief already
describes both endpoints.

**11. Subject / humanizing `requestType`.**
Reasonable, and doesn't need to wait on a canonical label map from Trackensure
— it's purely a display concern for our UI. Draft mapping (labels ours, not
Trackensure's):

| `requestType` | Suggested label |
|---|---|
| `log_editing` | Log editing |
| `mobile_assistance` | Mobile assistance |
| `web_assistance` | Web assistance |
| `fleet_editor_assistance` | Fleet editor assistance |
| `troubleshooting` | Troubleshooting |
| `ifta_service` | IFTA service |
| `pms` | Monitoring service (PMS) |
| `special_request` | Special request |
| `time_is_running_out` | HOS time running out |
| `path_planner_log_editing` | Path planner log editing |
| `out_of_range` | Out of range |
| `transferred_data` | Data transfer |
| `custom_request` | Custom request |
| `consultation` | Consultation |
| `ticket` | General ticket |
| `firmware_update` | Firmware update |
| `complain` | Complaint |
| `transaction_check` | Transaction check |
| `lock_data` | Data lock |
| `audit` | Audit |

**12. Which `requestType`s are carrier-facing vs. ops-internal.**
This is a judgment call to confirm, not a fact to look up — proposed split
below, flagged for review rather than treated as settled:

- **Keep (carrier-facing support):** `log_editing, pms, special_request,
  time_is_running_out, path_planner_log_editing, out_of_range,
  mobile_assistance, transferred_data, custom_request, consultation, ticket,
  firmware_update, web_assistance, ifta_service, fleet_editor_assistance,
  troubleshooting, transaction_check, lock_data, complain`
- **Drop (ops-internal):** `api_key, create_update_payment_account, audit`
  (account/billing/compliance-review housekeeping, not something a carrier
  asked for)

Open/closed mapping as proposed in the brief looks right to me too: open =
`{in_progress, on_pause, transfer}`, closed = `{completed, canceled,
no_charge}`.

---

## Uploads (prevented data exports)

**13. Confirm the call.**
As documented, the body shown (`commentByLike, pageNumber, limitOnPage,
paginationStartId`) has no `orgId` or `dateFrom` field — so, as far as the
brief's own sample shows, it is one big paginated pull with no per-org filter,
same shape as the ticket feed. Sort order (by `dataExportId` descending,
`createDate` descending, or something else) is **NEEDS CONFIRMATION** — not
determinable from a single sample row.

**14. What a row actually means — confirmed by Devorius.** `status` = whether
the export itself succeeded (`"success"` = the ELD data actually transferred
to FMCSA). `state` = whether a Trackensure support agent has processed/
reviewed that export record (`"unprocessed"` = not yet reviewed by staff — an
internal workflow flag, unrelated to whether FMCSA received the data). So
"did this carrier's ELD data reach FMCSA on date X" should be driven by
`status == "success"` alone; `state` should be ignored for that purpose and
is only relevant if we ever want to show Trackensure's own review/backlog
status as a separate signal. (The original draft of this document guessed
this same split from the field names alone before it was confirmed — noted
here since it's exactly the kind of thing that's cheap to get wrong silently
if left as a guess.)

**15. `dataExportType` / `exportMethod`.**
Only `"FMCSA"` appears in the one sample shown — can't rule out other values
without a full pull. Build the ETL to filter `dataExportType == "FMCSA"`
explicitly (defensively) rather than assuming it's the only value that will
ever appear. `exportMethod: "web-service"` is plausibly one of several
transfer methods (vs. e.g. USB/manual) and worth keeping as a data-quality
signal, but nothing suggests it should be filtered on unless told otherwise.

---

## Inspections

**16. Surfacing `supportTaskTicket` as a TE-handled-inspections view.**
**Confirmed: merge into one unified inspections view** rather than a separate
tab — see the join strategy (DOT + date, fall back to a standalone
"pending federal record" row) in the decisions section at the top of this
document. `currentLetterType` and `supportTaskTicketSolutionDTO` are still
**NEEDS CONFIRMATION** — no sample shows a populated value for either, so
their shape/meaning can't be inferred from the brief as given, and they'll
matter once real data is pulled to build the merge logic (e.g. if
`supportTaskTicketSolutionDTO` contains a canned resolution letter worth
surfacing alongside the merged inspection record).

---

## Monitoring / PMS

**17. `monitoringService`.**
(a) `syncDate` reading as "driver's last ELD sync time" fits both the field
name and its position in the payload — plausible, not proven.
(b) No reference table for violation `type` codes exists in the brief; that's
**NEEDS CONFIRMATION** directly from Trackensure — guessing at codes like
`cr34` or `dot_os_ws` from the name alone risks getting compliance-facing
logic wrong.
(c) Whether it returns only PMS-subscribed drivers or all monitored drivers:
given the product is literally named "Monitoring Service (PMS)," the more
likely reading is "only orgs subscribed to that specific product," but this
is **NEEDS CONFIRMATION**.

---

## Ingest strategy

**18. Bootstrap from the existing bulk snapshot.**
**Confirmed: a few months old.** Use it for what doesn't need to be current —
backfilling `supportTask`/`supportTaskTicket` history so we're not starting
the dashboard with zero ticket history — but do a fresh full
`organization` + `driver` pull before going live rather than trusting the
snapshot's org list/active-flags/ELD-brand mapping, since a few months is
long enough for carriers to churn, change ELD brand, or flip active/inactive.
Treat the old dump as historical seed data, the fresh pull as the actual
source of current watchlist state.

**19. Incremental / delta support.**
Reading the shown request bodies literally: `supportTask` and
`preventedDataExport` both expose a `dateFrom`/`dateTo` window, which filters
on *creation* date, not on `updateDate` — so a support task whose `status`
changes after creation (e.g. `in_progress` → `completed`) won't be caught by
narrowing the date window to "since last run" alone. Practical approach: pull
new records by `createDate` window each run, *and* separately re-poll a
rolling recent window (e.g. last 30–60 days) to catch status changes on
already-ingested rows, since nothing in the brief shows an `updateDate` filter
parameter. `organization`/`driver` endpoints show no date filter at all in
their documented bodies, so those look like full-repull-and-diff by design —
**NEEDS CONFIRMATION** that no hidden filter param exists. On history depth:
rather than picking an arbitrary Trackensure-side window, it's worth matching
FMCSA's own SMS lookback (roughly 24 months for inspections/violations, a bit
longer for crashes) so the Trackensure-side history and the federal-side
history in the same dashboard cover comparable timeframes — but this is a
recommendation, not a hard requirement.

**20. Anything missing.**
(a) ELD units/trucks with VINs: not present in any endpoint shown, including
the driver feed — worth asking directly whether Trackensure tracks
asset/unit records at all (a `/fleet/vehicle` or `/fleet/unit`-shaped
endpoint that just hasn't surfaced yet), since some ELD platforms tie devices
to trucks rather than only to drivers. (b) SAFER/audit status: this is
federal-side data we already get from the FMCSA/Socrata pull (see
`docs/fmcsa-api-integration.md`), not something we need Trackensure to
provide. (c) Account manager/team: partially present already —
`monitoringService.assignedUserDTOs` (PMS coach/TL) and `supportTask.ownerDTO`
(the agent who owns one ticket) — but neither is a static "this org's
dedicated account manager" field on the org profile itself. Worth asking if
one exists under a name not yet seen in `getGeneralInfo`.

---

## Security note — reaffirmed

I have not requested, received, or used any Trackensure credentials, session
cookie, or proxy config, and won't — even if offered "since it's our own
system." Nothing in this document came from a live call to trackensure.com;
it's entirely derived from the sample data already in the brief. The PII
handling already proposed in the brief's §6 (never persist `aclUsers`
password/salt, `opentextPassword`, or `additionalContact`) looks right and I'd
extend it: keep driver license numbers and phone numbers out of the compliance
dashboard's own database too unless there's a specific operational need for
them there, since none of the current UI (`company.html`'s tabs) actually
displays driver-level PII — the app works entirely at the carrier/DOT level.

---

*Prepared 2026-09-05, in response to the "Trackensure API — what we know +
open questions" brief; updated the same day with Devorius's decisions on
client flag, bulk-dump freshness, service-account/IP allow-listing, and the
TE-inspections merge (see "Decisions confirmed by Devorius" at the top).
Remaining items marked NEEDS CONFIRMATION still require live testing against
trackensure.com by someone with real access.*
