document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('sendForm');
  const preview = document.getElementById('preview');
  const BASE_URL = 'https://yonatandori.github.io/appointment/';

  // Hebrew UI text (ASCII-safe via Unicode escapes)
  const i18n = {
    title: "\u05DE\u05D7\u05D5\u05DC\u05DC \u05E7\u05D9\u05E9\u05D5\u05E8 \u05EA\u05D5\u05E8 | \u05D9\u05D5\u05E0\u05EA\u05DF \u05D3\u05D5\u05E8\u05D9 \u05E2\u05D9\u05E1\u05D5\u05D9",
    h1: "\u05DE\u05D7\u05D5\u05DC\u05DC \u05E7\u05D9\u05E9\u05D5\u05E8 \u05EA\u05D5\u05E8",
    client_label: "\u05E9\u05DD \u05D4\u05DC\u05E7\u05D5\u05D7:",
    phone_label: "\u05D8\u05DC\u05E4\u05D5\u05DF \u05D4\u05DC\u05E7\u05D5\u05D7 (05...):",
    title_label: "\u05DB\u05D5\u05EA\u05E8\u05EA \u05D4\u05D8\u05D9\u05E4\u05D5\u05DC:",
    date_label: "\u05EA\u05D0\u05E8\u05D9\u05DA:", start_label: "\u05E9\u05E2\u05EA \u05D4\u05EA\u05D7\u05DC\u05D4:", end_label: "\u05E9\u05E2\u05EA \u05E1\u05D9\u05D5\u05DD:",
    location_label: "\u05DE\u05D9\u05E7\u05D5\u05DD \u05D4\u05D8\u05D9\u05E4\u05D5\u05DC:",
    notes_label: "\u05D4\u05E2\u05E8\u05D5\u05EA:",
    submit_btn: "\u05D9\u05E6\u05D9\u05E8\u05EA \u05E7\u05D9\u05E9\u05D5\u05E8",
    phone_ph: "\u05DC\u05DE\u05E9\u05DC 0546257272",
    title_value: "\u05E7\u05D1\u05E2\u05EA \u05EA\u05D5\u05E8 \u05DC\u05E2\u05D9\u05E1\u05D5\u05D9",
    date_ph: "DD/MM/YYYY", time_ph: "HH:MM",
    loc_tlv_label: "\u05E7\u05DC\u05D9\u05E0\u05D9\u05E7\u05D4 \u05EA\u05DC \u05D0\u05D1\u05D9\u05D1 \u2014 \u05E8\u05D7\u05D5\u05D1 \u05D4\u05D6\u05D5\u05D4\u05E8 32",
    loc_tlv_val: "\u05E7\u05DC\u05D9\u05E0\u05D9\u05E7\u05D4 \u05EA\u05DC \u05D0\u05D1\u05D9\u05D1|\u05E8\u05D7\u05D5\u05D1 \u05D4\u05D6\u05D5\u05D4\u05E8 32, \u05EA\u05DC \u05D0\u05D1\u05D9\u05D1",
    loc_rg_label: "\u05E7\u05DC\u05D9\u05E0\u05D9\u05E7\u05D4 \u05E8\u05DE\u05EA \u05D2\u05DF \u2014 \u05E8\u05D7\u05D5\u05D1 \u05DE\u05E8\u05DB\u05D6\u05D9 32 (\u05E7\u05D5\u05DE\u05D4 1)",
    loc_rg_val: "\u05E7\u05DC\u05D9\u05E0\u05D9\u05E7\u05D4 \u05E8\u05DE\u05EA \u05D2\u05DF|\u05E8\u05D7\u05D5\u05D1 \u05DE\u05E8\u05DB\u05D6\u05D9 32 (\u05E7\u05D5\u05DE\u05D4 1), \u05E8\u05DE\u05EA \u05D2\u05DF",
    loc_home_label: "\u05D1\u05D9\u05E7\u05D5\u05E8 \u05D1\u05D9\u05EA",
    loc_home_val: "\u05D1\u05D9\u05E7\u05D5\u05E8 \u05D1\u05D9\u05EA|\u05D1\u05D9\u05E7\u05D5\u05E8 \u05D1\u05D9\u05EA",
    picker_date_title: "\u05D1\u05D7\u05E8 \u05EA\u05D0\u05E8\u05D9\u05DA (\u05D9\u05D5\u05DD/\u05D7\u05D5\u05D3\u05E9/\u05E9\u05E0\u05D4)",
    picker_time_title: "\u05D1\u05D7\u05E8 \u05E9\u05E2\u05D4 (24 \u05E9\u05E2\u05D5\u05EA)",
    btn_cancel: "\u05D1\u05D8\u05DC", btn_ok: "\u05D1\u05D7\u05E8",
    error_fill: "\u05E0\u05D0 \u05DC\u05DE\u05DC\u05D0 \u05EA\u05D0\u05E8\u05D9\u05DA, \u05E9\u05E2\u05D5\u05EA \u05D5\u05D8\u05DC\u05E4\u05D5\u05DF \u05EA\u05E7\u05D9\u05E0\u05D9\u05DD.",
    preview_title: "\u05E7\u05D9\u05E9\u05D5\u05E8 \u05DC\u05EA\u05D5\u05E8:",
    wa_button: "\u05E9\u05DC\u05D9\u05D7\u05D4 \u05D1\u200E-WhatsApp",
    wa_msg_prefix: "\u05E9\u05DC\u05D5\u05DD ",
    wa_msg_suffix: ", \u05D4\u05E0\u05D4 \u05D4\u05E7\u05D9\u05E9\u05D5\u05E8 \u05DC\u05E7\u05D1\u05E2\u05EA \u05D4\u05EA\u05D5\u05E8 \u05E9\u05DC\u05DA:\n",
    footer: "\u00A9 {year} \u05D9\u05D5\u05E0\u05EA\u05DF \u05D3\u05D5\u05E8\u05D9 \u2014 \u05DB\u05DC \u05D4\u05D6\u05DB\u05D5\u05D9\u05D5\u05EA \u05E9\u05DE\u05D5\u05E8\u05D5\u05EA"
  };

  // Apply i18n
  document.title = i18n.title;
  const t = (key) => i18n[key] || '';
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.getAttribute('data-i18n')); });
  const phone = document.getElementById('phone'); if (phone) phone.placeholder = i18n.phone_ph;
  const titleInput = document.getElementById('title'); if (titleInput) titleInput.value = i18n.title_value;
  const dateInputEl = document.getElementById('date'); if (dateInputEl) dateInputEl.placeholder = i18n.date_ph;
  const startInputEl = document.getElementById('start'); if (startInputEl) startInputEl.placeholder = i18n.time_ph;
  const endInputEl = document.getElementById('end'); if (endInputEl) endInputEl.placeholder = i18n.time_ph;
  const loc1 = document.getElementById('loc1'); if (loc1) loc1.value = i18n.loc_tlv_val;
  const loc2 = document.getElementById('loc2'); if (loc2) loc2.value = i18n.loc_rg_val;
  const loc3 = document.getElementById('loc3'); if (loc3) loc3.value = i18n.loc_home_val;
  if (loc1) loc1.checked = true;
  const footerText = document.getElementById('footerText'); if (footerText) footerText.textContent = i18n.footer.replace('{year}','');

  // --- Helpers ---
  const b64url = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/g,'');
  const pad2 = (n) => String(n).padStart(2,'0');

  function parseDateILToISO(val){
    if(!val) return null;
    const m = String(val).trim().match(/^\s*(\d{1,2})[\/.](\d{1,2})[\/.](\d{4})\s*$/);
    if(!m) return null;
    let d=+m[1], mo=+m[2], y=+m[3];
    if(y<1900||mo<1||mo>12||d<1||d>31) return null;
    const dim=[31,(y%4===0&& (y%100!==0||y%400===0))?29:28,31,30,31,30,31,31,30,31,30,31][mo-1];
    if(d>dim) return null;
    return `${y}-${pad2(mo)}-${pad2(d)}`;
  }
  function normalizeTime(val){
    if(!val) return null;
    const m = String(val).trim().match(/^([0-2]?\d):([0-5]\d)$/);
    if(!m) return null;
    let hh=+m[1], mm=+m[2];
    if(hh>23) return null;
    return `${pad2(hh)}:${pad2(mm)}`;
  }

  // --- Custom Pickers ---
  const dateInput = document.getElementById('date');
  const startInput = document.getElementById('start');
  const endInput = document.getElementById('end');

  // Date picker elements
  const dp = {
    overlay: document.getElementById('datePicker'),
    day: document.getElementById('dp-day'),
    month: document.getElementById('dp-month'),
    year: document.getElementById('dp-year'),
    ok: document.getElementById('dp-ok'),
    cancel: document.getElementById('dp-cancel')
  };
  // Time picker elements
  const tp = {
    overlay: document.getElementById('timePicker'),
    hour: document.getElementById('tp-hour'),
    minute: document.getElementById('tp-minute'),
    ok: document.getElementById('tp-ok'),
    cancel: document.getElementById('tp-cancel'),
    target: null
  };
  const show=(el)=>{ if(el){ el.style.display='flex'; el.setAttribute('aria-hidden','false'); } };
  const hide=(el)=>{ if(el){ el.style.display='none'; el.setAttribute('aria-hidden','true'); } };
  const daysInMonth=(y,m)=> new Date(y,m,0).getDate();

  function fillDateOptions(y,m,d){
    const nowY=new Date().getFullYear();
    const years=[]; for(let i=nowY-1;i<=nowY+2;i++) years.push(i);
    dp.year.innerHTML = years.map(v=>`<option value="${v}">${v}</option>`).join(''); dp.year.value=String(y);
    dp.month.innerHTML = Array.from({length:12},(_,i)=>`<option value="${i+1}">${pad2(i+1)}</option>`).join(''); dp.month.value=String(m);
    const dim=daysInMonth(y,m);
    dp.day.innerHTML = Array.from({length:dim},(_,i)=>`<option value="${i+1}">${pad2(i+1)}</option>`).join(''); dp.day.value=String(Math.min(d,dim));
  }
  function openDatePicker(target){
    let d=1,m=1,y=new Date().getFullYear();
    const iso = parseDateILToISO(target.value);
    if(iso){ const [yy,mm,dd]=iso.split('-'); y=+yy; m=+mm; d=+dd; }
    fillDateOptions(y,m,d); show(dp.overlay);
    const onChange=()=>{ const ny=+dp.year.value, nm=+dp.month.value, nd=+dp.day.value; fillDateOptions(ny,nm,nd); };
    dp.month.onchange=onChange; dp.year.onchange=onChange;
    dp.ok.onclick=()=>{ const ny=dp.year.value, nm=dp.month.value, nd=dp.day.value; target.value=`${pad2(nd)}/${pad2(nm)}/${ny}`; hide(dp.overlay); };
    dp.cancel.onclick=()=> hide(dp.overlay);
    dp.overlay.onclick=(e)=>{ if(e.target===dp.overlay) hide(dp.overlay); };
  }
  function fillTimeOptions(hh,mm){
    tp.hour.innerHTML = Array.from({length:24},(_,i)=>`<option value="${pad2(i)}">${pad2(i)}</option>`).join(''); tp.hour.value=pad2(hh);
    tp.minute.innerHTML = Array.from({length:60},(_,i)=>`<option value="${pad2(i)}">${pad2(i)}</option>`).join(''); tp.minute.value=pad2(mm);
  }
  function openTimePicker(target){
    const n = normalizeTime(target.value) || '09:00';
    const [hh,mm] = n.split(':').map(x=>+x);
    fillTimeOptions(hh,mm); tp.target=target; show(tp.overlay);
  }
  if(dateInput){ dateInput.addEventListener('click',()=>openDatePicker(dateInput)); dateInput.addEventListener('keydown',e=>e.preventDefault()); }
  [startInput,endInput].forEach(inp=>{ if(!inp) return; inp.addEventListener('click',()=>openTimePicker(inp)); inp.addEventListener('keydown',e=>e.preventDefault()); });
  if(tp.ok) tp.ok.onclick=()=>{ if(!tp.target){ hide(tp.overlay); return; } tp.target.value=`${tp.hour.value}:${tp.minute.value}`; hide(tp.overlay); };
  if(tp.cancel) tp.cancel.onclick=()=> hide(tp.overlay);
  if(tp.overlay) tp.overlay.onclick=(e)=>{ if(e.target===tp.overlay) hide(tp.overlay); };

  // --- Submit handling ---
  async function shortenWithTiny(url){
    try{
      const res = await fetch('https://tinyurl.com/api-create.php?url='+encodeURIComponent(url));
      if(!res.ok) throw new Error('tiny failed');
      const t = (await res.text()).trim();
      if(!/^https?:\/\//i.test(t)) throw new Error('tiny bad');
      return t;
    }catch(_){ return url; }
  }

  if(!form){ console.error('sendForm not found'); return; }
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const client = document.getElementById('client').value.trim();
    const phoneRaw = document.getElementById('phone').value.trim();
    const title = document.getElementById('title').value.trim();
    const dateRaw = document.getElementById('date').value;
    const startRaw = document.getElementById('start').value;
    const endRaw = document.getElementById('end').value;
    const notes = document.getElementById('notes').value.trim();

    const date = parseDateILToISO(dateRaw);
    const start = normalizeTime(startRaw);
    const end = normalizeTime(endRaw);
    if(!date || !start || !end || !phoneRaw){
      alert(i18n.error_fill);
      return;
    }

    const locVal = document.querySelector('input[name="location"]:checked').value;
    const [branchName, addressFull] = locVal.split('|').map(v=>v.trim());
    const startFull = `${date}T${start}`;
    const endFull = `${date}T${end}`;
    const isHome = branchName === addressFull;

    const qs = new URLSearchParams({ client, title, start: startFull, end: endFull, notes, location: addressFull, branch: branchName, home: isHome?'1':'0' }).toString();
    const longUrl = `${BASE_URL}?${qs}`;

    // Compact hash payload (stable, no non-ASCII issues)
    const payload = { c: client, t: title, s: startFull, e: endFull, n: notes, l: addressFull, b: branchName, h: isHome?1:0 };
    const shortUrl = `${BASE_URL}#${b64url(JSON.stringify(payload))}`;

    // Normalize phone to international (IL +972)
    let phone = phoneRaw.replace(/\D/g,''); if(phone.startsWith('0')) phone = '972'+phone.slice(1);

    preview.style.display = 'block';
    preview.innerHTML = `
      <p><strong>${i18n.preview_title}</strong></p>
      <a id="apptLink" href="${shortUrl}" target="_blank" rel="noopener">${shortUrl}</a><br><br>
      <button id="btnSendWA" class="btn-whatsapp" type="button">${i18n.wa_button}</button>
    `;

    const btn = document.getElementById('btnSendWA');
    btn.addEventListener('click', async ()=>{
      btn.disabled = true;
      const finalUrl = await shortenWithTiny(longUrl);
      const msg = `${i18n.wa_msg_prefix}${client}${i18n.wa_msg_suffix}${finalUrl}`;
      const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
      window.open(waLink, '_blank');
      btn.disabled = false;
    });
  });

  // Footer year
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();
});
