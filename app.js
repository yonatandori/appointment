document.addEventListener("DOMContentLoaded", function () {
  const apptEl = document.getElementById("appt");
  if (!apptEl) return;

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
    const pad = s.length % 4;
    if (pad) s += "=".repeat(4 - pad);
    const bin = atob(s);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  // Data holders
  let client = "";
  let title = "";
  let start = "";
  let end = "";
  let notes = "";
  let locationText = "";
  let branch = "";
  let isHomeFlag = false;

  // Static labels/addresses
  const DEFAULT_TITLE = "\u05e7\u05d1\u05e2\u05ea \u05ea\u05d5\u05e8 \u05dc\u05e2\u05d9\u05e1\u05d5\u05d9";
  const TEL_AVIV_BRANCH = "\u05e7\u05dc\u05d9\u05e0\u05d9\u05e7\u05d4 \u05d1\u05d1\u05dc\u05d9";
  const TEL_AVIV_ADDRESS = "\u05e8\u05d7\u05d5\u05d1 \u05d4\u05d6\u05d5\u05d4\u05e8 32, \u05ea\u05dc \u05d0\u05d1\u05d9\u05d1";
  const MAIN_BRANCH = "\u05e7\u05dc\u05d9\u05e0\u05d9\u05e7\u05d4 \u05e8\u05d0\u05e9\u05d9\u05ea";
  const MAIN_ADDRESS = "\u05e8\u05d7' \u05e4\u05e8\u05d2 6, \u05e4\u05e8\u05d3\u05e1\u05d9\u05d4";
  const HOME_LABEL = "\u05d1\u05d9\u05e7\u05d5\u05e8 \u05d1\u05d9\u05ea";

  const BRANCHES = [
    { branch: TEL_AVIV_BRANCH, location: TEL_AVIV_ADDRESS },
    { branch: MAIN_BRANCH, location: MAIN_ADDRESS },
    { branch: HOME_LABEL, location: HOME_LABEL }
  ];

  // Hebrew UI text (ASCII-safe)
  const uiText = {
    title: "\u05d0\u05d9\u05e9\u05d5\u05e8 \u05ea\u05d5\u05e8 \u007c \u05d9\u05d5\u05e0\u05ea\u05df \u05d3\u05d5\u05e8\u05d9 \u05e2\u05d9\u05e1\u05d5\u05d9",
    header: "\u05d0\u05d9\u05e9\u05d5\u05e8 \u05ea\u05d5\u05e8",
    subtitle: "\u05e2\u05d9\u05e1\u05d5\u05d9 \u05e8\u05e4\u05d5\u05d0\u05d9 \u05d1\u05e7\u05dc\u05d9\u05e0\u05d9\u05e7\u05d4 (\u05ea\u05dc \u05d0\u05d1\u05d9\u05d1/\u05e4\u05e8\u05d3\u05e1\u05d9\u05d4) \u05d0\u05d5 \u05d1\u05d9\u05e7\u05d5\u05e8 \u05d1\u05d9\u05ea",
    apptTitle: "\u05e4\u05e8\u05d8\u05d9 \u05d4\u05ea\u05d5\u05e8",
    fieldClient: "\u05e9\u05dd \u05de\u05d8\u05d5\u05e4\u05dc/\u05ea",
    fieldDate: "\u05ea\u05d0\u05e8\u05d9\u05da",
    fieldTime: "\u05e9\u05e2\u05d5\u05ea",
    fieldPlace: "\u05de\u05d9\u05e7\u05d5\u05dd",
    fieldNotes: "\u05d4\u05e2\u05e8\u05d5\u05ea",
    btnConfirm: "\u05de\u05d0\u05e9\u05e8/\u05ea \u05d4\u05d2\u05e2\u05d4",
    btnCancel: "\u05de\u05d1\u05e7\u05e9/\u05ea \u05dc\u05d1\u05d8\u05dc",
    btnCalendar: "\u05d4\u05d5\u05e1\u05e3 \u05dc\u05d9\u05d5\u05de\u05df",
    fineprint: "\u05d1\u05d9\u05d8\u05d5\u05dc \u05d0\u05d5 \u05e9\u05d9\u05e0\u05d5\u05d9: \u05d1\u05d1\u05e7\u05e9\u05d4 \u05dc\u05e2\u05d3\u05db\u05df \u05dc\u05e4\u05d7\u05d5\u05ea 24 \u05e9\u05e2\u05d5\u05ea \u05de\u05e8\u05d0\u05e9.",
    travelTitle: "\u05d4\u05d2\u05e2\u05d4 \u05d5\u05e0\u05d9\u05d5\u05d5\u05d8",
    mapGoogle: "\u05e4\u05ea\u05d7 \u05d1-Google Maps",
    mapWaze: "\u05e4\u05ea\u05d7 \u05d1-Waze",
    clinicAlt: "\u05db\u05e0\u05d9\u05e1\u05d4 \u05dc\u05e7\u05dc\u05d9\u05e0\u05d9\u05e7\u05d4",
    clinicCaption: "\u05db\u05e0\u05d9\u05e1\u05d4 \u05dc\u05e7\u05dc\u05d9\u05e0\u05d9\u05e7\u05d4 \u05d1\u05e8\u05d7\u05d5\u05d1 \u05d4\u05d6\u05d5\u05d4\u05e8 32, \u05ea\u05dc \u05d0\u05d1\u05d9\u05d1",
    homeCaptionNew: "\u05d1\u05d9\u05e7\u05d5\u05e8 \u05d1\u05d9\u05ea \u2013 \u05de\u05d8\u05e4\u05dc \u05e0\u05d5\u05e9\u05d0 \u05de\u05d9\u05d8\u05ea \u05e2\u05d9\u05e1\u05d5\u05d9 \u05d1\u05de\u05d3\u05e8\u05d2\u05d5\u05ea",
    homeAriaNew: "\u05d0\u05d9\u05d5\u05e8 \u05d1\u05d9\u05e7\u05d5\u05e8 \u05d1\u05d9\u05ea: \u05de\u05d8\u05e4\u05dc \u05de\u05d8\u05e4\u05e1 \u05e2\u05dd \u05de\u05d9\u05d8\u05ea \u05e2\u05d9\u05e1\u05d5\u05d9 \u05de\u05ea\u05e7\u05e4\u05dc\u05ea",
    homeCaptionOld: "\u05d1\u05d9\u05e7\u05d5\u05e8 \u05d1\u05d9\u05ea \u2013 \u05d4\u05de\u05d8\u05e4\u05dc \u05de\u05d2\u05d9\u05e2 \u05e2\u05dd \u05de\u05d9\u05d8\u05ea \u05d8\u05d9\u05e4\u05d5\u05dc \u05e0\u05d9\u05d9\u05d3\u05ea",
    homeAriaOld: "\u05d0\u05d9\u05d5\u05e8 \u05d1\u05d9\u05e7\u05d5\u05e8 \u05d1\u05d9\u05ea: \u05de\u05d8\u05e4\u05dc \u05e2\u05dd \u05de\u05d9\u05d8\u05ea \u05e2\u05d9\u05e1\u05d5\u05d9 \u05e0\u05d9\u05d9\u05d3\u05ea",
    aboutTitle: "\u05e7\u05e6\u05ea \u05e2\u05dc\u05d9",
    aboutP1: "\u05d0\u05e0\u05d9 \u05d9\u05d5\u05e0\u05ea\u05df \u05d3\u05d5\u05e8\u05d9, \u05de\u05d8\u05e4\u05dc \u05d1\u05e2\u05d9\u05e1\u05d5\u05d9 \u05e8\u05e4\u05d5\u05d0\u05d9/\u05e1\u05e4\u05d5\u05e8\u05d8\u05d9\u05d1\u05d9 \u05e2\u05dd \u05e0\u05d9\u05e1\u05d9\u05d5\u05df \u05d1\u05e9\u05d9\u05e7\u05d5\u05dd \u05ea\u05e0\u05d5\u05e2\u05d4 \u05d5\u05d4\u05e7\u05dc\u05d4 \u05d1\u05db\u05d0\u05d1. \u05d4\u05d8\u05d9\u05e4\u05d5\u05dc \u05de\u05d5\u05ea\u05d0\u05dd \u05d0\u05d9\u05e9\u05d9\u05ea \u05dc\u05de\u05e6\u05d1\u05da \u05d5\u05dc\u05de\u05d8\u05e8\u05d5\u05ea\u05d9\u05da, \u05d1\u05e7\u05dc\u05d9\u05e0\u05d9\u05e7\u05d4 \u05e0\u05e2\u05d9\u05de\u05d4 \u05d0\u05d5 \u05d1\u05d1\u05d9\u05e7\u05d5\u05e8 \u05d1\u05d9\u05ea \u05e2\u05dd \u05db\u05dc \u05d4\u05e6\u05d9\u05d5\u05d3 \u05d4\u05e0\u05d3\u05e8\u05e9.",
    aboutB1: "\u05d8\u05db\u05e0\u05d9\u05e7\u05d5\u05ea \u05de\u05e9\u05d5\u05dc\u05d1\u05d5\u05ea \u05dc\u05e9\u05d7\u05e8\u05d5\u05e8 \u05e9\u05e8\u05d9\u05e8\u05d9\u05dd, \u05e9\u05d9\u05e4\u05d5\u05e8 \u05d8\u05d5\u05d5\u05d7 \u05ea\u05e0\u05d5\u05e2\u05d4 \u05d5\u05d4\u05e4\u05d7\u05ea\u05ea \u05db\u05d0\u05d1",
    aboutB2: "\u05e2\u05d1\u05d5\u05d3\u05d4 \u05de\u05de\u05d5\u05e7\u05d3\u05ea \u05d0\u05d7\u05e8\u05d9 \u05de\u05d0\u05de\u05e5, \u05e4\u05e6\u05d9\u05e2\u05d5\u05ea, \u05d0\u05d5 \u05db\u05d0\u05d1\u05d9 \u05d2\u05d1/\u05e6\u05d5\u05d5\u05d0\u05e8 \u05db\u05e8\u05d5\u05e0\u05d9\u05d9\u05dd",
    aboutB3: "\u05dc\u05d9\u05d5\u05d5\u05d9 \u05d1\u05ea\u05e8\u05d2\u05d9\u05dc\u05d9\u05dd \u05e7\u05e6\u05e8\u05d9\u05dd \u05d5\u05de\u05e2\u05e9\u05d9\u05d9\u05dd \u05e9\u05ea\u05d5\u05db\u05dc\u05d5 \u05dc\u05d4\u05de\u05e9\u05d9\u05da \u05d1\u05d1\u05d9\u05ea",
    priceTitle: "\u05de\u05d7\u05d9\u05e8\u05d5\u05df",
    price1: "\u05e2\u05d9\u05e1\u05d5\u05d9 \u05e8\u05e4\u05d5\u05d0\u05d9 60 \u05d3\u05e7'",
    price2: "\u05e2\u05d9\u05e1\u05d5\u05d9 \u05e8\u05e4\u05d5\u05d0\u05d9 75 \u05d3\u05e7'",
    price3: "\u05e2\u05d9\u05e1\u05d5\u05d9 \u05e8\u05e4\u05d5\u05d0\u05d9 90 \u05d3\u05e7'",
    price4: "\u05db\u05e8\u05d8\u05d9\u05e1\u05d9\u05d9\u05d4 (5\u00d760 \u05d3\u05e7')",
    priceVal1: "\u20aa 320",
    priceVal2: "\u20aa 380",
    priceVal3: "\u20aa 430",
    priceVal4: "\u20aa 1450",
    payTitle: "\u05d0\u05de\u05e6\u05e2\u05d9 \u05ea\u05e9\u05dc\u05d5\u05dd",
    pay1: "\u05de\u05d6\u05d5\u05de\u05df / \u05d4\u05e2\u05d1\u05e8\u05d4 / Bit / PayBox",
    pay2: "\u05e7\u05d1\u05dc\u05d4 \u05de\u05e1\u05d5\u05d3\u05e8\u05ea \u05e0\u05e9\u05dc\u05d7\u05ea \u05d1\u05e1\u05d9\u05d5\u05dd \u05db\u05dc \u05d8\u05d9\u05e4\u05d5\u05dc",
    pay3: "\u05ea\u05d5\u05e1\u05e4\u05ea \u05e0\u05e1\u05d9\u05e2\u05d4 \u05dc\u05d1\u05d9\u05e7\u05d5\u05e8\u05d9 \u05d1\u05d9\u05ea \u05d1\u05d4\u05ea\u05d0\u05dd \u05dc\u05de\u05e8\u05d7\u05e7",
    cancelTitle: "\u05de\u05d3\u05d9\u05e0\u05d9\u05d5\u05ea \u05d1\u05d9\u05d8\u05d5\u05dc\u05d9\u05dd",
    cancelText: "\u05d1\u05d9\u05d8\u05d5\u05dc \u05e2\u05d3 24 \u05e9\u05e2\u05d5\u05ea \u05dc\u05e4\u05e0\u05d9 \u05d4\u05ea\u05d5\u05e8 \u2013 \u05dc\u05dc\u05d0 \u05d7\u05d9\u05d5\u05d1. \u05d1\u05d9\u05d8\u05d5\u05dc \u05de\u05d0\u05d5\u05d7\u05e8 \u05d9\u05d5\u05ea\u05e8 \u05e2\u05dc\u05d5\u05dc \u05dc\u05d4\u05d9\u05d5\u05ea \u05de\u05d7\u05d5\u05d9\u05d1 100%.",
    tipsTitle1: "\u05d4\u05d9\u05e2\u05e8\u05db\u05d5\u05ea",
    tipsText1: "\u05d4\u05d2\u05d9\u05e2\u05d5 \u05db\u05de\u05d4 \u05d3\u05e7\u05d5\u05ea \u05dc\u05e4\u05e0\u05d9, \u05e9\u05ea\u05d5 \u05de\u05d9\u05dd \u05d5\u05e7\u05d7\u05d5 \u05e8\u05d2\u05e2 \u05dc\u05d4\u05d9\u05e8\u05d2\u05e2.",
    tipsTitle2: "\u05dc\u05e4\u05e0\u05d9 \u05d8\u05d9\u05e4\u05d5\u05dc",
    tipsText2: "\u05de\u05d5\u05de\u05dc\u05e5 \u05dc\u05d4\u05d9\u05de\u05e0\u05e2 \u05de\u05d0\u05e8\u05d5\u05d7\u05d4 \u05db\u05d1\u05d3\u05d4 \u05e1\u05de\u05d5\u05da \u05dc\u05d8\u05d9\u05e4\u05d5\u05dc \u05d5\u05dc\u05d4\u05d2\u05d9\u05e2 \u05d1\u05d1\u05d9\u05d2\u05d5\u05d3 \u05e0\u05d5\u05d7.",
    tipsTitle3: "\u05d0\u05d7\u05e8\u05d9 \u05d8\u05d9\u05e4\u05d5\u05dc",
    tipsText3: "\u05e9\u05ea\u05d5 \u05de\u05d9\u05dd, \u05ea\u05e0\u05d5 \u05dc\u05d2\u05d5\u05e3 \u05dc\u05e0\u05d5\u05d7 \u05d5\u05d4\u05d9\u05de\u05e0\u05e2\u05d5 \u05de\u05de\u05d0\u05de\u05e5 \u05d7\u05e8\u05d9\u05d2 \u05d1\u05d0\u05d5\u05ea\u05d5 \u05d4\u05d9\u05d5\u05dd.",
    footer: "\u00a9 {year} \u05d9\u05d5\u05e0\u05ea\u05df \u05d3\u05d5\u05e8\u05d9 \u2013 \u05e2\u05d9\u05e1\u05d5\u05d9 \u05e8\u05e4\u05d5\u05d0\u05d9"
  };

  function applyHebrewUi() {
    const setText = (selector, value) => {
      const el = document.querySelector(selector);
      if (el && value) el.textContent = value;
    };

    document.title = uiText.title;
    setText(".brand h1", uiText.header);
    setText(".brand .subtitle", uiText.subtitle);
    setText(".appt-card h2", uiText.apptTitle);
    const kvLabels = [uiText.fieldClient, uiText.fieldDate, uiText.fieldTime, uiText.fieldPlace, uiText.fieldNotes];
    document.querySelectorAll(".kv dt").forEach((el, idx) => { if (kvLabels[idx]) el.textContent = kvLabels[idx]; });
    setText("#btnConfirm", uiText.btnConfirm);
    setText("#btnCancel", uiText.btnCancel);
    setText("#btnAddToCal", uiText.btnCalendar);
    setText(".fineprint", uiText.fineprint);
    setText(".travel-card h2", uiText.travelTitle);
    setText("#linkGmaps", uiText.mapGoogle);
    setText("#linkWaze", uiText.mapWaze);

    const clinicImg = document.querySelector(".clinic-photo img");
    if (clinicImg) clinicImg.alt = uiText.clinicAlt;
    const clinicCap = document.querySelector(".clinic-photo figcaption");
    if (clinicCap) clinicCap.textContent = uiText.clinicCaption;

    const figNew = document.getElementById("homeIllustration2");
    if (figNew) {
      const svg = figNew.querySelector("svg"); if (svg) svg.setAttribute("aria-label", uiText.homeAriaNew);
      const cap = figNew.querySelector("figcaption"); if (cap) cap.textContent = uiText.homeCaptionNew;
    }
    const figOld = document.getElementById("homeIllustration");
    if (figOld) {
      const svg = figOld.querySelector("svg"); if (svg) svg.setAttribute("aria-label", uiText.homeAriaOld);
      const cap = figOld.querySelector("figcaption"); if (cap) cap.textContent = uiText.homeCaptionOld;
    }

    setText(".about-card h2", uiText.aboutTitle);
    const aboutP = document.querySelector(".about-text p"); if (aboutP) aboutP.textContent = uiText.aboutP1;
    const aboutLis = document.querySelectorAll(".about-text ul li");
    [uiText.aboutB1, uiText.aboutB2, uiText.aboutB3].forEach((txt, idx) => {
      if (aboutLis[idx]) aboutLis[idx].textContent = txt;
    });

    setText(".stacked-cards .card:nth-child(1) h3", uiText.priceTitle);
    const priceLabels = [uiText.price1, uiText.price2, uiText.price3, uiText.price4];
    const priceValues = [uiText.priceVal1, uiText.priceVal2, uiText.priceVal3, uiText.priceVal4];
    document.querySelectorAll(".price-list li").forEach((li, idx) => {
      const spans = li.querySelectorAll("span");
      if (spans[0] && priceLabels[idx]) spans[0].textContent = priceLabels[idx];
      if (spans[1] && priceValues[idx]) spans[1].textContent = priceValues[idx];
    });

    setText(".stacked-cards .card:nth-child(2) h3", uiText.payTitle);
    const payLis = document.querySelectorAll(".stacked-cards .card:nth-child(2) .bullets li");
    [uiText.pay1, uiText.pay2, uiText.pay3].forEach((txt, idx) => {
      if (payLis[idx]) payLis[idx].textContent = txt;
    });

    setText(".stacked-cards .card:nth-child(3) h3", uiText.cancelTitle);
    const cancelP = document.querySelector(".stacked-cards .card:nth-child(3) p");
    if (cancelP) cancelP.textContent = uiText.cancelText;

    const tipsTitles = [uiText.tipsTitle1, uiText.tipsTitle2, uiText.tipsTitle3];
    const tipsTexts = [uiText.tipsText1, uiText.tipsText2, uiText.tipsText3];
    document.querySelectorAll(".tips-grid .card").forEach((card, idx) => {
      const h3 = card.querySelector("h3"); const p = card.querySelector("p");
      if (h3 && tipsTitles[idx]) h3.textContent = tipsTitles[idx];
      if (p && tipsTexts[idx]) p.textContent = tipsTexts[idx];
    });

    const footerP = document.querySelector(".site-footer .footer-text");
    if (footerP) footerP.innerHTML = uiText.footer.replace("{year}", "<span id=\"year\"></span>");
  }

  applyHebrewUi();

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
    if (homeQ === "1") isHomeFlag = true;
  }

  // Normalize known branches
  if (branch && branch === TEL_AVIV_BRANCH) {
    locationText = TEL_AVIV_ADDRESS;
  } else if (branch && branch === MAIN_BRANCH) {
    locationText = MAIN_ADDRESS;
  }

  // Determine if this is a home visit
  const isHomeByEquality = branch && locationText && branch === locationText;
  const isHome = Boolean(isHomeFlag) || isHomeByEquality || branch === HOME_LABEL || locationText === HOME_LABEL;
  if (isHome) {
    branch = HOME_LABEL;
    locationText = HOME_LABEL;
  }

  // Build map links
  const encodedAddress = encodeURIComponent(locationText || "");
  const gmapsLink = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  const wazeLink = `https://waze.com/ul?q=${encodedAddress}&navigate=yes`;

  // Store data attributes for other scripts/CSS hooks
  apptEl.dataset.clientName = client;
  apptEl.dataset.title = title;
  apptEl.dataset.startLocal = start;
  apptEl.dataset.endLocal = end;
  apptEl.dataset.location = locationText;
  apptEl.dataset.notes = notes;

  // Display fields
  let displayLocation = isHome ? HOME_LABEL : locationText;
  if (!isHome && branch) {
    displayLocation = branch === TEL_AVIV_BRANCH
      ? `${branch}: ${locationText}`
      : `${branch} - ${locationText}`;
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
      const clinic = document.querySelector(".clinic-photo");
      const homeFigOld = document.getElementById("homeIllustration");
      const homeFigNew = document.getElementById("homeIllustration2");
      if (clinic) clinic.style.display = isHomeVisit ? "none" : "";
      // Always prefer the new illustration if present
      if (homeFigOld) homeFigOld.style.display = "none";
      if (homeFigNew) homeFigNew.style.display = isHomeVisit ? "" : "none";
    } catch (_) { /* noop */ }
  }

  function showHomeVisitLayout() {
    try {
      const mapLinks = document.querySelector(".map-links");
      if (mapLinks) mapLinks.style.display = "none";
      const arrivalInfo = document.getElementById("arrivalInfo");
      if (arrivalInfo) {
        arrivalInfo.style.display = "";
        arrivalInfo.innerHTML = `
          <p><strong>\u05d1\u05d9\u05e7\u05d5\u05e8 \u05d1\u05d9\u05ea:</strong><br>\u05de\u05d7\u05d9\u05e8 \u05d1\u05d9\u05e7\u05d5\u05e8 \u05d4\u05d1\u05d9\u05ea \u05d9\u05e7\u05d1\u05e2 \u05de\u05e8\u05d0\u05e9 \u05d1\u05d4\u05ea\u05d0\u05dd \u05dc\u05de\u05e8\u05d7\u05e7, \u05d5\u05d2\u05d9\u05e9\u05d4 \u05dc\u05d1\u05d9\u05ea \u05d4\u05de\u05d8\u05d5\u05e4\u05dc</p>
        `;
      }
      const placeEl = document.getElementById("placeText");
      if (placeEl) placeEl.textContent = HOME_LABEL;
      const clinic = document.querySelector(".clinic-photo");
      if (clinic) clinic.style.display = "none";
      const homeFigOld = document.getElementById("homeIllustration");
      const homeFigNew = document.getElementById("homeIllustration2");
      if (homeFigOld) homeFigOld.style.display = "none";
      if (homeFigNew) homeFigNew.style.display = "none";
    } catch (_) { /* no-op */ }
  }

  if (isHome) {
    showHomeVisitLayout();
  }

  // Owner WhatsApp for confirm/cancel
  const OWNER_PHONE = "972546257272";
  const waBase = `https://wa.me/${OWNER_PHONE}?text=`;
  const dateText = document.getElementById("dateText").textContent;
  const timeText = document.getElementById("timeText").textContent;

  const clientNameEl = document.getElementById("clientName");
  const clientNameText = clientNameEl ? clientNameEl.textContent.trim() : "";
  const senderName = (clientNameText && clientNameText !== "-") ? clientNameText : (client || "\u05de\u05d8\u05d5\u05e4\u05dc/\u05ea");
  const msgConfirm = `\u05e9\u05dc\u05d5\u05dd, \u05db\u05d0\u05df ${senderName}. \u05d0\u05d9\u05e9\u05e8\u05ea\u05d9 \u05d0\u05ea \u05d4\u05ea\u05d5\u05e8 "\${title}" \u05d1\u05ea\u05d0\u05e8\u05d9\u05da ${dateText} \u05d1\u05e9\u05e2\u05d4 ${timeText}.`;
  const msgCancel = `\u05e9\u05dc\u05d5\u05dd, \u05db\u05d0\u05df ${senderName}. \u05de\u05d1\u05d8\u05dc/\u05ea \u05d0\u05ea \u05d4\u05ea\u05d5\u05e8 \u05e9\u05e0\u05e7\u05d1\u05e2 \u05dc-${dateText} \u05d1\u05e9\u05e2\u05d4 ${timeText}.`;
  const btnConfirm = document.getElementById("btnConfirm");
  const btnCancel = document.getElementById("btnCancel");
  if (btnConfirm) btnConfirm.href = waBase + encodeURIComponent(msgConfirm);
  if (btnCancel) btnCancel.href = waBase + encodeURIComponent(msgCancel);

  // Google Calendar link (UTC format)
  const startUTC = start ? new Date(start).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z" : "";
  const endUTC = end ? new Date(end).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z" : "";
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startUTC}/${endUTC}&details=${encodeURIComponent(notes)}&location=${encodeURIComponent(locationText)}`;
  const btnAdd = document.getElementById("btnAddToCal");
  if (btnAdd) {
    btnAdd.href = gcalUrl;
    btnAdd.target = "_blank";
  }
});
