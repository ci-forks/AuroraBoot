// Drive the AuroraBoot artifact builder wizard and record the create payload,
// then read back what the server stored for the artifact.
// usage: node drive.js <baseURL> <scenario: bundle|archswitch|none> <label>
const { chromium } = require("playwright-core");
const fs = require("fs");

const [base, scenario, label] = process.argv.slice(2);
const out = `/out/${label}-${scenario}`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  const res = await page.request.post(`${base}/api/v1/session`, { data: { password: "qa" } });
  if (!res.ok()) throw new Error("login " + res.status());

  let posted = null, status = null, respBody = null;
  page.on("request", (r) => {
    if (r.method() === "POST" && r.url().endsWith("/api/v1/artifacts")) posted = r.postData();
  });
  page.on("response", async (r) => {
    if (r.request().method() === "POST" && r.url().endsWith("/api/v1/artifacts")) {
      status = r.status();
      respBody = await r.text().catch(() => null);
    }
  });

  await page.goto(`${base}/artifacts/new`);
  await page.getByText(/^Hadron v/).first().click();
  await page.getByPlaceholder(/Production v4\.0\.3/).fill(`qa-${scenario}`);
  await page.getByRole("button", { name: "Next: System" }).click();
  await page.getByRole("button", { name: "Next: Extensions" }).click();

  if (scenario === "bundle" || scenario === "archswitch") {
    await page.getByRole("button", { name: "Add tailscale to bundle" }).click();
  }
  if (scenario === "bundle") {
    await page.getByText("Pre-configure for system extensions").click();
    await page.getByRole("button", { name: "Add /opt" }).click();
  }
  await page.screenshot({ path: `${out}-extensions.png`, fullPage: true });
  if (scenario === "archswitch") {
    await page.getByRole("button", { name: "Back" }).click();
    await page.getByRole("radio", { name: "ARM64" }).click();
    await page.getByRole("button", { name: "Next: Extensions" }).click();
    await page.screenshot({ path: `${out}-extensions-after-arm64.png`, fullPage: true });
  }
  await page.getByRole("button", { name: "Next: Access" }).click();
  await page.getByRole("button", { name: "Next: Output" }).click();
  await page.getByRole("button", { name: "Next: Review" }).click();
  await page.screenshot({ path: `${out}-review.png`, fullPage: true });
  await page.getByRole("button", { name: /Start Build/i }).click();
  for (let i = 0; i < 50 && status === null; i++) await page.waitForTimeout(100);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}-after-submit.png`, fullPage: true });

  const result = { scenario, label, url: page.url(), status, payload: posted && JSON.parse(posted) };
  if (status === 201) {
    const id = JSON.parse(respBody).id;
    result.id = id;
    const rec = await (await page.request.get(`${base}/api/v1/artifacts/${id}`)).json();
    result.storedArch = rec.arch;
    result.storedHierarchies = rec.extensionHierarchies ?? rec.sysextHierarchies ?? null;
    result.storedRecordKeys = Object.keys(rec).filter((k) => /xten|ierarch/i.test(k));
    result.storedExtFields = Object.fromEntries(result.storedRecordKeys.map((k) => [k, rec[k]]));
    const b = await page.request.get(`${base}/api/v1/artifacts/${id}/bundle-extensions`);
    result.bundleStatus = b.status();
    result.bundle = await b.json().catch(() => null);
  } else {
    result.response = respBody;
  }
  fs.writeFileSync(`${out}.json`, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
