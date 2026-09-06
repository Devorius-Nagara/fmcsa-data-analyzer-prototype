/* Demo data for the FMCSA Data Analyzer clickable prototype.
   All company/inspection/violation records below are fictional placeholders.
   Field names mirror the real production API (camelCase) — see README.md. */

/* ---- small deterministic PRNG so "fake" numbers stay stable across reloads ---- */
function seededRand(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  h ^= h >>> 16; h = Math.imul(h, 0x45d9f3b); h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}
function seededInt(str, min, max) { return min + Math.floor(seededRand(str) * (max - min + 1)); }

/* ---- ELD providers ----
   avgScore is the mean Safety Score across a provider's FMCSA-enriched (hasDetail)
   companies. Providers with none enriched yet sit at 0 — the UI must never render
   that as a real "0 · Critical" score. */
const PROVIDERS = [
  { id: 'swift',     name: 'Provider 1', avgScore: 76, tamperings: 2  },
  { id: 'vista',     name: 'Provider 2', avgScore: 43, tamperings: 8  },
  { id: 'alfa',      name: 'Provider 3', avgScore: 52, tamperings: 6  },
  { id: 'sharp',     name: 'Provider 4', avgScore: 0,  tamperings: 0  },
  { id: 'wheels',    name: 'Provider 5', avgScore: 0,  tamperings: 10 },
  { id: 'apex',      name: 'Provider 6', avgScore: 38, tamperings: 8  },
  { id: 'nova',      name: 'Provider 7', avgScore: 82, tamperings: 0  },
  { id: 'crestline', name: 'Provider 8', avgScore: 0,  tamperings: 2  },
];

/* ---- companies ---- */
const COMPANIES = [
  { dot: '1902244', name: 'Company 1',  client: true,  active: true,  provider: 'alfa',      providerIds: ['alfa'],
    mc: '845221',  status: 'Active', score: 24, tamperings: 3, hasDetail: true,
    oosRate: 31.4, violPerInspection: 1.15, crashRate: 6.7, fatalCrashes: 1, dataStalenessDays: 18,
    address: '4410 GATEWAY BLVD, DALLAS, TX 75212', mailingAddress: 'Same as physical', phone: '2145550118', email: 'dispatch@company1-demo.com',
    officerName: 'J. MARTINEZ', officerTitle: 'OWNER', operationClassification: 'Authorized For Hire', specialty: 'General Freight',
    cargoTypes: ['General Freight', 'Building Materials', 'Machinery, Large Objects'],
    authoritySince: '2016-04-11', mcs150Date: '2026-06-01', mcs150Miles: 3120000, fleet: { units: 22, trailers: 18, drivers: 26 },
    trackensureSince: '2022-03-01', hasActiveAudit: true },
  { dot: '2076111', name: 'Company 2',  client: true,  active: true,  provider: 'swift',     providerIds: ['swift'],
    mc: '933410',  status: 'Active', score: 67, tamperings: 1, hasDetail: true,
    oosRate: 14.6, violPerInspection: 0.41, crashRate: 1.2, fatalCrashes: 0, dataStalenessDays: 2,
    address: '900 LOGISTICS PARK DR, FORT WORTH, TX 76106', mailingAddress: 'Same as physical', phone: '8175550172', email: 'safety@company2-demo.com',
    officerName: 'K. NGUYEN', officerTitle: 'SAFETY DIRECTOR', operationClassification: 'Authorized For Hire', specialty: 'Dry Van',
    cargoTypes: ['General Freight', 'Paper Products', 'Beverages'],
    authoritySince: '2013-09-02', mcs150Date: '2026-07-14', mcs150Miles: 4870000, fleet: { units: 31, trailers: 34, drivers: 38 },
    trackensureSince: '2021-11-14', hasActiveAudit: false },
  { dot: '4158910', name: 'Company 3',  client: true,  active: true,  provider: 'vista',     providerIds: ['vista'],
    mc: '1512377', status: 'Active', score: 51, tamperings: 3, hasDetail: true,
    oosRate: 16.7, violPerInspection: 0.50, crashRate: 1.8, fatalCrashes: 0, dataStalenessDays: 1,
    address: '215 SHENANDOAH RD, ROANOKE, VA 24012', mailingAddress: 'Same as physical', phone: '5405550143', email: 'ops@company3-demo.com',
    officerName: 'D. COLEMAN', officerTitle: 'OWNER', operationClassification: 'Authorized For Hire', specialty: 'Refrigerated / Produce',
    cargoTypes: ['Refrigerated Food', 'General Freight', 'Meat'],
    authoritySince: '2020-01-27', mcs150Date: '2026-05-19', mcs150Miles: 2140000, fleet: { units: 14, trailers: 15, drivers: 17 },
    trackensureSince: '2023-02-08', hasActiveAudit: false },
  { dot: '2462475', name: 'Company 4',  client: true,  active: true,  provider: 'alfa',      providerIds: ['alfa'],
    mc: '712233',  status: 'Active', score: 0,  tamperings: 1, hasDetail: false,
    oosRate: 0, violPerInspection: 0, crashRate: 0, fatalCrashes: 0, dataStalenessDays: 0,
    address: '77 COMMERCE WAY, ATLANTA, GA 30336', mailingAddress: 'Same as physical', phone: '4045550196', email: 'info@company4-demo.com',
    officerName: 'R. PATEL', officerTitle: 'OWNER', operationClassification: 'Authorized For Hire', specialty: 'Dry Van',
    cargoTypes: ['General Freight', 'Building Materials'],
    authoritySince: '2018-11-08', mcs150Date: '2026-04-02', mcs150Miles: 1980000, fleet: { units: 12, trailers: 11, drivers: 14 },
    trackensureSince: '2024-06-19', hasActiveAudit: false },
  { dot: '3075935', name: 'Company 5',  client: true,  active: true,  provider: 'swift',     providerIds: ['swift'],
    mc: '601122',  status: 'Active', score: 90, tamperings: 0, hasDetail: true,
    oosRate: 2.6,  violPerInspection: 0.08, crashRate: 0.0, fatalCrashes: 0, dataStalenessDays: 5,
    address: '3300 INDUSTRIAL PKWY, TOLEDO, OH 43609', mailingAddress: 'Same as physical', phone: '4195550187', email: 'fleet@company5-demo.com',
    officerName: 'S. BAUER', officerTitle: 'FLEET MANAGER', operationClassification: 'Authorized For Hire', specialty: 'Flatbed',
    cargoTypes: ['Metal: Sheets, Coils, Rolls', 'Building Materials', 'Machinery, Large Objects'],
    authoritySince: '2011-03-15', mcs150Date: '2026-08-01', mcs150Miles: 5640000, fleet: { units: 28, trailers: 30, drivers: 33 },
    trackensureSince: '2020-05-04', hasActiveAudit: false },
  { dot: '2833788', name: 'Company 6',  client: true,  active: true,  provider: 'sharp',     providerIds: ['sharp'],
    mc: '554321',  status: 'Active', score: 0,  tamperings: 0, hasDetail: false,
    oosRate: 0, violPerInspection: 0, crashRate: 0, fatalCrashes: 0, dataStalenessDays: 0,
    address: '18 HARBOR VIEW DR, JACKSONVILLE, FL 32218', mailingAddress: 'Same as physical', phone: '9045550129', email: 'contact@company6-demo.com',
    officerName: 'T. OKAFOR', officerTitle: 'OWNER', operationClassification: 'Authorized For Hire', specialty: 'Dry Van',
    cargoTypes: ['General Freight'],
    authoritySince: '2021-07-19', mcs150Date: '2026-03-10', mcs150Miles: 980000, fleet: { units: 6, trailers: 6, drivers: 7 },
    trackensureSince: '2024-01-22', hasActiveAudit: false },
  { dot: '3391082', name: 'Company 7',  client: false, active: true,  provider: 'wheels',    providerIds: ['wheels'],
    mc: '488210',  status: 'Active', score: 0,  tamperings: 4, hasDetail: false,
    oosRate: 0, violPerInspection: 0, crashRate: 0, fatalCrashes: 0, dataStalenessDays: 0,
    address: '640 FREIGHT LN, INDIANAPOLIS, IN 46241', mailingAddress: 'Same as physical', phone: '3175550154', email: 'dispatch@company7-demo.com',
    officerName: 'M. WOJCIK', officerTitle: 'OWNER', operationClassification: 'Authorized For Hire', specialty: 'General Freight',
    cargoTypes: ['General Freight', 'Paper Products'],
    authoritySince: '2015-02-24', mcs150Date: '2026-02-11', mcs150Miles: 1560000, fleet: { units: 10, trailers: 9, drivers: 12 },
    trackensureSince: null, hasActiveAudit: false },
  { dot: '5522011', name: 'Company 8',  client: true,  active: true,  provider: 'apex',      providerIds: ['apex'],
    mc: '390871',  status: 'Active', score: 38, tamperings: 5, hasDetail: true,
    oosRate: 22.9, violPerInspection: 0.88, crashRate: 3.4, fatalCrashes: 0, dataStalenessDays: 4,
    address: '210 RAIL YARD RD, MEMPHIS, TN 38109', mailingAddress: 'Same as physical', phone: '9015550166', email: 'safety@company8-demo.com',
    officerName: 'L. FERRARO', officerTitle: 'SAFETY DIRECTOR', operationClassification: 'Authorized For Hire', specialty: 'Dry Van',
    cargoTypes: ['General Freight', 'Household Goods'],
    authoritySince: '2017-06-30', mcs150Date: '2026-07-02', mcs150Miles: 2760000, fleet: { units: 19, trailers: 20, drivers: 23 },
    trackensureSince: '2022-09-12', hasActiveAudit: true },
  { dot: '6603322', name: 'Company 9',  client: true,  active: true,  provider: 'nova',      providerIds: ['nova'],
    mc: '204455',  status: 'Active', score: 82, tamperings: 0, hasDetail: true,
    oosRate: 5.1, violPerInspection: 0.14, crashRate: 0.3, fatalCrashes: 0, dataStalenessDays: 3,
    address: '88 PORT ACCESS RD, SAVANNAH, GA 31408', mailingAddress: 'Same as physical', phone: '9125550183', email: 'ops@company9-demo.com',
    officerName: 'A. RUSSO', officerTitle: 'OWNER', operationClassification: 'Authorized For Hire', specialty: 'Intermodal / Container',
    cargoTypes: ['Intermodal Container', 'General Freight'],
    authoritySince: '2014-10-05', mcs150Date: '2026-06-21', mcs150Miles: 3980000, fleet: { units: 24, trailers: 26, drivers: 27 },
    trackensureSince: '2021-04-30', hasActiveAudit: false },
  { dot: '7714433', name: 'Company 10', client: false, active: true,  provider: 'crestline', providerIds: ['crestline'],
    mc: '661029',  status: 'Active', score: 0,  tamperings: 2, hasDetail: false,
    oosRate: 0, violPerInspection: 0, crashRate: 0, fatalCrashes: 0, dataStalenessDays: 0,
    address: '502 TERMINAL AVE, CHICAGO, IL 60638', mailingAddress: 'Same as physical', phone: '7735550199', email: 'dispatch@company10-demo.com',
    officerName: 'B. HALVORSEN', officerTitle: 'OWNER', operationClassification: 'Authorized For Hire', specialty: 'General Freight',
    cargoTypes: ['General Freight'],
    authoritySince: '2019-08-14', mcs150Date: '2026-01-29', mcs150Miles: 1340000, fleet: { units: 8, trailers: 7, drivers: 9 },
    trackensureSince: null, hasActiveAudit: false },
  { dot: '8825544', name: 'Company 11', client: true,  active: true,  provider: 'vista',     providerIds: ['vista'],
    mc: '772014',  status: 'Active', score: 0,  tamperings: 1, hasDetail: false,
    oosRate: 0, violPerInspection: 0, crashRate: 0, fatalCrashes: 0, dataStalenessDays: 0,
    address: '14 DEPOT ST, COLUMBUS, OH 43222', mailingAddress: 'Same as physical', phone: '6145550111', email: 'contact@company11-demo.com',
    officerName: 'C. YODER', officerTitle: 'OWNER', operationClassification: 'Authorized For Hire', specialty: 'Dry Van',
    cargoTypes: ['General Freight', 'Paper Products'],
    authoritySince: '2020-09-01', mcs150Date: '2026-05-06', mcs150Miles: 890000, fleet: { units: 5, trailers: 5, drivers: 6 },
    trackensureSince: '2024-08-02', hasActiveAudit: false },
  { dot: '9936655', name: 'Company 12', client: true,  active: true,  provider: 'alfa',      providerIds: ['alfa'],
    mc: '128805',  status: 'Active', score: 45, tamperings: 2, hasDetail: true,
    oosRate: 18.3, violPerInspection: 0.62, crashRate: 2.0, fatalCrashes: 0, dataStalenessDays: 6,
    address: '77 CANAL RD, CLEVELAND, OH 44113', mailingAddress: 'Same as physical', phone: '2165550144', email: 'safety@company12-demo.com',
    officerName: 'E. SZABO', officerTitle: 'SAFETY DIRECTOR', operationClassification: 'Authorized For Hire', specialty: 'Flatbed',
    cargoTypes: ['Building Materials', 'Metal: Sheets, Coils, Rolls'],
    authoritySince: '2016-12-22', mcs150Date: '2026-06-11', mcs150Miles: 2210000, fleet: { units: 16, trailers: 17, drivers: 18 },
    trackensureSince: '2022-12-01', hasActiveAudit: false },
  { dot: '1047766', name: 'Company 13', client: false, active: false, provider: 'sharp',     providerIds: ['sharp'],
    mc: '335098',  status: 'Inactive', score: 0, tamperings: 0, hasDetail: false,
    oosRate: 0, violPerInspection: 0, crashRate: 0, fatalCrashes: 0, dataStalenessDays: 0,
    address: '61 MILL ST, PEORIA, IL 61602', mailingAddress: 'Same as physical', phone: '3095550177', email: 'info@company13-demo.com',
    officerName: 'F. ODOM', officerTitle: 'OWNER', operationClassification: 'Authorized For Hire', specialty: 'General Freight',
    cargoTypes: ['General Freight'],
    authoritySince: '2012-02-17', mcs150Date: '2025-11-02', mcs150Miles: 610000, fleet: { units: 3, trailers: 3, drivers: 3 },
    trackensureSince: null, hasActiveAudit: false },
  { dot: '1158877', name: 'Company 14', client: true,  active: true,  provider: 'apex',      providerIds: ['apex'],
    mc: '447712',  status: 'Active', score: 0,  tamperings: 3, hasDetail: false,
    oosRate: 0, violPerInspection: 0, crashRate: 0, fatalCrashes: 0, dataStalenessDays: 0,
    address: '900 STOCKYARD BLVD, KANSAS CITY, MO 64120', mailingAddress: 'Same as physical', phone: '8165550122', email: 'dispatch@company14-demo.com',
    officerName: 'G. LARKIN', officerTitle: 'OWNER', operationClassification: 'Authorized For Hire', specialty: 'Refrigerated / Produce',
    cargoTypes: ['Refrigerated Food'],
    authoritySince: '2018-04-09', mcs150Date: '2026-02-18', mcs150Miles: 1470000, fleet: { units: 9, trailers: 9, drivers: 10 },
    trackensureSince: '2023-10-03', hasActiveAudit: false },
  { dot: '1269988', name: 'Company 15', client: true,  active: true,  provider: 'swift',     providerIds: ['swift'],
    mc: '803351',  status: 'Active', score: 71, tamperings: 1, hasDetail: true,
    oosRate: 12.0, violPerInspection: 0.35, crashRate: 1.0, fatalCrashes: 0, dataStalenessDays: 2,
    address: '3021 AIRPORT RD, NASHVILLE, TN 37217', mailingAddress: 'Same as physical', phone: '6155550188', email: 'ops@company15-demo.com',
    officerName: 'H. GREENE', officerTitle: 'FLEET MANAGER', operationClassification: 'Authorized For Hire', specialty: 'Dry Van',
    cargoTypes: ['General Freight', 'Beverages'],
    authoritySince: '2015-07-01', mcs150Date: '2026-07-25', mcs150Miles: 3340000, fleet: { units: 20, trailers: 21, drivers: 23 },
    trackensureSince: '2021-07-19', hasActiveAudit: false },
  { dot: '1371199', name: 'Company 16', client: true,  active: true,  provider: 'nova',      providerIds: ['nova'],
    mc: '559930',  status: 'Active', score: 0,  tamperings: 0, hasDetail: false,
    oosRate: 0, violPerInspection: 0, crashRate: 0, fatalCrashes: 0, dataStalenessDays: 0,
    address: '77 PIER RD, CHARLESTON, SC 29401', mailingAddress: 'Same as physical', phone: '8435550133', email: 'contact@company16-demo.com',
    officerName: 'I. VANCE', officerTitle: 'OWNER', operationClassification: 'Authorized For Hire', specialty: 'Intermodal / Container',
    cargoTypes: ['Intermodal Container'],
    authoritySince: '2021-01-11', mcs150Date: '2026-04-27', mcs150Miles: 720000, fleet: { units: 4, trailers: 4, drivers: 5 },
    trackensureSince: '2025-01-06', hasActiveAudit: false },
  { dot: '1482200', name: 'Company 17', client: false, active: false, provider: 'wheels',    providerIds: ['wheels'],
    mc: '901122',  status: 'Inactive', score: 0, tamperings: 6, hasDetail: false,
    oosRate: 0, violPerInspection: 0, crashRate: 0, fatalCrashes: 0, dataStalenessDays: 0,
    address: '14 SPUR RD, TULSA, OK 74107', mailingAddress: 'Same as physical', phone: '9185550155', email: 'dispatch@company17-demo.com',
    officerName: 'J. PRUITT', officerTitle: 'OWNER', operationClassification: 'Authorized For Hire', specialty: 'General Freight',
    cargoTypes: ['General Freight'],
    authoritySince: '2013-05-20', mcs150Date: '2025-09-14', mcs150Miles: 1980000, fleet: { units: 13, trailers: 12, drivers: 15 },
    trackensureSince: null, hasActiveAudit: false },
  { dot: '1593311', name: 'Company 18', client: true,  active: true,  provider: 'crestline', providerIds: ['crestline'],
    mc: '223140',  status: 'Active', score: 0,  tamperings: 0, hasDetail: false,
    oosRate: 0, violPerInspection: 0, crashRate: 0, fatalCrashes: 0, dataStalenessDays: 0,
    address: '400 WAREHOUSE DR, PHOENIX, AZ 85043', mailingAddress: 'Same as physical', phone: '6025550100', email: 'info@company18-demo.com',
    officerName: 'K. ABARA', officerTitle: 'OWNER', operationClassification: 'Authorized For Hire', specialty: 'Dry Van',
    cargoTypes: ['General Freight', 'Household Goods'],
    authoritySince: '2022-03-30', mcs150Date: '2026-03-02', mcs150Miles: 410000, fleet: { units: 4, trailers: 4, drivers: 5 },
    trackensureSince: '2025-05-19', hasActiveAudit: false },
  { dot: '1604422', name: 'Company 19', client: true,  active: true,  provider: 'vista',     providerIds: ['vista'],
    mc: '667712',  status: 'Active', score: 34, tamperings: 4, hasDetail: true,
    oosRate: 27.6, violPerInspection: 0.97, crashRate: 4.9, fatalCrashes: 0, dataStalenessDays: 9,
    address: '212 FREIGHT CT, RICHMOND, VA 23224', mailingAddress: 'Same as physical', phone: '8045550177', email: 'safety@company19-demo.com',
    officerName: 'L. TRAN', officerTitle: 'SAFETY DIRECTOR', operationClassification: 'Authorized For Hire', specialty: 'General Freight',
    cargoTypes: ['General Freight', 'Building Materials'],
    authoritySince: '2017-01-08', mcs150Date: '2026-05-30', mcs150Miles: 1890000, fleet: { units: 11, trailers: 12, drivers: 13 },
    trackensureSince: '2022-02-14', hasActiveAudit: true },
  { dot: '1715533', name: 'Company 20', client: true,  active: true,  provider: 'alfa',      providerIds: ['alfa'],
    mc: '990241',  status: 'Active', score: 88, tamperings: 0, hasDetail: true,
    oosRate: 3.4, violPerInspection: 0.11, crashRate: 0.2, fatalCrashes: 0, dataStalenessDays: 1,
    address: '19 LOGISTICS CIR, GREENVILLE, SC 29607', mailingAddress: 'Same as physical', phone: '8645550166', email: 'fleet@company20-demo.com',
    officerName: 'M. OSEI', officerTitle: 'FLEET MANAGER', operationClassification: 'Authorized For Hire', specialty: 'Dry Van',
    cargoTypes: ['General Freight'],
    authoritySince: '2010-06-04', mcs150Date: '2026-08-10', mcs150Miles: 4410000, fleet: { units: 27, trailers: 28, drivers: 30 },
    trackensureSince: '2020-01-15', hasActiveAudit: false },
];

/* ---- all 50 states + DC, ranked by ELD-tampering case count ----
   `count` = tampering cases, `inspections` = total roadside inspections,
   both over the last 24 months. Top 9 hand-tuned to line up with the
   detailed company/inspection records below; the rest are seeded so every
   state has a plausible, stable value. */
const US_STATES = [
  ['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],['CA','California'],
  ['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],['DC','District of Columbia'],['FL','Florida'],
  ['GA','Georgia'],['HI','Hawaii'],['ID','Idaho'],['IL','Illinois'],['IN','Indiana'],
  ['IA','Iowa'],['KS','Kansas'],['KY','Kentucky'],['LA','Louisiana'],['ME','Maine'],
  ['MD','Maryland'],['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],['MS','Mississippi'],
  ['MO','Missouri'],['MT','Montana'],['NE','Nebraska'],['NV','Nevada'],['NH','New Hampshire'],
  ['NJ','New Jersey'],['NM','New Mexico'],['NY','New York'],['NC','North Carolina'],['ND','North Dakota'],
  ['OH','Ohio'],['OK','Oklahoma'],['OR','Oregon'],['PA','Pennsylvania'],['RI','Rhode Island'],
  ['SC','South Carolina'],['SD','South Dakota'],['TN','Tennessee'],['TX','Texas'],['UT','Utah'],
  ['VT','Vermont'],['VA','Virginia'],['WA','Washington'],['WV','West Virginia'],['WI','Wisconsin'],
  ['WY','Wyoming'],
];
const STATE_OVERRIDES = {
  TX: { count: 14, inspections: 640 },
  CA: { count: 11, inspections: 900 },
  OH: { count: 8,  inspections: 210 },
  IL: { count: 7,  inspections: 180 },
  FL: { count: 6,  inspections: 320 },
  GA: { count: 4,  inspections: 260 },
  IN: { count: 3,  inspections: 300 },
  NC: { count: 2,  inspections: 140 },
  VA: { count: 2,  inspections: 120 },
};
function stateName(code) {
  const row = US_STATES.find(([c]) => c === code);
  return row ? row[1] : code;
}
const STATES = US_STATES.map(([code, name]) => {
  if (STATE_OVERRIDES[code]) return { code, name, ...STATE_OVERRIDES[code] };
  const inspections = seededInt(code + '-insp', 20, 250);
  const count = Math.round(inspections * (seededRand(code + '-rate') * 0.018));
  return { code, name, count, inspections };
}).sort((a, b) => b.count - a.count);

const TODAY = '2026-09-06';

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
  '5522011': [
    { datetime: '2026-09-03 04:55', truck: 'Truck #558', status: 'success' },
    { datetime: '2026-09-02 04:50', truck: 'Truck #558', status: 'failed', note: 'timeout' },
  ],
  '1604422': [
    { datetime: '2026-09-03 05:02', truck: 'Truck #612', status: 'success' },
    { datetime: '2026-09-02 05:00', truck: 'Truck #612', status: 'success' },
  ],
};

/* Full truck+trailer VIN pairs, keyed by truck number, referenced from inspections and crashes. */
const VEHICLES = {
  '482': { truckNumber: '#482', truckVin: '1FUJGLDR8LLJ84821', trailerNumber: '#217T', trailerVin: '1RNF53A27NR091482' },
  '118': { truckNumber: '#118', truckVin: '3AKJHHDR9KSLD1190', trailerNumber: '#118T', trailerVin: '1RNF53A29PR061190' },
  '205': { truckNumber: '#205', truckVin: '3AKJHHDR2LSLN2207', trailerNumber: '#205T', trailerVin: '1RNF53A21PR062207' },
  '310': { truckNumber: '#310', truckVin: '2FZHATDC85AN95590', trailerNumber: '#310T', trailerVin: '1RNF53A25PR065310' },
  '041': { truckNumber: '#041', truckVin: '1XPWDB9X5JD417712', trailerNumber: '#041T', trailerVin: '1RNF53A20PR060041' },
  '558': { truckNumber: '#558', truckVin: '2NKHHM7X0LM485589', trailerNumber: '#558T', trailerVin: '1RNF53A28PR065580' },
  '612': { truckNumber: '#612', truckVin: '3HSDJAPR8KN061217', trailerNumber: '#612T', trailerVin: '1RNF53A24PR061204' },
};

/* Each inspection belongs to one company (dot) and carries its own violations.
   `source` / `federalPending` / `patrol` / `inspectorName` / `inspectorBadge` /
   `reportDetails` are populated when Trackensure has a matching roadside ticket
   for that stop — merged directly into this row rather than shown separately. */
const INSPECTIONS = [
  // Company 3 — 4158910
  { id: 'VA-2026-118834', dot: '4158910', date: '2026-09-01', level: 'Level I — Full', state: 'VA',
    location: 'I-81 MM 118, Weigh Station', vehicle: VEHICLES['482'], oos: true,
    source: 'fmcsa+te', federalPending: false, patrol: 'Virginia State Police', inspectorName: 'T. Blackmon', inspectorBadge: 'VSP-4471',
    reportDetails: 'TE roadside ticket #TE-88213 matched to this stop — inspector flagged ELD log discontinuity on scene.',
    violations: [
      { id: 'v1', code: '395.8',  desc: 'ELD tampering / falsified device data', basic: 'Hours-of-Service Compliance', severity: 8, oos: true,  type: 'ELD tampering',   source: 'preliminary' },
      { id: 'v2', code: '395.22', desc: 'No current record of duty status',      basic: 'Hours-of-Service Compliance', severity: 4, oos: false, type: 'Log falsification', source: 'preliminary' },
    ] },
  { id: 'NC-2026-098213', dot: '4158910', date: '2026-08-22', level: 'Level II — Walk-Around', state: 'NC',
    location: 'US-29, Roadside', vehicle: VEHICLES['482'], oos: false,
    source: 'fmcsa', federalPending: false,
    violations: [
      { id: 'v3', code: '395.8', desc: 'ELD tampering / falsified device data', basic: 'Hours-of-Service Compliance', severity: 6, oos: false, type: 'ELD tampering', source: 'preliminary' },
    ] },
  { id: 'VA-2026-077651', dot: '4158910', date: '2026-08-03', level: 'Level I — Full', state: 'VA',
    location: 'I-81 MM 118, Weigh Station', vehicle: VEHICLES['482'], oos: false, source: 'fmcsa', federalPending: false, violations: [] },
  { id: 'TE-2026-004471', dot: '4158910', date: '2026-07-18', level: 'Level II — Walk-Around', state: 'VA',
    location: 'I-81 MM 104, Roadside', vehicle: VEHICLES['482'], oos: false,
    source: 'te', federalPending: true, patrol: 'Virginia State Police', inspectorName: 'R. Ostrowski', inspectorBadge: 'VSP-2109',
    reportDetails: 'Trackensure roadside ticket only — no matching FMCSA SAFER record yet. Typically appears within 2–4 weeks of the stop.',
    violations: [] },
  { id: 'VA-2026-041002', dot: '4158910', date: '2026-07-02', level: 'Level I — Full', state: 'VA',
    location: 'I-81 MM 96, Weigh Station', vehicle: VEHICLES['482'], oos: false,
    source: 'fmcsa', federalPending: false,
    violations: [
      { id: 'v4', code: '395.8', desc: 'ELD tampering / falsified device data', basic: 'Hours-of-Service Compliance', severity: 5, oos: false, type: 'ELD tampering', source: 'official' },
    ] },

  // Company 1 — 1902244
  { id: 'TX-2026-330091', dot: '1902244', date: '2026-08-29', level: 'Level I — Full', state: 'TX',
    location: 'I-35 MM 212, Weigh Station', vehicle: VEHICLES['118'], oos: true,
    source: 'fmcsa+te', federalPending: false, patrol: 'Texas DPS', inspectorName: 'J. Alvarado', inspectorBadge: 'TXDPS-6650',
    reportDetails: 'TE roadside ticket #TE-77004 matched — driver could not produce prior 7 days of logs on scene.',
    violations: [
      { id: 'v5', code: '395.8', desc: 'ELD tampering / falsified device data', basic: 'Hours-of-Service Compliance', severity: 9, oos: true, type: 'ELD tampering', source: 'preliminary' },
      { id: 'v6', code: '396.9', desc: 'Brake out of adjustment',               basic: 'Vehicle Maintenance',          severity: 7, oos: true, type: 'Vehicle defect', source: 'preliminary' },
    ] },
  { id: 'TX-2026-311204', dot: '1902244', date: '2026-08-14', level: 'Level I — Full', state: 'TX',
    location: 'I-10 MM 754, Weigh Station', vehicle: VEHICLES['205'], oos: true,
    source: 'fmcsa', federalPending: false,
    violations: [
      { id: 'v7', code: '395.8', desc: 'ELD tampering / falsified device data', basic: 'Hours-of-Service Compliance', severity: 8, oos: true, type: 'ELD tampering', source: 'preliminary' },
    ] },
  { id: 'OK-2026-208871', dot: '1902244', date: '2026-07-30', level: 'Level II — Walk-Around', state: 'OK',
    location: 'US-75, Roadside', vehicle: VEHICLES['118'], oos: false,
    source: 'fmcsa', federalPending: false,
    violations: [
      { id: 'v8', code: '395.8', desc: 'ELD tampering / falsified device data', basic: 'Hours-of-Service Compliance', severity: 6, oos: false, type: 'ELD tampering', source: 'official' },
    ] },

  // Company 2 — 2076111
  { id: 'TX-2026-298001', dot: '2076111', date: '2026-08-25', level: 'Level I — Full', state: 'TX',
    location: 'I-20 MM 445, Weigh Station', vehicle: VEHICLES['310'], oos: true,
    source: 'fmcsa', federalPending: false,
    violations: [
      { id: 'v9', code: '395.8', desc: 'ELD tampering / falsified device data', basic: 'Hours-of-Service Compliance', severity: 7, oos: true, type: 'ELD tampering', source: 'preliminary' },
    ] },
  { id: 'TX-2026-276650', dot: '2076111', date: '2026-08-05', level: 'Level I — Full', state: 'TX',
    location: 'I-20 MM 445, Weigh Station', vehicle: VEHICLES['310'], oos: false, source: 'fmcsa', federalPending: false, violations: [] },

  // Company 5 — 3075935 (clean record)
  { id: 'OH-2026-190044', dot: '3075935', date: '2026-08-15', level: 'Level I — Full', state: 'OH',
    location: 'I-75 MM 201, Weigh Station', vehicle: VEHICLES['041'], oos: false, source: 'fmcsa', federalPending: false, violations: [] },
  { id: 'OH-2026-165320', dot: '3075935', date: '2026-07-20', level: 'Level II — Walk-Around', state: 'OH',
    location: 'US-42, Roadside', vehicle: VEHICLES['041'], oos: false, source: 'fmcsa', federalPending: false, violations: [] },

  // Company 8 — 5522011
  { id: 'TN-2026-441209', dot: '5522011', date: '2026-08-27', level: 'Level I — Full', state: 'TN',
    location: 'I-40 MM 210, Weigh Station', vehicle: VEHICLES['558'], oos: true,
    source: 'fmcsa+te', federalPending: false, patrol: 'Tennessee Highway Patrol', inspectorName: 'C. Nash', inspectorBadge: 'THP-3390',
    reportDetails: 'TE roadside ticket #TE-91820 matched — ELD showed engine hours inconsistent with duty status.',
    violations: [
      { id: 'v10', code: '395.8', desc: 'ELD tampering / falsified device data', basic: 'Hours-of-Service Compliance', severity: 8, oos: true, type: 'ELD tampering', source: 'preliminary' },
      { id: 'v11', code: '393.75', desc: 'Tire tread depth insufficient', basic: 'Vehicle Maintenance', severity: 5, oos: true, type: 'Vehicle defect', source: 'preliminary' },
    ] },
  { id: 'MS-2026-330771', dot: '5522011', date: '2026-08-09', level: 'Level II — Walk-Around', state: 'MS',
    location: 'US-78, Roadside', vehicle: VEHICLES['558'], oos: false, source: 'fmcsa', federalPending: false,
    violations: [
      { id: 'v12', code: '395.8', desc: 'ELD tampering / falsified device data', basic: 'Hours-of-Service Compliance', severity: 6, oos: false, type: 'ELD tampering', source: 'preliminary' },
    ] },
  { id: 'TE-2026-005512', dot: '5522011', date: '2026-07-11', level: 'Level II — Walk-Around', state: 'TN',
    location: 'I-40 MM 188, Roadside', vehicle: VEHICLES['558'], oos: false,
    source: 'te', federalPending: true, patrol: 'Tennessee Highway Patrol', inspectorName: 'D. Ferris', inspectorBadge: 'THP-1187',
    reportDetails: 'Trackensure roadside ticket only — no matching FMCSA SAFER record yet.',
    violations: [] },

  // Company 12 — 9936655
  { id: 'OH-2026-509912', dot: '9936655', date: '2026-08-19', level: 'Level I — Full', state: 'OH',
    location: 'I-71 MM 148, Weigh Station', vehicle: VEHICLES['612'], oos: true, source: 'fmcsa', federalPending: false,
    violations: [
      { id: 'v13', code: '395.8', desc: 'ELD tampering / falsified device data', basic: 'Hours-of-Service Compliance', severity: 7, oos: true, type: 'ELD tampering', source: 'preliminary' },
    ] },
  { id: 'IN-2026-611203', dot: '9936655', date: '2026-07-26', level: 'Level II — Walk-Around', state: 'IN',
    location: 'I-70, Roadside', vehicle: VEHICLES['612'], oos: false, source: 'fmcsa', federalPending: false, violations: [] },

  // Company 19 — 1604422
  { id: 'VA-2026-661120', dot: '1604422', date: '2026-08-31', level: 'Level I — Full', state: 'VA',
    location: 'I-95 MM 84, Weigh Station', vehicle: VEHICLES['612'], oos: true,
    source: 'fmcsa+te', federalPending: false, patrol: 'Virginia State Police', inspectorName: 'K. Doss', inspectorBadge: 'VSP-5527',
    reportDetails: 'TE roadside ticket #TE-90071 matched — repeat ELD tampering flag, third stop in 90 days.',
    violations: [
      { id: 'v14', code: '395.8', desc: 'ELD tampering / falsified device data', basic: 'Hours-of-Service Compliance', severity: 9, oos: true, type: 'ELD tampering', source: 'preliminary' },
    ] },
  { id: 'NC-2026-772041', dot: '1604422', date: '2026-08-10', level: 'Level I — Full', state: 'NC',
    location: 'I-85 MM 68, Weigh Station', vehicle: VEHICLES['612'], oos: true, source: 'fmcsa', federalPending: false,
    violations: [
      { id: 'v15', code: '395.8', desc: 'ELD tampering / falsified device data', basic: 'Hours-of-Service Compliance', severity: 8, oos: true, type: 'ELD tampering', source: 'preliminary' },
    ] },
  { id: 'MD-2026-882290', dot: '1604422', date: '2026-07-15', level: 'Level II — Walk-Around', state: 'MD',
    location: 'I-81, Roadside', vehicle: VEHICLES['612'], oos: false, source: 'fmcsa', federalPending: false,
    violations: [
      { id: 'v16', code: '395.8', desc: 'ELD tampering / falsified device data', basic: 'Hours-of-Service Compliance', severity: 5, oos: false, type: 'ELD tampering', source: 'official' },
    ] },
  { id: 'VA-2026-903341', dot: '1604422', date: '2026-06-28', level: 'Level I — Full', state: 'VA',
    location: 'I-95 MM 84, Weigh Station', vehicle: VEHICLES['612'], oos: false, source: 'fmcsa', federalPending: false,
    violations: [
      { id: 'v17', code: '395.8', desc: 'ELD tampering / falsified device data', basic: 'Hours-of-Service Compliance', severity: 4, oos: false, type: 'ELD tampering', source: 'official' },
    ] },

  // Company 20 — 1715533 (clean record)
  { id: 'SC-2026-220981', dot: '1715533', date: '2026-08-06', level: 'Level I — Full', state: 'SC',
    location: 'I-85 MM 22, Weigh Station', vehicle: VEHICLES['041'], oos: false, source: 'fmcsa', federalPending: false, violations: [] },
];

/* Crash records — FMCSA MCMIS-style fields. */
const CRASHES = {
  '1902244': [
    { date: '2026-08-11', time: '14:22', location: 'GRAND PRAIRIE, TX', road: 'I-30', county: 'Dallas', vehicles: 2, vehicle: VEHICLES['118'],
      weather: 'No adverse conditions', lighting: 'Daylight', surface: 'Dry', roadway: 'Two-way, divided, unprotected median',
      sequence: '1:20:COLLISION INVOLVING OTHER MOVABLE OBJECT', reportedBy: 'DALLAS PD', towAway: true, injured: 1, fatalities: 1 },
    { date: '2026-05-03', time: '06:40', location: 'WACO, TX', road: 'I-35', county: 'McLennan', vehicles: 1, vehicle: VEHICLES['205'],
      weather: 'Rain', lighting: 'Dark – not lighted', surface: 'Wet',
      sequence: '1:18:COLLISION INVOLVING FIXED OBJECT', reportedBy: 'TEXAS DPS', towAway: true, injured: 0, fatalities: 0 },
    { date: '2025-11-19', time: '17:05', location: 'AUSTIN, TX', road: 'US-183', county: 'Travis', vehicles: 2, vehicle: VEHICLES['118'],
      weather: 'No adverse conditions', lighting: 'Daylight', surface: 'Dry',
      sequence: '1:20:COLLISION INVOLVING OTHER MOVABLE OBJECT', reportedBy: 'AUSTIN PD', towAway: false, injured: 1, fatalities: 0 },
  ],
  '2076111': [
    { date: '2026-06-27', time: '09:12', location: 'ARLINGTON, TX', road: 'I-20', county: 'Tarrant', vehicles: 2, vehicle: VEHICLES['310'],
      weather: 'No adverse conditions', lighting: 'Daylight', surface: 'Dry',
      sequence: '1:20:COLLISION INVOLVING OTHER MOVABLE OBJECT', reportedBy: 'ARLINGTON PD', towAway: true, injured: 0, fatalities: 0 },
  ],
  '4158910': [
    { date: '2026-07-14', time: '22:31', location: 'ROANOKE, VA', road: 'I-81', county: 'Roanoke', vehicles: 2, vehicle: VEHICLES['482'],
      weather: 'No adverse conditions', lighting: 'Dark – not lighted', surface: 'Dry',
      sequence: '1:20:COLLISION INVOLVING OTHER MOVABLE OBJECT', reportedBy: 'VIRGINIA STATE POLICE', towAway: true, injured: 0, fatalities: 0 },
    { date: '2025-09-30', time: '05:52', location: 'GREENSBORO, NC', road: 'I-40', county: 'Guilford', vehicles: 1, vehicle: VEHICLES['482'],
      weather: 'Fog', lighting: 'Dark – not lighted', surface: 'Wet',
      sequence: '1:18:COLLISION INVOLVING FIXED OBJECT', reportedBy: 'NC HIGHWAY PATROL', towAway: true, injured: 0, fatalities: 0 },
  ],
  '3075935': [],
  '5522011': [
    { date: '2026-04-02', time: '11:47', location: 'JACKSON, MS', road: 'I-55', county: 'Hinds', vehicles: 2, vehicle: VEHICLES['558'],
      weather: 'No adverse conditions', lighting: 'Daylight', surface: 'Dry',
      sequence: '1:20:COLLISION INVOLVING OTHER MOVABLE OBJECT', reportedBy: 'MISSISSIPPI HP', towAway: true, injured: 1, fatalities: 0 },
  ],
  '9936655': [],
  '1604422': [
    { date: '2026-03-19', time: '19:03', location: 'FREDERICKSBURG, VA', road: 'I-95', county: 'Spotsylvania', vehicles: 3, vehicle: VEHICLES['612'],
      weather: 'Rain', lighting: 'Dark – lighted', surface: 'Wet',
      sequence: '1:20:COLLISION INVOLVING OTHER MOVABLE OBJECT', reportedBy: 'VIRGINIA STATE POLICE', towAway: true, injured: 2, fatalities: 0 },
  ],
  '1715533': [],
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
  '5522011': [
    { insurer: 'CANAL INSURANCE COMPANY', policyNum: '#CN9021144', coverageMax: 1000000, from: '2021-06-30', to: null, status: 'Active' },
  ],
  '9936655': [
    { insurer: 'GREAT WEST CASUALTY COMPANY', policyNum: '#GW1128870', coverageMax: 1000000, from: '2018-12-22', to: null, status: 'Active' },
  ],
  '1604422': [
    { insurer: 'NORTHLAND INSURANCE COMPANY', policyNum: '#NL5502231', coverageMax: 750000, from: '2019-01-08', to: null, status: 'Active' },
  ],
  '1715533': [
    { insurer: 'OLD REPUBLIC INSURANCE COMPANY', policyNum: '#OR7734410', coverageMax: 1000000, from: '2010-06-04', to: null, status: 'Active' },
  ],
};

/* Official FMCSA SMS BASIC categories. `alert` mirrors the FMCSA `*_ac` flag —
   carrier is at or over the intervention threshold for that BASIC. */
const SMS_BASICS = {
  '1902244': [
    { category: 'Unsafe Driving', measure: 3.12, inspections: 88, violations: 22, alert: true },
    { category: 'Hours-of-Service Compliance', measure: 4.05, inspections: 88, violations: 31, alert: true },
    { category: 'Driver Fitness', measure: 0.42, inspections: 88, violations: 3, alert: false },
    { category: 'Controlled Substances/Alcohol', measure: 0, inspections: 88, violations: 0, alert: false },
    { category: 'Vehicle Maintenance', measure: 2.90, inspections: 88, violations: 19, alert: true },
  ],
  '2076111': [
    { category: 'Unsafe Driving', measure: 1.05, inspections: 44, violations: 6, alert: false },
    { category: 'Hours-of-Service Compliance', measure: 0.88, inspections: 44, violations: 5, alert: false },
    { category: 'Driver Fitness', measure: 0, inspections: 44, violations: 0, alert: false },
    { category: 'Controlled Substances/Alcohol', measure: 0, inspections: 44, violations: 0, alert: false },
    { category: 'Vehicle Maintenance', measure: 1.20, inspections: 44, violations: 7, alert: false },
  ],
  '4158910': [
    { category: 'Unsafe Driving', measure: 0.61, inspections: 36, violations: 3, alert: false },
    { category: 'Hours-of-Service Compliance', measure: 2.18, inspections: 36, violations: 12, alert: true },
    { category: 'Driver Fitness', measure: 0, inspections: 36, violations: 0, alert: false },
    { category: 'Controlled Substances/Alcohol', measure: 0, inspections: 36, violations: 0, alert: false },
    { category: 'Vehicle Maintenance', measure: 0.94, inspections: 36, violations: 4, alert: false },
  ],
  '3075935': [
    { category: 'Unsafe Driving', measure: 0.10, inspections: 20, violations: 1, alert: false },
    { category: 'Hours-of-Service Compliance', measure: 0, inspections: 20, violations: 0, alert: false },
    { category: 'Driver Fitness', measure: 0, inspections: 20, violations: 0, alert: false },
    { category: 'Controlled Substances/Alcohol', measure: 0, inspections: 20, violations: 0, alert: false },
    { category: 'Vehicle Maintenance', measure: 0.05, inspections: 20, violations: 1, alert: false },
  ],
  '5522011': [
    { category: 'Unsafe Driving', measure: 2.20, inspections: 51, violations: 14, alert: true },
    { category: 'Hours-of-Service Compliance', measure: 2.75, inspections: 51, violations: 16, alert: true },
    { category: 'Driver Fitness', measure: 0.30, inspections: 51, violations: 2, alert: false },
    { category: 'Controlled Substances/Alcohol', measure: 0, inspections: 51, violations: 0, alert: false },
    { category: 'Vehicle Maintenance', measure: 1.95, inspections: 51, violations: 11, alert: false },
  ],
  '9936655': [
    { category: 'Unsafe Driving', measure: 1.40, inspections: 39, violations: 9, alert: false },
    { category: 'Hours-of-Service Compliance', measure: 1.62, inspections: 39, violations: 10, alert: false },
    { category: 'Driver Fitness', measure: 0.12, inspections: 39, violations: 1, alert: false },
    { category: 'Controlled Substances/Alcohol', measure: 0, inspections: 39, violations: 0, alert: false },
    { category: 'Vehicle Maintenance', measure: 1.05, inspections: 39, violations: 6, alert: false },
  ],
  '1604422': [
    { category: 'Unsafe Driving', measure: 3.80, inspections: 62, violations: 26, alert: true },
    { category: 'Hours-of-Service Compliance', measure: 4.61, inspections: 62, violations: 33, alert: true },
    { category: 'Driver Fitness', measure: 0.55, inspections: 62, violations: 4, alert: false },
    { category: 'Controlled Substances/Alcohol', measure: 0.20, inspections: 62, violations: 1, alert: false },
    { category: 'Vehicle Maintenance', measure: 3.05, inspections: 62, violations: 20, alert: true },
  ],
  '1715533': [
    { category: 'Unsafe Driving', measure: 0.08, inspections: 28, violations: 1, alert: false },
    { category: 'Hours-of-Service Compliance', measure: 0, inspections: 28, violations: 0, alert: false },
    { category: 'Driver Fitness', measure: 0, inspections: 28, violations: 0, alert: false },
    { category: 'Controlled Substances/Alcohol', measure: 0, inspections: 28, violations: 0, alert: false },
    { category: 'Vehicle Maintenance', measure: 0.10, inspections: 28, violations: 1, alert: false },
  ],
};

/* Safety Score, trailing months (for the trend chart). Higher = safer. */
const SCORE_HISTORY = {
  '1902244': [41, 39, 38, 35, 33, 30, 29, 27, 26, 25, 24, 24],
  '2076111': [58, 59, 61, 60, 62, 64, 63, 65, 66, 67, 66, 67],
  '4158910': [47, 48, 46, 49, 50, 48, 52, 51, 53, 52, 50, 51],
  '3075935': [84, 85, 86, 86, 87, 88, 88, 89, 89, 90, 90, 90],
  '5522011': [52, 50, 49, 47, 46, 44, 43, 41, 40, 39, 38, 38],
  '9936655': [90, 89, 88, 87, 86, 85, 85, 84, 83, 82, 82, 82],
  '1604422': [55, 52, 49, 47, 45, 43, 41, 39, 37, 36, 35, 34],
  '1715533': [80, 81, 82, 83, 84, 85, 86, 86, 87, 87, 88, 88],
};

/* ---- lookup helpers ---- */
function getCompany(dot) { return COMPANIES.find(c => c.dot === dot); }
function getProvider(id) { return PROVIDERS.find(p => p.id === id); }
function getInspection(id) { return INSPECTIONS.find(i => i.id === id); }
function getInspectionsForCompany(dot) { return INSPECTIONS.filter(i => i.dot === dot).sort((a, b) => b.date.localeCompare(a.date)); }
function getViolationsForCompany(dot) {
  const out = [];
  for (const insp of getInspectionsForCompany(dot)) {
    for (const v of insp.violations) out.push({ ...v, inspectionId: insp.id, date: insp.date });
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}
/** Score tiers — ONLY meaningful when the company/provider has hasDetail/enriched
    data. Callers must check that separately (see scorePill in app.js): this
    function alone never signals "no data". */
function scoreTier(score) {
  if (score >= 75) return { label: 'Minimal', cls: 'pill-minimal' };
  if (score >= 40) return { label: 'Elevated', cls: 'pill-elevated' };
  return { label: 'Critical', cls: 'pill-critical' };
}
function fmtDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}
function fmtDateTime(dt) { return dt.replace(' ', ', '); }
function fmtMiles(n) { return n.toLocaleString('en-US'); }
function pluralize(n, singular, plural) { return n === 1 ? singular : (plural || singular + 's'); }
/* Was there an FMCSA ELD data upload on the same calendar day as `date` (YYYY-MM-DD)?
   Returns 'success' | 'failed' | 'none' (matching the real UI's Yes/No/— pill). */
function uploadOnDate(dot, date) {
  const list = UPLOADS[dot] || [];
  const hit = list.find(u => u.datetime.startsWith(date));
  return hit ? hit.status : 'none';
}
function uploadRecordOnDate(dot, date) {
  const list = UPLOADS[dot] || [];
  return list.find(u => u.datetime.startsWith(date)) || null;
}

/* ---------------------------------------------------------------------------
   Inspections-volume time series (drives inspections.html). Purely synthetic —
   deterministic per (state, bucket key) so the page looks the same on reload,
   independent from the small hand-authored INSPECTIONS array above (which only
   covers the handful of companies with detailed drill-down records).
--------------------------------------------------------------------------- */

function stateBaseline(code) {
  const s = STATES.find(x => x.code === code);
  return s ? Math.max(20, s.inspections) : 60;
}
function allStatesBaseline() { return STATES.reduce((s, x) => s + x.inspections, 0); }
function tamperRateFor(code) {
  const s = code ? STATES.find(x => x.code === code) : null;
  if (s && s.inspections) return s.count / s.inspections;
  const total = STATES.reduce((s2, x) => s2 + x.inspections, 0);
  const cases = STATES.reduce((s2, x) => s2 + x.count, 0);
  return total ? cases / total : 0.03;
}

function isoLocal(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }

/** Generate the buckets + totals + carrier rows for the Inspections page.
    granularity: 'hour' | 'day' | 'month'. from/to: 'YYYY-MM-DD'. state: code or ''. */
function buildInspectionSeries(granularity, from, to, state) {
  const baseline = state ? stateBaseline(state) : allStatesBaseline();
  const rate = tamperRateFor(state);
  const buckets = [];

  if (granularity === 'hour') {
    const dayVolume = Math.max(4, Math.round(baseline / 60));
    for (let h = 0; h < 24; h++) {
      const key = `${from}T${String(h).padStart(2, '0')}`;
      const weight = h >= 6 && h <= 20 ? 1 : 0.25; // daytime-heavy, like real weigh-station traffic
      const count = Math.round(seededRand(key + '-c') * dayVolume * weight * 0.6 + dayVolume * weight * 0.3);
      const oos = Math.round(count * (0.14 + seededRand(key + '-o') * 0.1));
      const tamperings = Math.round(count * rate * (0.6 + seededRand(key + '-t') * 0.8));
      buckets.push({ key, label: `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? 'am' : 'pm'}`, start: from, count, oos, tamperings });
    }
  } else if (granularity === 'day') {
    const [y, m] = from.split('-').map(Number);
    const [y2, m2, d2] = to.split('-').map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y2, m2 - 1, d2);
    const dayVolume = Math.max(3, Math.round(baseline / 30));
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = isoLocal(d);
      const dow = d.getDay();
      const weight = (dow === 0 || dow === 6) ? 0.45 : 1; // lighter on weekends
      const count = Math.round((dayVolume * weight) * (0.6 + seededRand(key + '-c') * 0.8));
      const oos = Math.round(count * (0.14 + seededRand(key + '-o') * 0.1));
      const tamperings = Math.round(count * rate * (0.6 + seededRand(key + '-t') * 0.8));
      buckets.push({ key, label: String(d.getDate()), start: key, count, oos, tamperings });
    }
  } else { // month
    const year = Number(from.split('-')[0]);
    const monthVolume = Math.max(10, Math.round(baseline / 2.2));
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    for (let m = 0; m < 12; m++) {
      const key = `${year}-${String(m + 1).padStart(2, '0')}`;
      const count = Math.round(monthVolume * (0.7 + seededRand(key + '-c') * 0.6));
      const oos = Math.round(count * (0.14 + seededRand(key + '-o') * 0.1));
      const tamperings = Math.round(count * rate * (0.6 + seededRand(key + '-t') * 0.8));
      buckets.push({ key, label: MONTHS[m], start: `${key}-01`, count, oos, tamperings });
    }
  }

  const total = buckets.reduce((s, b) => s + b.count, 0);
  const oosTotal = buckets.reduce((s, b) => s + b.oos, 0);
  const tamperingsTotal = buckets.reduce((s, b) => s + b.tamperings, 0);

  // carrier rows: synthetic per-company volume for the period, scaled by the
  // company's own tamperings/oosRate so the table stays internally consistent.
  const periodKey = `${granularity}|${from}|${to}|${state || 'all'}`;
  const scopedCompanies = COMPANIES.filter(c => !state || getInspectionsForCompany(c.dot).some(i => i.state === state) || seededRand(c.dot + periodKey) > 0.5);
  const carriers = COMPANIES
    .map(c => {
      const share = seededRand(c.dot + periodKey);
      const count = Math.max(0, Math.round((total / Math.max(6, COMPANIES.length)) * (0.3 + share * 1.6)));
      if (count === 0) return null;
      const oos = Math.round(count * (0.08 + seededRand(c.dot + periodKey + 'o') * 0.2));
      const tamperings = c.tamperings > 0 ? Math.min(count, Math.round(count * (0.05 + seededRand(c.dot + periodKey + 't') * 0.15))) : 0;
      return { dot: c.dot, name: c.name, provider: c.provider, count, oos, tamperings, score: c.score, hasDetail: c.hasDetail, client: c.client, active: c.active };
    })
    .filter(Boolean)
    .sort((a, b) => b.count - a.count);

  return { granularity, from, to, state: state || null, buckets, total, oosTotal, tamperingsTotal, carriers };
}
