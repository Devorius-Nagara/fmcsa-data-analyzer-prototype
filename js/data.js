/* Demo data for the FMCSA Data Analyzer clickable prototype.
   All company/inspection/violation records below are fictional placeholders. */

const PROVIDERS = [
  { id: 'swift',  name: 'Provider 1',  avgScore: 71, tamperings: 18 },
  { id: 'vista',  name: 'Provider 2',  avgScore: 58, tamperings: 13 },
  { id: 'alfa',   name: 'Provider 3',   avgScore: 38, tamperings: 9  },
  { id: 'sharp',  name: 'Provider 4',  avgScore: 49, tamperings: 5  },
  { id: 'wheels', name: 'Provider 5', avgScore: 84, tamperings: 2  },
];

const COMPANIES = [
  { dot: '1902244', name: 'Company 1', client: true,  provider: 'alfa',   mc: '845221',  status: 'Active', score: 24, tickets: 19, tamperings: 3,
    oosRate: 31.4, violPerInspection: 1.15, crashRate: 6.7, fatalCrashes: 1, dataStalenessDays: 18, hasDetail: true,
    address: '4410 GATEWAY BLVD, DALLAS, TX 75212', mailingAddress: 'Same as physical', phone: '2145550118', email: 'dispatch@company1-demo.com',
    officerName: 'J. MARTINEZ', officerTitle: 'OWNER', operationClassification: 'Authorized For Hire', specialty: 'General Freight',
    cargoTypes: ['General Freight', 'Building Materials', 'Machinery, Large Objects'],
    authoritySince: '2016-04-11', mcs150Date: '2026-06-01', mcs150Miles: 3120000, fleet: { units: 22, trailers: 18, drivers: 26 } },
  { dot: '2076111', name: 'Company 2', client: true,  provider: 'swift',  mc: '933410',  status: 'Active', score: 67, tickets: 14, tamperings: 1,
    oosRate: 14.6, violPerInspection: 0.41, crashRate: 1.2, fatalCrashes: 0, dataStalenessDays: 2,  hasDetail: true,
    address: '900 LOGISTICS PARK DR, FORT WORTH, TX 76106', mailingAddress: 'Same as physical', phone: '8175550172', email: 'safety@company2-demo.com',
    officerName: 'K. NGUYEN', officerTitle: 'SAFETY DIRECTOR', operationClassification: 'Authorized For Hire', specialty: 'Dry Van',
    cargoTypes: ['General Freight', 'Paper Products', 'Beverages'],
    authoritySince: '2013-09-02', mcs150Date: '2026-07-14', mcs150Miles: 4870000, fleet: { units: 31, trailers: 34, drivers: 38 } },
  { dot: '4158910', name: 'Company 3', client: true,  provider: 'vista',  mc: '1512377', status: 'Active', score: 51, tickets: 9,  tamperings: 3,
    oosRate: 16.7, violPerInspection: 0.50, crashRate: 1.8, fatalCrashes: 0, dataStalenessDays: 1,  hasDetail: true,
    address: '215 SHENANDOAH RD, ROANOKE, VA 24012', mailingAddress: 'Same as physical', phone: '5405550143', email: 'ops@company3-demo.com',
    officerName: 'D. COLEMAN', officerTitle: 'OWNER', operationClassification: 'Authorized For Hire', specialty: 'Refrigerated / Produce',
    cargoTypes: ['Refrigerated Food', 'General Freight', 'Meat'],
    authoritySince: '2020-01-27', mcs150Date: '2026-05-19', mcs150Miles: 2140000, fleet: { units: 14, trailers: 15, drivers: 17 } },
  { dot: '2462475', name: 'Company 4', client: true,  provider: 'alfa',   mc: '712233',  status: 'Active', score: 76, tickets: 5,  tamperings: 1,
    oosRate: 10.7, violPerInspection: 0.20, crashRate: 0.5, fatalCrashes: 0, dataStalenessDays: 3,  hasDetail: false,
    address: '77 COMMERCE WAY, ATLANTA, GA 30336', mailingAddress: 'Same as physical', phone: '4045550196', email: 'info@company4-demo.com',
    officerName: 'R. PATEL', officerTitle: 'OWNER', operationClassification: 'Authorized For Hire', specialty: 'Dry Van',
    cargoTypes: ['General Freight', 'Building Materials'],
    authoritySince: '2018-11-08', mcs150Date: '2026-04-02', mcs150Miles: 1980000, fleet: { units: 12, trailers: 11, drivers: 14 } },
  { dot: '3075935', name: 'Company 5', client: true,  provider: 'swift',  mc: '601122',  status: 'Active', score: 90, tickets: 3,  tamperings: 0,
    oosRate: 2.6,  violPerInspection: 0.08, crashRate: 0.0, fatalCrashes: 0, dataStalenessDays: 5,  hasDetail: true,
    address: '3300 INDUSTRIAL PKWY, TOLEDO, OH 43609', mailingAddress: 'Same as physical', phone: '4195550187', email: 'fleet@company5-demo.com',
    officerName: 'S. BAUER', officerTitle: 'FLEET MANAGER', operationClassification: 'Authorized For Hire', specialty: 'Flatbed',
    cargoTypes: ['Metal: Sheets, Coils, Rolls', 'Building Materials', 'Machinery, Large Objects'],
    authoritySince: '2011-03-15', mcs150Date: '2026-08-01', mcs150Miles: 5640000, fleet: { units: 28, trailers: 30, drivers: 33 } },
  { dot: '2833788', name: 'Company 6', client: true,  provider: 'sharp',  mc: '554321',  status: 'Active', score: 85, tickets: 2,  tamperings: 0,
    oosRate: 0.0,  violPerInspection: 0.00, crashRate: 0.0, fatalCrashes: 0, dataStalenessDays: 12, hasDetail: false,
    address: '18 HARBOR VIEW DR, JACKSONVILLE, FL 32218', mailingAddress: 'Same as physical', phone: '9045550129', email: 'contact@company6-demo.com',
    officerName: 'T. OKAFOR', officerTitle: 'OWNER', operationClassification: 'Authorized For Hire', specialty: 'Dry Van',
    cargoTypes: ['General Freight'],
    authoritySince: '2021-07-19', mcs150Date: '2026-03-10', mcs150Miles: 980000, fleet: { units: 6, trailers: 6, drivers: 7 } },
  { dot: '3391082', name: 'Company 7', client: false, provider: 'wheels', mc: '488210',  status: 'Active', score: 54, tickets: null, tamperings: 4,
    oosRate: 19.2, violPerInspection: 0.60, crashRate: 2.1, fatalCrashes: 0, dataStalenessDays: 30, hasDetail: false,
    address: '640 FREIGHT LN, INDIANAPOLIS, IN 46241', mailingAddress: 'Same as physical', phone: '3175550154', email: 'dispatch@company7-demo.com',
    officerName: 'M. WOJCIK', officerTitle: 'OWNER', operationClassification: 'Authorized For Hire', specialty: 'General Freight',
    cargoTypes: ['General Freight', 'Paper Products'],
    authoritySince: '2015-02-24', mcs150Date: '2026-02-11', mcs150Miles: 1560000, fleet: { units: 10, trailers: 9, drivers: 12 } },
];

const STATES = [
  { code: 'TX', name: 'Texas',          count: 14 },
  { code: 'CA', name: 'California',     count: 11 },
  { code: 'OH', name: 'Ohio',           count: 8  },
  { code: 'IL', name: 'Illinois',       count: 7  },
  { code: 'FL', name: 'Florida',        count: 6  },
  { code: 'GA', name: 'Georgia',        count: 4  },
  { code: 'IN', name: 'Indiana',        count: 3  },
  { code: 'NC', name: 'North Carolina', count: 2  },
  { code: 'VA', name: 'Virginia',       count: 2  },
];

/* Multipliers used to fake month / year totals from the 30-day baseline above. */
const STATE_PERIOD_SCALE = {
  '30d':   1,
  'month': 3.6,
  'year':  38,
};
const STATE_PERIOD_LABEL = { '30d': 'Last 30 days', 'month': 'Month', 'year': 'Year' };
const STATE_PERIOD_DELTA = { '30d': '+12%', 'month': '+6%', 'year': '-4%' };

const TICKETS = {
  '4158910': [
    { subject: 'ELD offline, sync error', status: 'Open', date: '2026-09-02' },
    { subject: 'Question about HOS report', status: 'Closed', date: '2026-08-28' },
    { subject: 'ELD device replacement (2 units)', status: 'Closed', date: '2026-08-19' },
    { subject: 'Inaccurate GPS complaint', status: 'Closed', date: '2026-08-05' },
  ],
  '1902244': [
    { subject: 'Repeated ELD tampering flags — escalated', status: 'Open', date: '2026-08-30' },
    { subject: 'Driver dispute over HOS violation', status: 'Open', date: '2026-08-20' },
    { subject: 'ELD firmware update request', status: 'Closed', date: '2026-08-01' },
  ],
  '2076111': [
    { subject: 'ELD tampering alert follow-up', status: 'Open', date: '2026-08-26' },
    { subject: 'New truck onboarding — ELD setup', status: 'Closed', date: '2026-08-10' },
  ],
  '3075935': [
    { subject: 'Annual compliance review scheduled', status: 'Closed', date: '2026-08-12' },
    { subject: 'ELD device replacement (1 unit)', status: 'Closed', date: '2026-07-22' },
  ],
};

const UPLOADS = {
  '4158910': [
    { datetime: '2026-09-03 04:07', truck: 'Truck #482', status: 'success' },
    { datetime: '2026-09-03 03:52', truck: 'Truck #217', status: 'success' },
    { datetime: '2026-09-02 04:11', truck: 'Truck #482', status: 'success' },
    { datetime: '2026-09-01 04:03', truck: 'Truck #106', status: 'failed', note: 'timeout' },
    { datetime: '2026-08-31 04:09', truck: 'Truck #482', status: 'success' },
  ],
  '1902244': [
    { datetime: '2026-09-03 05:14', truck: 'Truck #118', status: 'success' },
    { datetime: '2026-09-02 05:20', truck: 'Truck #205', status: 'failed', note: 'device offline' },
    { datetime: '2026-09-01 05:11', truck: 'Truck #118', status: 'success' },
  ],
  '2076111': [
    { datetime: '2026-09-03 04:40', truck: 'Truck #310', status: 'success' },
    { datetime: '2026-09-02 04:38', truck: 'Truck #310', status: 'success' },
  ],
  '3075935': [
    { datetime: '2026-09-03 03:15', truck: 'Truck #041', status: 'success' },
    { datetime: '2026-09-02 03:12', truck: 'Truck #041', status: 'success' },
  ],
};

/* Each inspection belongs to one company (dot) and carries its own violations. */
const INSPECTIONS = [
  // Company 3 — 4158910
  { id: 'VA-2026-118834', dot: '4158910', date: '2026-09-01', level: 'Level I — Full', state: 'VA',
    location: 'I-81 MM 118, Weigh Station', vehicle: 'VIN 1FUJGL...4821 · Truck #482', oos: true,
    violations: [
      { id: 'v1', code: '395.8',  desc: 'ELD tampering / falsified device data', basic: 'Hours-of-Service Compliance', severity: 8, oos: true,  type: 'ELD tampering',   source: 'preliminary' },
      { id: 'v2', code: '395.22', desc: 'No current record of duty status',      basic: 'Hours-of-Service Compliance', severity: 4, oos: false, type: 'Log falsification', source: 'preliminary' },
    ] },
  { id: 'NC-2026-098213', dot: '4158910', date: '2026-08-22', level: 'Level II — Walk-Around', state: 'NC',
    location: 'US-29, Roadside', vehicle: 'VIN 1FUJGL...4821 · Truck #482', oos: false,
    violations: [
      { id: 'v3', code: '395.8', desc: 'ELD tampering / falsified device data', basic: 'Hours-of-Service Compliance', severity: 6, oos: false, type: 'ELD tampering', source: 'preliminary' },
    ] },
  { id: 'VA-2026-077651', dot: '4158910', date: '2026-08-03', level: 'Level I — Full', state: 'VA',
    location: 'I-81 MM 118, Weigh Station', vehicle: 'VIN 1FUJGL...4821 · Truck #482', oos: false, violations: [] },
  { id: 'VA-2026-041002', dot: '4158910', date: '2026-07-02', level: 'Level I — Full', state: 'VA',
    location: 'I-81 MM 96, Weigh Station', vehicle: 'VIN 1FUJGL...4821 · Truck #482', oos: false,
    violations: [
      { id: 'v4', code: '395.8', desc: 'ELD tampering / falsified device data', basic: 'Hours-of-Service Compliance', severity: 5, oos: false, type: 'ELD tampering', source: 'official' },
    ] },

  // Company 1 — 1902244
  { id: 'TX-2026-330091', dot: '1902244', date: '2026-08-29', level: 'Level I — Full', state: 'TX',
    location: 'I-35 MM 212, Weigh Station', vehicle: 'VIN 3AKJHHDR...1190 · Truck #118', oos: true,
    violations: [
      { id: 'v5', code: '395.8', desc: 'ELD tampering / falsified device data', basic: 'Hours-of-Service Compliance', severity: 9, oos: true, type: 'ELD tampering', source: 'preliminary' },
      { id: 'v6', code: '396.9', desc: 'Brake out of adjustment',               basic: 'Vehicle Maintenance',          severity: 7, oos: true, type: 'Vehicle defect', source: 'preliminary' },
    ] },
  { id: 'TX-2026-311204', dot: '1902244', date: '2026-08-14', level: 'Level I — Full', state: 'TX',
    location: 'I-10 MM 754, Weigh Station', vehicle: 'VIN 3AKJHHDR...2207 · Truck #205', oos: true,
    violations: [
      { id: 'v7', code: '395.8', desc: 'ELD tampering / falsified device data', basic: 'Hours-of-Service Compliance', severity: 8, oos: true, type: 'ELD tampering', source: 'preliminary' },
    ] },
  { id: 'OK-2026-208871', dot: '1902244', date: '2026-07-30', level: 'Level II — Walk-Around', state: 'OK',
    location: 'US-75, Roadside', vehicle: 'VIN 3AKJHHDR...1190 · Truck #118', oos: false,
    violations: [
      { id: 'v8', code: '395.8', desc: 'ELD tampering / falsified device data', basic: 'Hours-of-Service Compliance', severity: 6, oos: false, type: 'ELD tampering', source: 'official' },
    ] },

  // Company 2 — 2076111
  { id: 'TX-2026-298001', dot: '2076111', date: '2026-08-25', level: 'Level I — Full', state: 'TX',
    location: 'I-20 MM 445, Weigh Station', vehicle: 'VIN 2FZHATD...5590 · Truck #310', oos: true,
    violations: [
      { id: 'v9', code: '395.8', desc: 'ELD tampering / falsified device data', basic: 'Hours-of-Service Compliance', severity: 7, oos: true, type: 'ELD tampering', source: 'preliminary' },
    ] },
  { id: 'TX-2026-276650', dot: '2076111', date: '2026-08-05', level: 'Level I — Full', state: 'TX',
    location: 'I-20 MM 445, Weigh Station', vehicle: 'VIN 2FZHATD...5590 · Truck #310', oos: false, violations: [] },

  // Company 5 — 3075935 (clean record)
  { id: 'OH-2026-190044', dot: '3075935', date: '2026-08-15', level: 'Level I — Full', state: 'OH',
    location: 'I-75 MM 201, Weigh Station', vehicle: 'VIN 1XPWD...7712 · Truck #041', oos: false, violations: [] },
  { id: 'OH-2026-165320', dot: '3075935', date: '2026-07-20', level: 'Level II — Walk-Around', state: 'OH',
    location: 'US-42, Roadside', vehicle: 'VIN 1XPWD...7712 · Truck #041', oos: false, violations: [] },
];

/* Crash records — FMCSA MCMIS-style fields. */
const CRASHES = {
  '1902244': [
    { date: '2026-08-11', time: '14:22', location: 'GRAND PRAIRIE, TX', road: 'I-30', county: 'Dallas', vehicles: 2,
      weather: 'No adverse conditions', lighting: 'Daylight', surface: 'Dry', roadway: 'Two-way, divided, unprotected median',
      sequence: '1:20:COLLISION INVOLVING OTHER MOVABLE OBJECT', reportedBy: 'DALLAS PD', towAway: true, injured: 1, fatalities: 1 },
    { date: '2026-05-03', time: '06:40', location: 'WACO, TX', road: 'I-35', county: 'McLennan', vehicles: 1,
      weather: 'Rain', lighting: 'Dark – not lighted', surface: 'Wet',
      sequence: '1:18:COLLISION INVOLVING FIXED OBJECT', reportedBy: 'TEXAS DPS', towAway: true, injured: 0, fatalities: 0 },
    { date: '2025-11-19', time: '17:05', location: 'AUSTIN, TX', road: 'US-183', county: 'Travis', vehicles: 2,
      weather: 'No adverse conditions', lighting: 'Daylight', surface: 'Dry',
      sequence: '1:20:COLLISION INVOLVING OTHER MOVABLE OBJECT', reportedBy: 'AUSTIN PD', towAway: false, injured: 1, fatalities: 0 },
  ],
  '2076111': [
    { date: '2026-06-27', time: '09:12', location: 'ARLINGTON, TX', road: 'I-20', county: 'Tarrant', vehicles: 2,
      weather: 'No adverse conditions', lighting: 'Daylight', surface: 'Dry',
      sequence: '1:20:COLLISION INVOLVING OTHER MOVABLE OBJECT', reportedBy: 'ARLINGTON PD', towAway: true, injured: 0, fatalities: 0 },
  ],
  '4158910': [
    { date: '2026-07-14', time: '22:31', location: 'ROANOKE, VA', road: 'I-81', county: 'Roanoke', vehicles: 2,
      weather: 'No adverse conditions', lighting: 'Dark – not lighted', surface: 'Dry',
      sequence: '1:20:COLLISION INVOLVING OTHER MOVABLE OBJECT', reportedBy: 'VIRGINIA STATE POLICE', towAway: true, injured: 0, fatalities: 0 },
    { date: '2025-09-30', time: '05:52', location: 'GREENSBORO, NC', road: 'I-40', county: 'Guilford', vehicles: 1,
      weather: 'Fog', lighting: 'Dark – not lighted', surface: 'Wet',
      sequence: '1:18:COLLISION INVOLVING FIXED OBJECT', reportedBy: 'NC HIGHWAY PATROL', towAway: true, injured: 0, fatalities: 0 },
  ],
  '3075935': [],
};

/* Insurance filing history (BIPD/Primary). */
const INSURANCE_HISTORY = {
  '1902244': [
    { insurer: 'GREAT WEST CASUALTY COMPANY', policyNum: '#GW7734120', coverageMax: 1000000, from: '2024-04-11', to: null, status: 'Active' },
    { insurer: 'CANAL INSURANCE COMPANY', policyNum: '#CN2201984', coverageMax: 750000, from: '2020-04-11', to: '2024-04-11', status: 'Replaced', reason: 'Policy closed because a new filing was submitted — the carrier switched insurers.' },
  ],
  '2076111': [
    { insurer: 'NORTHLAND INSURANCE COMPANY', policyNum: '#NL0091823', coverageMax: 1000000, from: '2019-09-02', to: null, status: 'Active' },
  ],
  '4158910': [
    { insurer: 'PROGRESSIVE COMMERCIAL', policyNum: '#PG5502217', coverageMax: 750000, from: '2023-01-27', to: null, status: 'Active' },
    { insurer: 'SENTRY SELECT INSURANCE COMPANY', policyNum: '#SS4471029', coverageMax: 750000, from: '2020-01-27', to: '2023-01-27', status: 'Replaced', reason: 'Policy closed because a new filing was submitted — the carrier switched insurers.' },
  ],
  '3075935': [
    { insurer: 'OLD REPUBLIC INSURANCE COMPANY', policyNum: '#OR1183760', coverageMax: 1000000, from: '2011-03-15', to: null, status: 'Active' },
  ],
};

/* Official FMCSA SMS BASIC categories. */
const SMS_BASICS = {
  '1902244': [
    { category: 'Unsafe Driving', measure: 3.12, inspections: 88, violations: 22 },
    { category: 'Hours-of-Service Compliance', measure: 4.05, inspections: 88, violations: 31 },
    { category: 'Driver Fitness', measure: 0.42, inspections: 88, violations: 3 },
    { category: 'Controlled Substances/Alcohol', measure: 0, inspections: 88, violations: 0 },
    { category: 'Vehicle Maintenance', measure: 2.90, inspections: 88, violations: 19 },
  ],
  '2076111': [
    { category: 'Unsafe Driving', measure: 1.05, inspections: 44, violations: 6 },
    { category: 'Hours-of-Service Compliance', measure: 0.88, inspections: 44, violations: 5 },
    { category: 'Driver Fitness', measure: 0, inspections: 44, violations: 0 },
    { category: 'Controlled Substances/Alcohol', measure: 0, inspections: 44, violations: 0 },
    { category: 'Vehicle Maintenance', measure: 1.20, inspections: 44, violations: 7 },
  ],
  '4158910': [
    { category: 'Unsafe Driving', measure: 0.61, inspections: 36, violations: 3 },
    { category: 'Hours-of-Service Compliance', measure: 2.18, inspections: 36, violations: 12 },
    { category: 'Driver Fitness', measure: 0, inspections: 36, violations: 0 },
    { category: 'Controlled Substances/Alcohol', measure: 0, inspections: 36, violations: 0 },
    { category: 'Vehicle Maintenance', measure: 0.94, inspections: 36, violations: 4 },
  ],
  '3075935': [
    { category: 'Unsafe Driving', measure: 0.10, inspections: 20, violations: 1 },
    { category: 'Hours-of-Service Compliance', measure: 0, inspections: 20, violations: 0 },
    { category: 'Driver Fitness', measure: 0, inspections: 20, violations: 0 },
    { category: 'Controlled Substances/Alcohol', measure: 0, inspections: 20, violations: 0 },
    { category: 'Vehicle Maintenance', measure: 0.05, inspections: 20, violations: 1 },
  ],
};

/* Internal risk score, trailing 12 months (for the trend chart). */
const SCORE_HISTORY = {
  '1902244': [41, 39, 38, 35, 33, 30, 29, 27, 26, 25, 24, 24],
  '2076111': [58, 59, 61, 60, 62, 64, 63, 65, 66, 67, 66, 67],
  '4158910': [47, 48, 46, 49, 50, 48, 52, 51, 53, 52, 50, 51],
  '3075935': [84, 85, 86, 86, 87, 88, 88, 89, 89, 90, 90, 90],
};

/* ---- lookup helpers ---- */
function getCompany(dot) { return COMPANIES.find(c => c.dot === dot); }
function getProvider(id) { return PROVIDERS.find(p => p.id === id); }
function getInspection(id) { return INSPECTIONS.find(i => i.id === id); }
function getInspectionsForCompany(dot) { return INSPECTIONS.filter(i => i.dot === dot).sort((a, b) => b.date.localeCompare(a.date)); }
function getViolation(id) {
  for (const insp of INSPECTIONS) {
    const v = insp.violations.find(v => v.id === id);
    if (v) return { violation: v, inspection: insp };
  }
  return null;
}
function getViolationsForCompany(dot) {
  const out = [];
  for (const insp of getInspectionsForCompany(dot)) {
    for (const v of insp.violations) out.push({ ...v, inspectionId: insp.id, date: insp.date });
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}
function scoreTier(score) {
  if (score >= 75) return { label: 'Minimal', cls: 'pill-minimal' };
  if (score >= 40) return { label: 'Elevated', cls: 'pill-elevated' };
  return { label: 'Critical', cls: 'pill-critical' };
}
function fmtDate(iso) {
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}
function fmtMiles(n) { return n.toLocaleString('en-US'); }
