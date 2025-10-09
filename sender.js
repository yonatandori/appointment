(function init(){
  document.getElementById("year").textContent = new Date().getFullYear();

  const form = document.getElementById("sendForm");
  const preview = document.getElementById("preview");
  const BASE_URL = "https://yonatandori.github.io/appointment/index.html";
 //

  form.addEventListener("submit", e => {
    e.preventDefault();

    const client = encodeURIComponent(document.getElementById("client").value.trim());
    const phoneRaw = document.getElementById("phone").value.trim();
    const title = encodeURIComponent(document.getElementById("title").value.trim());
    const date = document.getElementById("date").value;
    const start = document.getElementById("start").value;
    const end = document.getElementById("end").value;
    const notes = encodeURIComponent(document.getElementById("notes").value.trim());

    if(!date || !start || !end || !phoneRaw){
      alert("אנא מלא את כל השדות הנדרשים כולל מספר טלפון.");
      return;
    }

    // בונה תאריך מלא ISO
    const startFull = `${date}T${start}`;
    const endFull   = `${date}T${end}`;

    // בונה קישור לדף המטופל
    const url = `${BASE_URL}?client=${client}&title=${title}&start=${startFull}&end=${endFull}&notes=${notes}`;
    const decodedUrl = decodeURIComponent(url);

    // ניקוי מספר טלפון לפורמט בינלאומי
    let phone = phoneRaw.replace(/\D/g, ""); // מסיר כל תו לא ספרתי
    if (phone.startsWith("0")) phone = "972" + phone.substring(1);

    // בונה הודעת וואטסאפ
    const msg = `שלום ${decodeURIComponent(client)}, זהו קישור עם פרטי התור שלך אצל יונתן דורי:\n${decodedUrl}`;
    const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

    // מציג תצוגה מקדימה + כפתור שליחה
    preview.innerHTML = `
      <p><strong>קישור נוצר:</strong><br><a href="${decodedUrl}" target="_blank">${decodedUrl}</a></p>
      <p><a class="btn primary" href="${waLink}" target="_blank">פתח הודעת וואטסאפ למטופל</a></p>
    `;
  });
})();

