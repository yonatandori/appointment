document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("sendForm");
  const preview = document.getElementById("preview");
  const BASE_URL = "https://yonatandori.github.io/appointment/"; // no index.html needed

  // URL-safe Base64 helpers (UTF-8 aware)
  function b64UrlEncode(str) {
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }
  function b64UrlFromBytes(bytes) {
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  // Simplest TinyURL shortener with fallback
  async function shortenWithTiny(url) {
    const api = 'https://tinyurl.com/api-create.php?url=' + encodeURIComponent(url);
    const res = await fetch(api, { method: 'GET' });
    if (!res.ok) throw new Error('TinyURL request failed');
    const txt = (await res.text()).trim();
    if (!/^https?:\/\//i.test(txt)) throw new Error('TinyURL bad response');
    return txt;
  }

  if (!form) {
    console.error("sendForm element not found");
    return;
  }

  // ---- Input masks and parsing for Israeli formats ----
  function normalizeTime(val) {
    if (!val) return null;
    const m = String(val).trim().match(/^([0-2]?\d)[:.]?([0-5]?\d)?$/);
    if (!m) return null;
    let hh = parseInt(m[1], 10);
    let mm = m[2] != null ? parseInt(m[2], 10) : 0;
    if (isNaN(hh) || isNaN(mm) || hh > 23 || mm > 59) return null;
    return String(hh).padStart(2, '0') + ":" + String(mm).padStart(2, '0');
  }

  function setupTimeMask(el) {
    if (!el || el.type !== 'text') return;
    el.addEventListener('input', () => {
      let digits = el.value.replace(/\D/g, '').slice(0, 4);
      if (digits.length >= 3) {
        el.value = digits.slice(0, 2) + ':' + digits.slice(2);
      } else {
        el.value = digits;
      }
    });
    const fix = () => {
      const n = normalizeTime(el.value);
      if (n) el.value = n;
    };
    el.addEventListener('blur', fix);
    el.addEventListener('change', fix);
  }

  function parseDateILToISO(val) {
    if (!val) return null;
    const m = String(val).trim().match(/^\s*(\d{1,2})[\/.](\d{1,2})[\/.](\d{4})\s*$/);
    if (!m) return null;
    let d = parseInt(m[1], 10), mo = parseInt(m[2], 10), y = parseInt(m[3], 10);
    if (isNaN(d) || isNaN(mo) || isNaN(y) || y < 1900 || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    const daysInMonth = [31, (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (d > daysInMonth[mo - 1]) return null;
    return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  function setupDateMask(el) {
    if (!el || el.type !== 'text') return;
    el.addEventListener('input', () => {
      let digits = el.value.replace(/\D/g, '').slice(0, 8);
      let out = '';
      if (digits.length <= 2) out = digits;
      else if (digits.length <= 4) out = digits.slice(0, 2) + '/' + digits.slice(2);
      else out = digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
      el.value = out;
    });
    el.addEventListener('blur', () => {
      const iso = parseDateILToISO(el.value);
      if (iso) {
        const [y, m, d] = iso.split('-');
        el.value = `${d}/${m}/${y}`;
      }
    });
  }

  // Attach masks to inputs (enforce 24h HH:MM and DD/MM/YYYY)
  setupDateMask(document.getElementById('date'));
  setupTimeMask(document.getElementById('start'));
  setupTimeMask(document.getElementById('end'));


  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Raw values (no percent-encoding; we encode once into Base64)
    const client = document.getElementById("client").value.trim();
    const phoneRaw = document.getElementById("phone").value.trim();
    const title = document.getElementById("title").value.trim();
    const dateEl = document.getElementById("date");
    const startEl = document.getElementById("start");
    const endEl = document.getElementById("end");
    const dateRaw = dateEl.value;
    const startRaw = startEl.value;
    const endRaw = endEl.value;
    const date = (dateEl && dateEl.type === 'date') ? dateRaw : parseDateILToISO(dateRaw);
    const start = (startEl && startEl.type === 'time') ? startRaw : normalizeTime(startRaw);
    const end = (endEl && endEl.type === 'time') ? endRaw : normalizeTime(endRaw);
    const notes = document.getElementById("notes").value.trim();
    if (!date || !start || !end || !phoneRaw) {
      alert("Please enter a valid date, times, and phone.");
      return;
    }

    const locationRaw = document.querySelector('input[name="location"]:checked').value;
    const [branchName, addressFull] = locationRaw.split("|").map((v) => v.trim());

    const startFull = `${date}T${start}`;
    const endFull = `${date}T${end}`;
    const isHome = branchName === addressFull;

    // Build full query URL (robust for shortening)
    const qs = new URLSearchParams({
      client,
      title,
      start: startFull,
      end: endFull,
      notes,
      location: addressFull,
      branch: branchName,
      home: isHome ? '1' : '0'
    }).toString();
    const longUrl = `${BASE_URL}?${qs}`;

    // Try ultra-short packed code (<= 12 chars hash) when possible
    const DEFAULT_TITLE = "קביעת תור לעיסוי";
    const radios = Array.from(document.querySelectorAll('input[name="location"]'));
    const bIdx = Math.max(0, radios.findIndex(r => r.checked));
    const baseMs = Date.parse("2025-01-01T00:00:00.000Z");
    const startMs = new Date(startFull).getTime();
    const endMs = new Date(endFull).getTime();
    const durMin = Math.round((endMs - startMs) / 60000);
    const startMin = Math.floor((startMs - baseMs) / 60000);

    let shortUrl;
    const canUltraShort = false;
    if (canUltraShort) {
      // Pack bits: v(3)=1, b(2), start(23), dur(7), pad(5) -> 40 bits -> 7 base64url chars
      let x = 0n;
      x = (x << 3n) | 1n;                 // version
      x = (x << 2n) | BigInt(bIdx & 0x3); // branch idx
      x = (x << 23n) | BigInt(startMin);  // start minutes since 2025-01-01Z
      x = (x << 7n) | BigInt(durMin);     // duration minutes
      x = (x << 5n);                      // pad
      const bytes = new Uint8Array(5);
      for (let i = 4; i >= 0; i--) { bytes[i] = Number(x & 0xffn); x >>= 8n; }
      const code = b64UrlFromBytes(bytes); // typically 7 chars
      shortUrl = `${BASE_URL}#!${code}`;
    } else {
      // Fallback: compact JSON in hash (include home flag)
      const payload = { c: client, t: title, s: startFull, e: endFull, n: notes, l: addressFull, b: branchName, h: isHome ? 1 : 0 };
      shortUrl = `${BASE_URL}#${b64UrlEncode(JSON.stringify(payload))}`;
    }

    // Normalize phone to international (Israel 972)
    let phone = phoneRaw.replace(/\D/g, "");
    if (phone.startsWith("0")) phone = "972" + phone.substring(1);

    // Preview + WhatsApp send button
    preview.style.display = "block";
    preview.innerHTML = `
      <p><strong>קישור לתור:</strong></p>
      <a id="apptLink" href="${shortUrl}" target="_blank">${shortUrl}</a><br><br>
      <button id="btnSendWA" class="btn-whatsapp" type="button">שליחה ב‑WhatsApp</button>
    `;

    const waBtn = document.getElementById("btnSendWA");
    waBtn.addEventListener("click", async () => {
      waBtn.disabled = true;
      // Use the full query URL for shortening, so details survive even if hash is dropped
      let finalUrl = longUrl;
      try {
        finalUrl = await shortenWithTiny(longUrl);
      } catch (e) {
        console.warn('TinyURL unavailable, sending original URL', e);
      }
      const msg = `Shalom ${client}, here is your appointment link:\n${finalUrl}`;
      const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
      window.open(waLink, "_blank");
      waBtn.disabled = false;
    });
