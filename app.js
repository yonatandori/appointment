// ===== קונפיגורציה =====
const OWNER_PHONE = "972546257272"; // 054-6257272 בפורמט בינלאומי לוואטסאפ
const ADDRESS     = "רח׳ הדוגמה 12, תל אביב"; // עדכן לכתובת האמיתית שלך

// ===== עזרי זמן =====
const pad = n => String(n).padStart(2, "0");

function toGCalUTC(dtIsoLocal){
  const d = new Date(dtIsoLocal);
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) + "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) + "Z"
  );
}

function formatLocalRange(startIso, endIso){
  const s = new Date(startIso), e = new Date(endIso);
  const dateText = s.toLocaleDateString("he-IL", {
    weekday:"short", year:"numeric", month:"long", day:"numeric"
  });
  const timeText =
    s.toLocaleTimeString("he-IL",{hour:"2-digit",minute:"2-digit"}) +
    "–" +
    e.toLocaleTimeString("he-IL",{hour:"2-digit",minute:"2-digit"});
  return { dateText, timeText };
}

// ===== פונקציות עזר =====
function buildWhatsAppText(action, data){
  const act = action === "confirm" ? "אישור הגעה" : "ביטול התור";
  const parts = [
    `שלום יונתן, כאן ${data.client}.`,
    `${act} לטיפול: ${data.title}.`,
    `מועד: ${data.date} ${data.time}.`,
    `מקום: ${data.location}.`
  ];
  if (data.notes) parts.push(`הערות: ${data.notes}`);
  return encodeURIComponent(parts.join(" "));
}

function buildMapsLinks(addr){
  const enc = encodeURIComponent(addr);
  return {
    gmaps: `https://www.google.com/maps/search/?api=1&query=${enc}`,
    waze:  `https://waze.com/ul?q=${enc}&navigate=yes`
  };
}

function buildICS({ title, start, end, location, notes }){
  const dtStamp = toGCalUTC(new Date().toISOString());
  const dtStart = toGCalUTC(start);
  const dtEnd   = toGCalUTC(end);
  const uid     = `${Date.now()}@yonatan-dori.local`;
  const esc = s => (s || "").replace(/[\n\r]/g, "\\n");

  const ics =
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Yonatan Dori Clinic//Appointments//HE
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtStamp}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${esc(title)}
LOCATION:${esc(location)}
DESCRIPTION:${esc(notes)}
END:VEVENT
END:VCALENDAR`;

  return new Blob([ics], { type: "text/calendar;charset=utf-8" });
}

// ===== קריאת פרמטרים מה-URL =====
function getQueryParams() {
  const params = {};
  const search = window.location.search.substring(1);
  const pairs = search.split("&");
  for (let pair of pairs) {
    if (!pair) continue;
    const [key, val] = pair.split("=");
    params[key] = decodeURIComponent(val || "");
  }
  return params;
}

// ===== Init =====
(function init(){
  // שנה בפוטר
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const apptEl = document.getElementById("appt");
  const params = getQueryParams();

  // אם יש פרמטרים ב-URL → משתמשים בהם
  if (params.client && params.start && params.end) {
    apptEl.dataset.clientName = params.client;
    apptEl.dataset.title      = params.title || "עיסוי רפואי – טיפול מלא";
    apptEl.dataset.startLocal = params.start;
    apptEl.dataset.endLocal   = params.end;
    apptEl.dataset.location   = params.location || ADDRESS;
    apptEl.dataset.notes      = params.notes || "";
  }

  // קריאת הנתונים מתוך האלמנט
  const title      = apptEl.dataset.title;
  const startLocal = apptEl.dataset.startLocal;
  const endLocal   = apptEl.dataset.endLocal;
  const location   = apptEl.dataset.location;
  const notes      = apptEl.dataset.notes;
  const client     = apptEl.dataset.clientName;

  // מציג טקסטים
  const { dateText, timeText } = formatLocalRange(startLocal, endLocal);
  document.getElementById("clientName").textContent = client;
  document.getElementById("dateText").textContent   = dateText;
  document.getElementById("timeText").textContent   = timeText;
  document.getElementById("placeText").textContent  = location;
  document.getElementById("notesText").textContent  = notes;
  document.getElementById("addressText").textContent = ADDRESS;

  // וואטסאפ
  const waBase = `https://wa.me/${OWNER_PHONE}?text=`;
  const wTextConfirm = buildWhatsAppText("confirm", { client, title, date:dateText, time:timeText, location, notes });
  const wTextCancel  = buildWhatsAppText("cancel",  { client, title, date:dateText, time:timeText, location, notes });
  document.getElementById("btnConfirm").href = waBase + wTextConfirm;
  document.getElementById("btnCancel").href  = waBase + wTextCancel;

  // קישורי מפות
  const { gmaps, waze } = buildMapsLinks(ADDRESS);
  document.getElementById("linkGmaps").href = gmaps;
  document.getElementById("linkWaze").href  = waze;

  // Google Calendar URL
  const gStart   = toGCalUTC(startLocal);
  co
