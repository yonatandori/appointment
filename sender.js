document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("sendForm");
  const preview = document.getElementById("preview");
  const BASE_URL = "https://yonatandori.github.io/appointment/index.html";

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

  if (!form) {
    console.error("לא נמצא טופס sendForm");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const clientRaw = document.getElementById("client").value.trim();
    const phoneRaw = document.getElementById("phone").value.trim();
    const titleRaw = document.getElementById("title").value.trim();
    const date = document.getElementById("date").value;
    const start = document.getElementById("start").value;
    const end = document.getElementById("end").value;
    const notesRaw = document.getElementById("notes").value.trim();

    if (!clientRaw || !date || !start || !end || !phoneRaw) {
      alert("אנא מלא את כל השדות הנדרשים כולל שם ומספר טלפון.");
      return;
    }

    // מיקום (פרדסיה / תל אביב)
    const locationRaw = document.querySelector('input[name="location"]:checked').value;
    const [branchName, addressFull] = locationRaw.split("|").map((v) => v.trim());

    const client = encodeURIComponent(clientRaw);
    const title = encodeURIComponent(titleRaw);
    const notes = encodeURIComponent(notesRaw);

    const startFull = `${date}T${start}`;
    const endFull = `${date}T${end}`;

    // בניית הקישור הארוך לעמוד המטופל
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
      <button id="btnSendWA" class="btn-whatsapp" type="button">📲 שלח למטופל בוואטסאפ</button>
    `;

    const waBtn = document.getElementById("btnSendWA");

    waBtn.addEventListener("click", async () => {
      try {
        const urlToSend = document.getElementById("apptLink").href;

        // נסיון לקצר את הקישור
        const shortUrl = await shortenUrl(urlToSend);

        const msg =
          `שלום ${clientRaw}, זהו קישור עם פרטי התור שלך אצל יונתן דורי:\n` +
          shortUrl;

        const waLink =
          `https://wa.me/${phone}?text=` + encodeURIComponent(msg);

        window.open(waLink, "_blank");
      } catch (err) {
        // אם קיצור נכשל – שולחים את הקישור הארוך
        console.error("URL shortener error:", err);
        const urlToSend = document.getElementById("apptLink").href;
        const msg =
          `שלום ${clientRaw}, זהו קישור עם פרטי התור שלך אצל יונתן דורי:\n` +
          urlToSend;

        const waLink =
          `https://wa.me/${phone}?text=` + encodeURIComponent(msg);

        window.open(waLink, "_blank");
      }
    });
  });

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
