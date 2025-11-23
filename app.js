document.addEventListener("DOMContentLoaded", function () {
  const apptEl = document.getElementById("appt");

  // URL-safe Base64 helpers (UTF-8 aware)
  function b64UrlEncode(str) {
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }
  function b64UrlDecode(str) {
    let s = str.replace(/-/g, "+").replace(/_/g, "/");
    const pad = s.length % 4;
    if (pad) s += "=".repeat(4 - pad);
    return decodeURIComponent(escape(atob(s)));
  }
  function b64UrlToBytes(str) {
    let s = str.replace(/-/g, "+").replace(/_/g, "/");
    const pad = s.length % 4; if (pad) s += "=".repeat(4 - pad);
    const bin = atob(s);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  // Prefer compact hash payload; fallback to query params
  let client = "";
  let title = "";
  let start = "";
  let end = "";
  let notes = "";
  let locationText = "";
  let branch = "";
  let isHomeFlag = false;
  const TEL_AVIV_BRANCH = "\u05e7\u05dc\u05d9\u05e0\u05d9\u05e7\u05d4 \u05d1\u05d1\u05dc\u05d9";
  const TEL_AVIV_ADDRESS = "\u05e8\u05d7\u05d5\u05d1 \u05d4\u05d6\u05d5\u05d4\u05e8 32, \u05ea\u05dc \u05d0\u05d1\u05d9\u05d1";
  
  const BRANCHES = [
    { branch: TEL_AVIV_BRANCH, location: TEL_AVIV_ADDRESS },
    { branch: "\u05e7\u05dc\u05d9\u05e0\u05d9\u05e7\u05d4 \u05e8\u05de\u05ea \u05d2\u05df", location: "\u05e8\u05d7\u05d5\u05d1 \u05de\u05e8\u05db\u05d6\u05d9 32 (\u05e7\u05d5\u05de\u05d4 1), \u05e8\u05de\u05ea \u05d2\u05df" },
    { branch: "\u05d1\u05d9\u05e7\u05d5\u05e8 \u05d1\u05d9\u05ea", location: "\u05d1\u05d9\u05e7\u05d5\u05e8 \u05d1\u05d9\u05ea" }
  ];

  const hash = window.location.hash || "";
  if (hash && hash.length > 1) {
    // Try ultra-short packed format first: #!<b64url>
    if (hash.startsWith("#!")) {
      try {
        const bytes = b64UrlToBytes(hash.slice(2));
        if (bytes.length >= 5) {
          let x = 0n;
          for (let i = 0; i < 5; i++) x = (x << 8n) | BigInt(bytes[i]);
          x >>= 5n; // drop pad(5)
          const dur = Number(x & 0x7fn); x >>= 7n;
          const startMin = Number(x & 0x7fffffn); x >>= 23n;
          const bIdx = Number(x & 0x3n); x >>= 2n;
          const ver = Number(x & 0x7n);
          if (ver === 1) {
            const baseMs = Date.parse("2025-01-01T00:00:00.000Z");
            const startMs = baseMs + startMin * 60000;
            const endMs = startMs + dur * 60000;
            const b = BRANCHES[bIdx] || BRANCHES[0];
            branch = b.branch;
            locationText = b.location;
            start = new Date(startMs).toISOString().slice(0, 16);
            end = new Date(endMs).toISOString().slice(0, 16);
            title = DEFAULT_TITLE;
            notes = "";
          }
        }
      } catch (_) { /* ignore */ }
    }

    // Try JSON base64Url payload: #<b64url>
    if (!start) {
      try {
        const payload = JSON.parse(b64UrlDecode(hash.slice(1)));
        client = payload.c || "";
        title = payload.t || DEFAULT_TITLE;
        start = payload.s || "";
        end = payload.e || "";
        notes = payload.n || "";
        locationText = payload.l || "";
        branch = payload.b || "";
        isHomeFlag = Boolean(payload.h);
      } catch (_) { /* ignore */ }
    }
  } else {
    const params = new URLSearchParams(window.location.search);
    client = params.get("client") || "";
    title = params.get("title") || DEFAULT_TITLE;
    start = params.get("start") || "";
    end = params.get("end") || "";
    notes = params.get("notes") || "";
    locationText = params.get("location") || "";
    branch = params.get("branch") || "";
    const homeQ = params.get("home");
    if (homeQ === '1') isHomeFlag = true;
  }

  if (branch && branch === TEL_AVIV_BRANCH) {
    locationText = TEL_AVIV_ADDRESS;
  }
  // Build map links
  const encodedAddress = encodeURIComponent(locationText || "");
  const gmapsLink = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  const wazeLink = `https://waze.com/ul?q=${encodedAddress}&navigate=yes`;

  // Store data attributes
  apptEl.dataset.clientName = client;
  apptEl.dataset.title = title;
  apptEl.dataset.startLocal = start;
  apptEl.dataset.endLocal = end;
  apptEl.dataset.location = locationText;
  apptEl.dataset.notes = notes;

  // Display fields
  let displayLocation = locationText;
  if (branch) {
    displayLocation = branch === TEL_AVIV_BRANCH
      ? `${branch}: ${locationText}`
      : `${branch} — ${locationText}`;
  }
  document.getElementById("clientName").textContent = client;
  document.getElementById("dateText").textContent = start ? new Date(start).toLocaleDateString("he-IL") : "";
  document.getElementById("timeText").textContent = (start && end)
    ? `${new Date(start).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })} - ${new Date(end).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}`
    : "";
  document.getElementById("notesText").textContent = notes || "";
  document.getElementById("placeText").textContent = displayLocation;
  document.getElementById("linkGmaps").href = gmapsLink;
  document.getElementById("linkWaze").href = wazeLink;

  // Toggle clinic photo vs. home-visit illustration
  function toggleHomeVisuals(isHomeVisit) {
    try {
      const clinic = document.querySelector('.clinic-photo');
      const homeFigOld = document.getElementById('homeIllustration');
      const homeFigNew = document.getElementById('homeIllustration2');
      if (clinic) clinic.style.display = isHomeVisit ? 'none' : '';
      // Always prefer the new illustration if present
      if (homeFigOld) homeFigOld.style.display = 'none';
      if (homeFigNew) homeFigNew.style.display = isHomeVisit ? '' : 'none';
    } catch (_) { /* noop */ }
  }

  // Normalize and handle home-visit (branch equals location)
  (function(){
    try {
      if (branch && locationText && branch === locationText) {
        branch = '׳‘׳™׳× ׳”׳׳˜׳•׳₪׳/׳×';
        locationText = branch;
        document.getElementById("placeText").textContent = branch;
        const mapLinks = document.querySelector('.map-links');
        if (mapLinks) mapLinks.style.display = 'none';
        const arrivalInfo = document.getElementById('arrivalInfo');
        if (arrivalInfo) { arrivalInfo.style.display = 'none'; arrivalInfo.innerHTML = ''; }
        toggleHomeVisuals(true);
      }
    } catch (_) {}
  })();

  // Hide navigation/maps if home-visit
  const isHome = (branch === '׳‘׳™׳× ׳”׳׳§׳•׳—') || (locationText === '׳‘׳™׳× ׳”׳׳§׳•׳—');
  if (isHome) {
    const mapLinks = document.querySelector('.map-links');
    if (mapLinks) mapLinks.style.display = 'none';
    const arrivalInfo = document.getElementById('arrivalInfo');
    if (arrivalInfo) { arrivalInfo.style.display = 'none'; arrivalInfo.innerHTML = ''; }
    toggleHomeVisuals(true);
  }

  // Arrival info panel (kept minimal; content depends on branch labels)
  const arrivalInfo = document.getElementById("arrivalInfo");
  arrivalInfo.innerHTML = arrivalInfo.innerHTML || ""; // no-op placeholder to keep existing HTML if present

  // If home-visit was selected, show surcharge info instead of directions
  try {
    const isHomeByEquality = branch && locationText && branch === locationText;
    if ((isHomeFlag || isHomeByEquality) && arrivalInfo) {
      const mapLinks = document.querySelector('.map-links');
      if (mapLinks) mapLinks.style.display = 'none';
      arrivalInfo.style.display = '';
      arrivalInfo.innerHTML = `
        <h3>׳˜׳™׳₪׳•׳ ׳‘׳‘׳™׳× ׳”׳׳˜׳•׳₪׳/׳×</h3>
        <p>
          ׳׳×׳©׳•׳׳× ׳׳‘׳: ׳׳׳—׳™׳¨ ׳”׳˜׳™׳₪׳•׳ ׳×׳×׳•׳•׳¡׳£ ׳×׳•׳¡׳₪׳× ׳‘׳”׳×׳׳ ׳׳׳¨׳—׳§ ׳”׳ ׳¡׳™׳¢׳”,
          ׳׳§׳•׳׳” ׳•׳׳׳¢׳׳™׳×/׳׳׳ ׳׳¢׳׳™׳×, ׳›׳₪׳™ ׳©׳¡׳•׳›׳ ׳׳¨׳׳©.
        </p>
      `;
      // Ensure the place text shows the correct label
      document.getElementById("placeText").textContent = '׳‘׳™׳× ׳”׳׳˜׳•׳₪׳/׳×';
    }
  } catch (_) {}

  // Final safeguard: if it's a home visit, switch illustration
  try {
    const homeVisitFinal = Boolean(isHomeFlag) || (branch && locationText && branch === locationText) || Boolean(isHome);
    if (homeVisitFinal) toggleHomeVisuals(true);
  } catch (_) { /* noop */ }

  // Owner WhatsApp for confirm/cancel
  const OWNER_PHONE = "972546257272";
  const waBase = `https://wa.me/${OWNER_PHONE}?text=`;
  const dateText = document.getElementById("dateText").textContent;
  const timeText = document.getElementById("timeText").textContent;

  const clientNameEl = document.getElementById("clientName");
  const clientNameText = clientNameEl ? clientNameEl.textContent.trim() : "";
  const senderName = (clientNameText && clientNameText !== '—') ? clientNameText : (client || "מטופל/ת");
  const msgConfirm = `שלום, כאן ${senderName}. מאשר/ת הגעה לתור "${title}" בתאריך ${dateText} בשעות ${timeText}.`;
  const msgCancel = `שלום, כאן ${senderName}. מבקש/ת לבטל את התור בתאריך ${dateText} בשעות ${timeText}.`;
  document.getElementById("btnConfirm").href = waBase + encodeURIComponent(msgConfirm);
  document.getElementById("btnCancel").href = waBase + encodeURIComponent(msgCancel);

  // Google Calendar link (UTC format)
  const startUTC = start ? new Date(start).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z" : "";
  const endUTC = end ? new Date(end).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z" : "";
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startUTC}/${endUTC}&details=${encodeURIComponent(notes)}&location=${encodeURIComponent(locationText)}`;
  const btnAdd = document.getElementById("btnAddToCal");
  btnAdd.href = gcalUrl;
  btnAdd.target = "_blank";
});

