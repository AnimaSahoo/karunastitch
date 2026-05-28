// ─────────────────────────────────────────────────────────────────────────
// KarunaStitch Backend
// ─────────────────────────────────────────────────────────────────────────
// Persists login/signup, orders, and feedback to Google Sheets via a
// Google Apps Script Web App URL. Zero servers, zero hosting cost.
//
// SETUP (10 minutes, one-time):
//
// 1. Go to https://script.google.com → "New Project"
// 2. Paste the APPS_SCRIPT_CODE below (scroll to bottom of this file)
// 3. Click "Deploy" → "New deployment"
//      Type: Web app
//      Execute as: Me
//      Who has access: Anyone
// 4. Authorize, then copy the Web App URL (ends in /exec)
// 5. Paste it as BACKEND_API_URL below
//
// IMPORTANT: only replace the URL string. Keep the trailing semicolon ;
// ─────────────────────────────────────────────────────────────────────────

const BACKEND_API_URL = "https://script.google.com/macros/s/AKfycbw6MiLf48q26pESfGhlTA8AHpykSqNqaof67qpsCo7C17aeNXhXNjc9EoZk0nFQZc6dxg/exec";

// Record any event to the backend. type = "user" | "order" | "feedback".
// Never throws — silently logs to console on failure so it doesn't break the UI.
async function recordEvent(type, data) {
  console.log(`[KarunaStitch] ${type} event:`, data);

  if (!BACKEND_API_URL) {
    console.warn(`[KarunaStitch] BACKEND_API_URL not set — ${type} event not persisted. See backend.js for setup steps.`);
    return { ok: false, reason: "not-configured" };
  }

  try {
    // Apps Script doesn't return CORS headers, so we use no-cors mode (fire-and-forget).
    // The data still reaches Apps Script and gets written to the sheet — we just
    // can't read the response. Verification = check the Google Sheet.
    await fetch(BACKEND_API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        type,
        timestamp: new Date().toISOString(),
        data,
      }),
    });
    console.log(`[KarunaStitch] ${type} request sent (no-cors). Check Google Sheet to verify.`);
    return { ok: true };
  } catch (err) {
    console.error(`[KarunaStitch] Failed to record ${type}:`, err);
    return { ok: false, error: err.message };
  }
}

// Debug helper — call window.KS_testBackend() from browser DevTools console
async function testBackend() {
  console.log("[KarunaStitch] === Backend Test ===");
  console.log("URL:", BACKEND_API_URL);
  if (!BACKEND_API_URL) {
    console.error("❌ BACKEND_API_URL is empty.");
    return;
  }

  const result = await recordEvent("user", {
    event: "test",
    name: "Backend Test " + new Date().toLocaleTimeString(),
    email: "test@example.com",
    role: "customer",
  });

  console.log("");
  console.log("✉️  Test request sent. Now do this:");
  console.log("");
  console.log("1. Open Google Drive → look for a file named 'KarunaStitch DB'");
  console.log("2. If it exists → open it → 'Users' tab → you should see a row named 'Backend Test <time>'");
  console.log("3. If NO file appears within 30 seconds, your Apps Script deployment is misconfigured.");
  console.log("");
  console.log("Most common fix: Apps Script editor → Deploy → Manage deployments → pencil/edit icon");
  console.log("→ 'Who has access' must be 'Anyone' (NOT 'Anyone with Google account')");
  console.log("→ Click Deploy. Copy the NEW /exec URL if it changed.");
}

// Expose globally
window.KS_recordEvent = recordEvent;
window.KS_testBackend = testBackend;
window.KS_BACKEND_CONFIGURED = !!BACKEND_API_URL;

console.log(
  BACKEND_API_URL
    ? `[KarunaStitch] Backend configured. Run window.KS_testBackend() to verify.`
    : `[KarunaStitch] Backend NOT configured. Set BACKEND_API_URL in backend.js.`
);

/* ═══════════════════════════════════════════════════════════════════════
   APPS_SCRIPT_CODE — copy everything between the markers below into
   your Google Apps Script editor (https://script.google.com)
   ═══════════════════════════════════════════════════════════════════════

   ────────── BEGIN APPS SCRIPT (copy into script.google.com) ──────────

   const SHEET_NAME = "KarunaStitch DB";

   function doPost(e) {
     try {
       const body = JSON.parse(e.postData.contents);
       const { type, timestamp, data } = body;

       const ss = getOrCreateSpreadsheet();
       const tabName = type === "user" ? "Users" : type === "order" ? "Orders" : "Feedback";
       const sheet = getOrCreateTab(ss, tabName, type);

       const row = buildRow(type, timestamp, data);
       sheet.appendRow(row);

       return ContentService.createTextOutput(JSON.stringify({ ok: true }))
         .setMimeType(ContentService.MimeType.JSON);
     } catch (err) {
       return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.message }))
         .setMimeType(ContentService.MimeType.JSON);
     }
   }

   function doGet() {
     return ContentService.createTextOutput("KarunaStitch backend is running. Use POST to record events.")
       .setMimeType(ContentService.MimeType.TEXT);
   }

   function getOrCreateSpreadsheet() {
     const files = DriveApp.getFilesByName(SHEET_NAME);
     if (files.hasNext()) return SpreadsheetApp.open(files.next());
     const ss = SpreadsheetApp.create(SHEET_NAME);
     const sheets = ss.getSheets();
     if (sheets.length === 1 && sheets[0].getName() === "Sheet1") {
       sheets[0].setName("Users");
     }
     return ss;
   }

   function getOrCreateTab(ss, name, type) {
     let sheet = ss.getSheetByName(name);
     if (!sheet) sheet = ss.insertSheet(name);
     if (sheet.getLastRow() === 0) sheet.appendRow(getHeaders(type));
     return sheet;
   }

   function getHeaders(type) {
     if (type === "user") return ["Timestamp", "Event", "Name", "Email", "Role", "City", "Specialty"];
     if (type === "order") return ["Timestamp", "Customer Name", "Email", "Phone", "Address", "City", "State", "ZIP", "Blouse Type", "Hook", "Design", "Delivery Date", "Special Requests", "Amount", "Status"];
     if (type === "feedback") return ["Timestamp", "Customer Name", "Email", "Rating", "Category", "Message"];
     return ["Timestamp", "Data"];
   }

   function buildRow(type, ts, d) {
     if (type === "user") return [ts, d.event || "login", d.name || "", d.email || "", d.role || "", d.city || "", d.specialty || ""];
     if (type === "order") return [ts, d.fullName || "", d.email || "", d.phone || "", d.street || "", d.city || "", d.state || "", d.zip || "", d.blouseType || "", d.hookPosition || "", d.design || "", d.deliveryDate || "", d.specialRequests || "", d.amount || "", d.status || "paid"];
     if (type === "feedback") return [ts, d.name || "", d.email || "", d.rating || "", d.category || "", d.message || ""];
     return [ts, JSON.stringify(d)];
   }

   ────────── END APPS SCRIPT ──────────
*/
