/**
 * Chris & Yumi wedding – RSVP receiver
 * Paste into the Google Sheet's Extensions > Apps Script, then
 * Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
 */
const SHEET_NAME = 'RSVPs';
const HEADERS = ['Timestamp', 'Complete name', 'Attending', 'Seats reserved', 'Invited as'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    }
    const p = (e && e.parameter) || {};
    sheet.appendRow([
      new Date(),
      clean_(p.name),
      p.attending === 'yes' ? 'Yes' : p.attending === 'no' ? 'No' : '',
      clean_(p.seats),
      clean_(p.to)
    ]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Trim, cap length, and stop anything that starts like a formula from running in the sheet.
function clean_(value) {
  const s = String(value || '').trim().slice(0, 120);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
