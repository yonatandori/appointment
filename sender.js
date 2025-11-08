document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("sendForm");
  const preview = document.getElementById("preview");
  const BASE_URL = "https://yonatandori.github.io/appointment/index.html";

  if (!form) {
    console.error("sendForm not found");
    return;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const clientRaw = document.getElementById("client").value.trim();
    const phoneRaw  = document.getElementById("phone").value.trim();
    const titleRaw  = document.getElementById("title").value.trim();
    const date      = document.getElementById("date").value;
    const start     = document.getElementById("start").value;
    const end       = document.getElementById("end").value;
    const notesRaw  = document.getElementById("notes").value.trim();

    if (!clientRaw || !phoneRaw || !date || !start || !end) {
      alert("אנא מלא שם, טלפון, תאריך ושעות.");
      return;
    }

    // מיקום (פרדסיה / תל אביב / בית המטופל)
    const locInput = document.querySelector('input[name="location"]:checked');
    let branchName = "פרדסיה";
    let addressFull = "רח׳ הפרג 6, פרדסיה";

    if (locInput) {
      const locationRaw = locInput.value; // למשל: "פרדסיה|רח׳ הפרג 6, פרדסיה"
      const parts = locationRaw.split("|");
      branchName  = (parts[0] || branchName).trim();
      addressFull = (parts[1] || addressFull).trim();
    }

    const client = encodeURIComponent(clientRaw);
    const title  = encodeURIComponent(titleRaw);
    const notes  = encodeURIComponent(notesRaw);

    const startFull = `${date}T${start}`;
    const endFull   = `${date}T${end}`;

    // בניית הקישור לעמוד המטופל
    const url =
      `${BASE_URL}?` +
      `client=${client}` +
      `&title=${title}` +
      `&start=${encodeURIComponent(startFull)}` +
      `&end=${encodeURIComponent(endFull)}` +
      `&notes=${notes}` +
      `&location=${encodeURIComponent(addressFull)}` +
      `&branch=${encodeURIComponent(branchName)}`;

    const decodedUrl = decodeURIComponent(url);

    // ניקוי מספר טלפון לפורמט בינלאומי
    let phone = phoneRaw.replace(/\D/g, "");
    if (phone.startsWith("0")) phone = "972" + phone.substring(1);

    // מציג את הקישור שנוצר
    preview.style.display = "block";
    preview.innerHTML = `
      <p><strong>קישור נוצר בהצלחה:</strong></p>
      <a id="apptLink" href="${decodedUrl}" target="_blank">${decodedUrl}</a><br><br>
      <a id="btnSendWA" class="btn-whatsapp" target="_blank">📲 שלח למטופל בוואטסאפ</a>
    `;

    const waBtn = document.getElementById("btnSendWA");

    waBtn.addEventListener("click", function () {
      const urlToSend = document.getElementById("apptLink").href;
      const msg = `שלום ${clientRaw}, זהו קישור עם פרטי התור שלך אצל יונתן דורי:\n${urlToSend}`;
      const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
      window.open(waLink, "_blank");
    });
  });

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
