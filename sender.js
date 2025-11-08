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

  // Static options now defined in sender.html; no injection needed.
  // Rename the last radio option label/value to "בית המטופל/ת" to match new phrasing
  try {
    const firstLoc = document.querySelector('input[name="location"]');
    if (firstLoc) {
      const container = firstLoc.closest('div');
      const labels = container ? Array.from(container.querySelectorAll('label')) : [];
      const last = labels[labels.length - 1];
      if (last) {
        const input = last.querySelector('input[name="location"]');
        if (input) input.value = 'בית המטופל/ת|בית המטופל/ת';
        // Replace text after input with the new label
        last.innerHTML = '<input type="radio" name="location" value="בית המטופל/ת|בית המטופל/ת"> טיפול בבית המטופל/ת';
      }
    }
  } catch (_) { /* ignore */ }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Raw values (no percent-encoding; we encode once into Base64)
    const client = document.getElementById("client").value.trim();
    const phoneRaw = document.getElementById("phone").value.trim();
    const title = document.getElementById("title").value.trim();
    const date = document.getElementById("date").value;
    const start = document.getElementById("start").value;
    const end = document.getElementById("end").value;
    const notes = document.getElementById("notes").value.trim();

    if (!date || !start || !end || !phoneRaw) {
      alert("נא למלא תאריך, שעות ומספר טלפון.");
      return;
    }

    // Location radio: value format "<branch>|<full address>"
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
    const DEFAULT_TITLE = "עיסוי רפואי – טיפול מלא";
    const radios = Array.from(document.querySelectorAll('input[name="location"]'));
    const bIdx = Math.max(0, radios.findIndex(r => r.checked));
    const baseMs = Date.parse("2025-01-01T00:00:00.000Z");
    const startMs = new Date(startFull).getTime();
    const endMs = new Date(endFull).getTime();
    const durMin = Math.round((endMs - startMs) / 60000);
    const startMin = Math.floor((startMs - baseMs) / 60000);

    let shortUrl;
    const canUltraShort = (notes === "") && (title === DEFAULT_TITLE) && durMin > 0 && durMin <= 127 && startMin >= 0 && startMin <= 0x7fffff && bIdx >= 0 && bIdx <= 3;
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
      <button id="btnSendWA" class="btn-whatsapp" type="button">שליחה ב‑WhatsApp ללקוח/ה</button>
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
      const msg = `שלום ${client}, זהו קישור עם פרטי התור שלך אצל יונתן דורי:\n${finalUrl}`;
      const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
      window.open(waLink, "_blank");
      waBtn.disabled = false;
    });
  });

  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
