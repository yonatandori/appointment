document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById("sendForm");
  const preview = document.getElementById("preview");
  const BASE_URL = "https://yonatandori.github.io/appointment/index.html";

  if (!form) {
    console.error("⚠️ לא נמצא אלמנט sendForm בדף!");
    return;
  }

  form.addEventListener("submit", function(e) {
    e.preventDefault();

    const client = encodeURIComponent(document.getElementById("client").value.trim());
    const phoneRaw = document.getElementById("phone").value.trim();
    const title = encodeURIComponent(document.getElementById("title").value.trim());
    const date = document.getElementById("date").value;
    const start = document.getElementById("start").value;
    const end = document.getElementById("end").value;
    const notes = encodeURIComponent(document.getElementById("notes").value.trim());

    if (!date || !start || !end || !phoneRaw) {
      alert("אנא מלא את כל השדות הנדרשים כולל מספר טלפון.");
      return;
    }

    const startFull = `${date}T${start}`;
    const endFull = `${date}T${end}`;

   // בחירת כתובת לפי הרדיו שנבחר
const location = encodeURIComponent(document.querySelector('input[name="location"]:checked').value);

// בונה קישור לדף המטופל כולל הכתובת
const url = `${BASE_URL}?client=${client}&title=${title}&start=${startFull}&end=${endFull}&notes=${notes}&location=${location}`;
const decodedUrl = decodeURIComponent(url);


    let phone = phoneRaw.replace(/\D/g, "");
    if (phone.startsWith("0")) phone = "972" + phone.substring(1);

    // הודעת וואטסאפ (ללא קידוד כפול)
const msg = `שלום ${decodeURIComponent(client)}, זהו קישור עם פרטי התור שלך אצל יונתן דורי:\n${decodedUrl}`;
const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`.replace(/%26/g, "&");


    preview.style.display = "block";
    preview.innerHTML = `
      <p><strong>קישור נוצר בהצלחה:</strong></p>
      <a href="${decodedUrl}" target="_blank">${decodedUrl}</a><br><br>
      <a class="btn-whatsapp" href="${waLink}" target="_blank">📲 שלח למטופל בוואטסאפ</a>
    `;
  });

  // הדפסת שנה בפוטר (אם קיימת)
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  console.log("✅ sender.js נטען בהצלחה והאירוע הופעל");
});


