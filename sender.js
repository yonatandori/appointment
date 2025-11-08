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
    const phoneRaw <!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>שליחת תור למטופל | יונתן דורי</title>
  <link rel="stylesheet" href="styles.css">
  <style>
    body {
      font-family: "Heebo", sans-serif;
      background: #f9f9f9;
      margin: 0;
      padding: 0;
      direction: rtl;
      text-align: center;
      color: #333;
    }

    header {
      background: #fff;
      padding: 20px 10px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }

    .logo {
      width: 80px;
      display: block;
      margin: 0 auto 10px;
    }

    h1 {
      margin: 0;
      font-size: 1.6em;
      color: #222;
    }

    main {
      max-width: 450px;
      margin: 30px auto;
      background: #fff;
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    }

    label {
      display: block;
      text-align: right;
      margin-bottom: 15px;
      font-weight: 600;
    }

    input, textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 6px;
      margin-top: 5px;
      font-size: 1em;
      font-family: inherit;
    }

    button {
      background: #2e7d32;
      color: #fff;
      border: none;
      padding: 12px 18px;
      border-radius: 8px;
      font-size: 1.1em;
      cursor: pointer;
      transition: background 0.3s;
      margin-top: 10px;
      width: 100%;
    }

    button:hover {
      background: #1b5e20;
    }

    .preview {
      background: #f1f1f1;
      border-radius: 8px;
      padding: 15px;
      margin-top: 20px;
      font-size: 0.95em;
      direction: ltr;
      text-align: left;
      word-break: break-all;
    }

    footer {
      margin: 30px 0;
      font-size: 0.85em;
      color: #777;
    }

    .btn-whatsapp {
      display: inline-block;
      background: #25d366;
      color: white;
      padding: 12px 18px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
      margin-top: 10px;
    }

    .btn-whatsapp:hover {
      background: #1ebe5b;
    }
  </style>
</head>
<body>
  <header>
    <img src="logo-yonatan.png" alt="לוגו יונתן דורי" class="logo">
    <h1>שליחת תור למטופל</h1>
  </header>

  <main>
    <form id="sendForm">
      <label>שם המטופל:
        <input type="text" id="client" required>
      </label>

      <label>טלפון המטופל (05...):
        <input type="tel" id="phone" pattern="05[0-9]{8}" placeholder="לדוגמה 0546257272" required>
      </label>

      <label>סוג טיפול:
        <input type="text" id="title" value="עיסוי רפואי – טיפול מלא" required>
      </label>

      <label>תאריך:
        <input type="date" id="date" required>
      </label>

      <label>שעת התחלה:
        <input type="time" id="start" required>
      </label>

      <label>שעת סיום:
        <input type="time" id="end" required>
      </label>

      <label>מיקום הטיפול:</label>
<div style="text-align:right; margin-bottom:15px;">
  <label>
    <input type="radio" name="location" value="פרדסיה|רח׳ הפרג 6, פרדסיה" checked>
    פרדסיה – רח׳ הפרג 6
  </label><br>
  <label>
    <input type="radio" name="location" value="תל אביב|רח׳ הזוהר 32 (בבלי), תל אביב">
    תל אביב – רח׳ הזוהר 32 (בבלי)
  </label>
</div>


      <label>הערות:
        <textarea id="notes" rows="2" placeholder="לדוגמה: כאב בצוואר, טיפול עדין..."></textarea>
      </label>

      <button type="submit">צור קישור</button>
    </form>

    <div id="preview" class="preview" style="display:none;"></div>
  </main>

  <footer>
    © <span id="year"></span> יונתן דורי – עיסוי רפואי
  </footer>

  <script src="sender.js"></script>
</body>
</html>



 = document.getElementById("phone").value.trim();
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

