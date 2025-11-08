// פונקציה לקיצור קישור באמצעות TinyURL
async function shortenUrl(longUrl) {
  const apiUrl = "https://tinyurl.com/api-create.php?url=" + encodeURIComponent(longUrl);
  const res = await fetch(apiUrl);
  if (!res.ok) {
    throw new Error("URL shortener failed");
  }
  const shortUrl = await res.text();
  return shortUrl.trim();
}

document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById("sendForm");
  const preview = document.getElementById("preview");
  const BASE_URL = "https://yonatandori.github.io/appointment/index.html";

  if (!form) {
    console.error("⚠️ לא נמצא אלמנט sendForm בדף!");
    return;
  }

 form.addEventListener("submit", e => {
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

  const locationRaw = document.querySelector('input[name="location"]:checked').value;
  const [branchName, addressFull] = locationRaw.split("|").map(v => v.trim());

  const startFull = `${date}T${start}`;
  const endFull = `${date}T${end}`;
  const BASE_URL = "https://yonatandori.github.io/appointment/index.html";

  const url = `${BASE_URL}?client=${client}&title=${title}&start=${startFull}&end=${endFull}&notes=${notes}&location=${encodeURIComponent(addressFull)}&branch=${encodeURIComponent(branchName)}`;
  const decodedUrl = decodeURIComponent(url);

  let phone = phoneRaw.replace(/\D/g, "");
  if (phone.startsWith("0")) phone = "972" + phone.substring(1);

  // מציג את הקישור שנוצר
  preview.style.display = "block";
  preview.innerHTML = `
    <p><strong>קישור נוצר בהצלחה:</strong></p>
    <a id="apptLink" href="${decodedUrl}" target="_blank">${decodedUrl}</a><br><br>
    <button id="btnSendWA" class="btn-whatsapp" type="button">📲 שלח למטופל בוואטסאפ</button>
  `;

  // מאזין ללחיצה על כפתור וואטסאפ
const waBtn = document.getElementById("btnSendWA");
waBtn.addEventListener("click", async () => {
  try {
    const urlToSend = document.getElementById("apptLink").href;
    let phone = phoneRaw.replace(/\D/g, "");
    if (phone.startsWith("0")) phone = "972" + phone.substring(1);

    // מקצר את הקישור לפני השליחה
    const shortUrl = await shortenUrl(urlToSend);

    const msg = `שלום ${decodeURIComponent(client)}, זהו קישור עם פרטי התור שלך אצל יונתן דורי:\n${shortUrl}`;
    const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(waLink, "_blank");
  } catch (err) {
    alert("לא הצלחתי לקצר את הקישור, אשלח את המלא במקום.");
    const urlToSend = document.getElementById("apptLink").href;
    let phone = phoneRaw.replace(/\D/g, "");
    if (phone.startsWith("0")) phone = "972" + phone.substring(1);
    const fallbackMsg = `שלום ${decodeURIComponent(client)}, זהו קישור עם פרטי התור שלך אצל יונתן דורי:\n${urlToSend}`;
    const fallbackLink = `https://wa.me/${phone}?text=${encodeURIComponent(fallbackMsg)}`;
    window.open(fallbackLink, "_blank");
  }
});


  // הדפסת שנה בפוטר (אם קיימת)
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  console.log("✅ sender.js נטען בהצלחה והאירוע הופעל");
});












