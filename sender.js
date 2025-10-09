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

// --- מיקום הטיפול ---
// בודק בזמן אמת איזו כתובת נבחרה
let locationRaw = "";
const radios = document.getElementsByName("location");
for (const radio of radios) {
  if (radio.checked) {
    locationRaw = radio.value;
    break;
  }
}

const [branchName, addressFull] = locationRaw.split("|").map(v => v.trim());

// --- בונה את הקישור עם הכתובת ---
// חשוב: לא לקודד כאן! app.js כבר מטפל בקידוד בעצמו
const url = `${BASE_URL}?client=${encodeURIComponent(client)}&title=${encodeURIComponent(title)}&start=${encodeURIComponent(startFull)}&end=${encodeURIComponent(endFull)}&notes=${encodeURIComponent(notes)}&location=${encodeURIComponent(addressFull)}&branch=${encodeURIComponent(branchName)}`;

const decodedUrl = decodeURIComponent(url);


    let phone = phoneRaw.replace(/\D/g, "");
    if (phone.startsWith("0")) phone = "972" + phone.substring(1);

    
// הודעת וואטסאפ - שומר על הקישור נקי ותקין
const messageText = `שלום ${decodeURIComponent(client)}, זהו קישור עם פרטי התור שלך אצל יונתן דורי:\n\n`;
const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(messageText)} ${decodedUrl}`;




    preview.style.display = "block";
    preview.innerHTML = `
      <p><strong>קישור נוצר בהצלחה:</strong></p>
      <a href="${decodedUrl}" target="_blank">${decodedUrl}</a><br><br>
      <a class="btn-whatsapp" href="${waLink}" target="_blank">📲 שלח למטופל בוואטסאפ</a>
      // מאזין ללחיצה על כפתור הוואטסאפ ומייצר את הקישור בזמן אמת
setTimeout(() => {
  const waBtn = document.getElementById("btnSendWA");
  if (!waBtn) return;

  waBtn.addEventListener("click", function (e) {
    e.preventDefault();
    let phone = phoneRaw.replace(/\D/g, "");
    if (phone.startsWith("0")) phone = "972" + phone.substring(1);

    const msg = `שלום ${decodeURIComponent(client)}, זהו קישור עם פרטי התור שלך אצל יונתן דורי:\n${decodedUrl}`;
    const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(waLink, "_blank");
  });
}, 100);

    `;
  });

  // הדפסת שנה בפוטר (אם קיימת)
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  console.log("✅ sender.js נטען בהצלחה והאירוע הופעל");
});









