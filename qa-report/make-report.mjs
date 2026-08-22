/**
 * Builds My_World_City_Bug_Report.xlsx from results.json + code review.
 * Usage: node qa-report/make-report.mjs
 */
import ExcelJS from 'exceljs'
import fs from 'fs'
import path from 'path'

const DIR = path.join(process.cwd(), 'qa-report')
const run = JSON.parse(fs.readFileSync(path.join(DIR, 'results.json'), 'utf8'))
const when = new Date(run.when).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
const avgMs = Math.round(run.perf.reduce((s, p) => s + p.ms, 0) / run.perf.length)

const SEV = { Blocker: 'FF7030A0', Critical: 'FFC00000', High: 'FFED7D31', Medium: 'FFFFC000', Low: 'FF9DC3E6' }
const white = (s) => (s === 'Low' || s === 'Medium' ? 'FF000000' : 'FFFFFFFF')

const bugs = [
  {
    id: 'BUG-01', sev: 'Blocker', area: 'Registration',
    title: 'No new user can register - photo upload blocks the only signup path',
    steps: '1. Log out.\n2. Open /list-property.\n3. Enter a title, click Continue.\n4. On step 2 (Photos) upload any image.',
    expected: 'Photo uploads and the wizard advances to step 3.',
    actual: 'POST /api/upload returns 401 "Authentication required" because the route calls requireUser(). The wizard will not advance without a photo (Continue stays disabled), so the guest is stuck. As /list-property is the ONLY route that creates an account (there is no signup form), no new user can register through the website at all.',
    where: 'app/api/upload/route.js line 13; app/list-property/page.jsx line 94',
    found: 'TC-14 (automated)',
    fix: 'Allow unauthenticated uploads to a quarantined folder with strict rate limiting, or collect contact details before the photo step so the session exists first.',
  },
  {
    id: 'BUG-02', sev: 'Critical', area: 'Security',
    title: 'Any visitor can grant themselves admin access',
    steps: '1. Log out.\n2. Submit a listing at /list-property using an admin phone number (e.g. 9990001111 from the handover document).',
    expected: 'Admin rights are grantable only by an existing administrator, after phone ownership is verified.',
    actual: 'The account is created, syncAdminRole() adds the "admin" role because the number appears in ADMIN_PHONES, and the visitor is logged in with full admin rights. With OTP removed, nothing verifies phone ownership. The "already registered" guard only blocks numbers that already have a password - 9990001111 has none.',
    where: 'app/api/listings/submit/route.js lines 69-104; lib/auth/roles.js line 15',
    found: 'Code review + database audit (not exploited)',
    fix: 'Grant admin only through an existing admin action, or re-introduce phone verification before syncAdminRole runs.',
  },
  {
    id: 'BUG-03', sev: 'Critical', area: 'Security',
    title: 'Live database username and password committed to the repository',
    steps: '1. Open lib/db.js and read line 3.',
    expected: 'Credentials come only from environment variables.',
    actual: 'A full MongoDB Atlas connection string with username and password is hardcoded as a fallback and is present in git history. Anyone with repository access has full read/write/delete on production data. Verified live during testing.',
    where: 'lib/db.js line 3',
    found: 'Code review + verified live connection',
    fix: 'Rotate the password in Atlas, remove the fallback, and purge it from git history. Deleting the line alone is not enough.',
  },
  {
    id: 'BUG-04', sev: 'Critical', area: 'Security',
    title: 'Database connection string printed to logs on every request',
    steps: '1. Start the server and make any database-backed request.\n2. Observe the server console.',
    expected: 'Secrets are never logged.',
    actual: 'console.log(process.env.MONGODB_URI, "check env are work or not") runs on every import. In production on AWS Amplify this writes the credentials permanently into CloudWatch logs.',
    where: 'lib/db.js line 4',
    found: 'Observed in server output',
    fix: 'Delete the console.log statement.',
  },
  {
    id: 'BUG-05', sev: 'Critical', area: 'Authentication',
    title: 'Documented admin credentials do not work - 6 of 8 accounts cannot log in',
    steps: '1. Open /login.\n2. Enter 9990001111 (admin number from the handover document) with any password.',
    expected: 'Per the handover document, this number grants admin access.',
    actual: 'Always rejected with "Invalid phone number or password". The account has no stored password because it was created under the OTP flow that has since been removed, so no password can ever authenticate it. Database audit: only 9024877439 and 9812345678 have passwords; the other six accounts are permanently unusable.',
    where: 'app/api/auth/login/route.js line 21; users collection',
    found: 'TC-11 (automated) + database audit',
    fix: 'Migrate the OTP-era accounts by issuing temporary passwords, and add a password-set flow.',
  },
  {
    id: 'BUG-06', sev: 'High', area: 'Authentication',
    title: 'No password recovery - a lost password locks the account out permanently',
    steps: '1. Open /login and look for a forgot-password option.',
    expected: 'Self-service password recovery.',
    actual: 'No forgot/reset password link exists anywhere. The temporary password issued during listing submission is shown once on the success screen and is never emailed or texted. If the user misses it, only manual database editing can restore access.',
    where: 'app/login/page.jsx; no reset route exists',
    found: 'TC-12 (automated)',
    fix: 'Add a password reset flow.',
  },
  {
    id: 'BUG-07', sev: 'High', area: 'Documentation',
    title: 'Handover document describes an OTP login that does not exist',
    steps: '1. Read section 2 of the handover document.\n2. Open /login and compare.',
    expected: 'Documentation matches the build.',
    actual: 'There is no OTP anywhere in the codebase - no Otp model, no send/verify route, no SMS code. Login is phone + password. SMS_PROVIDER, MSG91_* and TWILIO_* appear only in amplify.yml, never in application code. The document also lists "/lib/auth - Session & OTP logic" (only session logic exists), states "Deployment Target: Vercel" (the repo ships amplify.yml for AWS Amplify), and says "Missing Cloudinary: Placeholder images are used" (uploads are actually stored as base64 data URLs in MongoDB). An empty "otps" collection remains as a leftover.',
    where: 'Handover document sections 1-4; README.md lines 20, 44, 73',
    found: 'TC-10 (automated) + full code review',
    fix: 'Rewrite the handover document and README to match the current build.',
  },
  {
    id: 'BUG-08', sev: 'High', area: 'Configuration',
    title: 'Environment file ships with placeholders that break every database feature',
    steps: '1. Inspect .env as delivered.\n2. Start the app and try to log in.',
    expected: 'Working configuration or a loud startup failure.',
    actual: 'MONGODB_URI and SESSION_SECRET were both the literal string "...". Every database route returned 500 "Internal server error", and SESSION_SECRET at 3 characters is below the 16-character minimum, which throws on the first successful login. The homepage still returned 200 because the featured-properties component silently falls back to static content, hiding the outage. Fixed during this engagement and re-verified.',
    where: '.env; lib/db.js line 20; lib/auth/session.js line 9',
    found: 'Reproduced live, then fixed',
    fix: 'Ship a valid .env.example and fail fast at startup when required variables are missing.',
  },
  {
    id: 'BUG-09', sev: 'Medium', area: 'Property search',
    title: 'Locality filter silently discards all but the first selection',
    steps: '1. Open /find-property.\n2. Tick Sitapura, Jagatpura and Mansarovar.\n3. Click Apply Filters and inspect the API request.',
    expected: 'All ticked localities are applied.',
    actual: 'The API receives locality="Sitapura" only. The other selections are dropped with no message, so the user believes they are viewing three localities when they are viewing one.',
    where: 'components/listing/FilterSidebar.jsx line 62',
    found: 'TC-05 (automated, network request captured)',
    fix: 'Send a comma-separated list and use $in server-side, or make the control single-select.',
  },
  {
    id: 'BUG-10', sev: 'Medium', area: 'Expert directory',
    title: 'Experience filter has no effect',
    steps: '1. Open /experts.\n2. Click Apply Filters (baseline).\n3. Select "15+ Years" and click Apply Filters again.',
    expected: 'The grid narrows to experts with 15+ years.',
    actual: 'The grid is unchanged. The selection is held in component state that is never read - only the Domain group is passed to onApply.',
    where: 'components/experts/ExpertFilters.jsx line 68',
    found: 'TC-06 (automated, domain held constant)',
    fix: 'Include experience in the onApply payload and filter on it.',
  },
  {
    id: 'BUG-11', sev: 'Medium', area: 'Expert directory',
    title: 'Location filter has no effect',
    steps: '1. Open /experts.\n2. Click Apply Filters (baseline).\n3. Tick a location and click Apply Filters again.',
    expected: 'The grid narrows to experts in that location.',
    actual: 'The grid is unchanged. Same root cause as BUG-10 - the location state is never passed to onApply.',
    where: 'components/experts/ExpertFilters.jsx line 68',
    found: 'TC-07 (automated)',
    fix: 'Include location in the onApply payload and filter on it.',
  },
  {
    id: 'BUG-12', sev: 'Medium', area: 'Performance',
    title: 'No image optimization anywhere in the application',
    steps: '1. Open /find-property and inspect the rendered image tags.',
    expected: 'next/image with resizing, WebP and lazy loading.',
    actual: '19 images on the page, 0 served through next/image, 0 lazy-loaded. Every image is a raw <img> pointing at a full-size original, so the remotePatterns config in next.config.mjs is unused. Average page load measured at ' + avgMs + 'ms in development.',
    where: 'All components; next.config.mjs',
    found: 'TC-23 (automated)',
    fix: 'Replace <img> with next/image, starting with property cards and the gallery.',
  },
  {
    id: 'BUG-13', sev: 'Medium', area: 'Accessibility / SEO',
    title: 'Missing alt text on the homepage and no H1 on the listing page',
    steps: '1. Open the homepage and inspect image alt attributes.\n2. Open /find-property and count H1 headings.',
    expected: 'Every image has descriptive alt text; each page has exactly one H1.',
    actual: '4 of 19 homepage images have empty or missing alt attributes. /find-property has 0 H1 headings, which harms both screen-reader navigation and search ranking for the most commercially important page on the site.',
    where: 'components/Gallery.jsx, components/Insights.jsx; app/find-property/page.jsx',
    found: 'TC-24 (automated)',
    fix: 'Add descriptive alt text and a visible H1 such as "Find Property in Jaipur".',
  },
  {
    id: 'BUG-14', sev: 'Medium', area: 'Admin console',
    title: 'Enquiry list silently truncates at 300 records',
    steps: '1. Create more than 300 leads.\n2. Open /admin/enquiries.',
    expected: 'Pagination, or a warning that results are truncated.',
    actual: 'The API hard-caps at .limit(300) with no pagination and the page filters client-side. Enquiry 301 onwards disappears from the admin panel with no indication, so genuine customer enquiries would be lost from view.',
    where: 'app/api/admin/leads/route.js line 33',
    found: 'Code review',
    fix: 'Add server-side pagination and filtering.',
  },
  {
    id: 'BUG-15', sev: 'Low', area: 'UX',
    title: 'Missing favicon causes a 404 on every page load',
    steps: '1. Open any page and check the network tab.',
    expected: 'A favicon is served.',
    actual: 'GET /favicon.ico returns 404 on every page view and logs a console error. This and the upload 401 were the only unexpected failing requests across the run; all other non-200 responses were deliberately triggered by negative tests.',
    where: 'app/ (no icon file present)',
    found: 'TC-26 (automated)',
    fix: 'Add app/icon.png or app/favicon.ico.',
  },
]

/* --------------------------------------------------------------- build */
const wb = new ExcelJS.Workbook()
wb.creator = 'QA - automated Puppeteer suite'
wb.created = new Date()

const B = {
  top: { style: 'thin', color: { argb: 'FFD9D9D9' } }, left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
  bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } }, right: { style: 'thin', color: { argb: 'FFD9D9D9' } },
}
const banner = (ws, txt, span) => {
  const r = ws.addRow([txt])
  ws.mergeCells(`A${r.number}:${span}${r.number}`)
  r.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } }
  r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B2547' } }
  r.height = 26; r.alignment = { vertical: 'middle', indent: 1 }
}
const head = (ws, cells) => {
  const r = ws.addRow(cells)
  r.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F5FBF' } }
  r.alignment = { vertical: 'middle', wrapText: true }; r.height = 24
  r.eachCell((c) => (c.border = B))
}

/* Sheet 1 - Summary */
const s1 = wb.addWorksheet('Summary')
s1.columns = [{ width: 30 }, { width: 78 }]
banner(s1, 'My World City - QA Test Report', 'B')
s1.addRow([])
const pass = run.results.filter((r) => r.status === 'PASS').length
const fail = run.results.filter((r) => r.status === 'FAIL').length
;[
  ['Project', 'My World City - Jaipur property marketplace'],
  ['Test approach', 'Automated browser testing with Puppeteer (headless Chrome), plus source-code review'],
  ['Environment', `Local development build, ${run.base}`],
  ['Viewports', 'Desktop 1440x900 and mobile 390x844'],
  ['Date executed', when],
  ['Credentials used', 'Admin phone 9990001111 and seed secret, as supplied in the handover document'],
  ['Test cases executed', `${run.results.length}`],
  ['Passed / Failed', `${pass} passed, ${fail} failed`],
  ['Defects raised', `${bugs.length}`],
  ['Average page load', `${avgMs} ms (development build)`],
  ['Test data', 'A temporary owner account, listing and enquiry were created under phone 7000000001, then fully removed. Database verified back to its original 8 users / 8 properties / 3 leads.'],
].forEach(([k, v]) => {
  const r = s1.addRow([k, v])
  r.getCell(1).font = { bold: true }
  r.getCell(2).alignment = { wrapText: true, vertical: 'top' }
})

s1.addRow([])
head(s1, ['Severity', 'Count'])
for (const sev of ['Blocker', 'Critical', 'High', 'Medium', 'Low']) {
  const n = bugs.filter((b) => b.sev === sev).length
  if (!n) continue
  const r = s1.addRow([sev, n])
  r.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: SEV[sev] } }
  r.getCell(1).font = { bold: true, color: { argb: white(sev) } }
  r.eachCell((c) => (c.border = B))
}

s1.addRow([])
const ph = s1.addRow(['RECOMMENDED FIX ORDER'])
ph.font = { bold: true, size: 12 }
;[
  'BUG-01 - Nobody can register. The signup path is completely blocked, so the site cannot take on a single new user.',
  'BUG-03 / BUG-04 - Rotate the exposed database password and stop logging it.',
  'BUG-02 - Close the admin self-escalation hole before any public deployment.',
  'BUG-05 / BUG-06 - Restore login access and add password recovery.',
  'BUG-07 - Correct the handover document so the next developer is not misled.',
].forEach((t) => {
  const r = s1.addRow([t])
  s1.mergeCells(`A${r.number}:B${r.number}`)
  r.getCell(1).alignment = { wrapText: true, vertical: 'top' }
})

/* Sheet 2 - Bug Report */
const s2 = wb.addWorksheet('Bug Report', { views: [{ state: 'frozen', ySplit: 2 }] })
s2.columns = [
  { width: 9 }, { width: 10 }, { width: 18 }, { width: 40 }, { width: 38 },
  { width: 32 }, { width: 62 }, { width: 30 }, { width: 22 }, { width: 40 }, { width: 9 },
]
banner(s2, 'Defect log', 'K')
head(s2, ['Bug ID', 'Severity', 'Area', 'Summary', 'Steps to Reproduce', 'Expected Result', 'Actual Result', 'Location in Code', 'How Found', 'Suggested Fix', 'Status'])
bugs.forEach((b) => {
  const r = s2.addRow([b.id, b.sev, b.area, b.title, b.steps, b.expected, b.actual, b.where, b.found, b.fix, 'Open'])
  r.alignment = { vertical: 'top', wrapText: true }
  r.getCell(1).font = { bold: true }
  const c = r.getCell(2)
  c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: SEV[b.sev] } }
  c.font = { bold: true, color: { argb: white(b.sev) } }
  c.alignment = { vertical: 'top', horizontal: 'center' }
  r.getCell(11).alignment = { vertical: 'top', horizontal: 'center' }
  r.eachCell((x) => (x.border = B))
})
s2.autoFilter = { from: { row: 2, column: 1 }, to: { row: 2 + bugs.length, column: 11 } }

/* Sheet 3 - Test Execution */
const s3 = wb.addWorksheet('Test Execution', { views: [{ state: 'frozen', ySplit: 2 }] })
s3.columns = [{ width: 9 }, { width: 18 }, { width: 46 }, { width: 10 }, { width: 42 }, { width: 70 }, { width: 28 }]
banner(s3, `Automated test execution - ${when}`, 'G')
head(s3, ['Test ID', 'Area', 'Test Case', 'Result', 'Expected', 'Actual', 'Screenshot'])
run.results.forEach((t) => {
  const r = s3.addRow([t.id, t.area, t.name, t.status, t.expected, t.actual, t.evidence || '-'])
  r.alignment = { vertical: 'top', wrapText: true }
  const ok = t.status === 'PASS'
  const c = r.getCell(4)
  c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ok ? 'FFC6EFCE' : 'FFFFC7CE' } }
  c.font = { bold: true, color: { argb: ok ? 'FF006100' : 'FF9C0006' } }
  c.alignment = { vertical: 'top', horizontal: 'center' }
  r.eachCell((x) => (x.border = B))
})
s3.autoFilter = { from: { row: 2, column: 1 }, to: { row: 2 + run.results.length, column: 7 } }

const out = path.join(DIR, 'My_World_City_Bug_Report.xlsx')
await wb.xlsx.writeFile(out)
console.log('Written:', out)
console.log(`Summary | Bug Report (${bugs.length} defects) | Test Execution (${run.results.length} tests)`)
