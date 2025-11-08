document.addEventListener("DOMContentLoaded", function() {
  const params = new URLSearchParams(window.location.search);

  const client = params.get("client") || "מטופל יקר";
  const title = params.get("title") || "עיסוי רפואי";
  const start = params.get("start") || "";
  const end = params.get("end") || "";
  const notes = params.get("notes") || "";
  const location = params.get("location") || "פרדסיה, רח׳ הפרג 6";
  const branch = params.get("branch") || "פרדסיה";

  const apptEl = document.getElementById("appt");
  if (apptEl) {
    apptEl.dataset.clientName = client;
    apptEl.dataset.title = title;
    apptEl.dataset.startLocal = start;
    apptEl.dataset.endLocal = end;
    apptEl.dataset.location = location;
    apptEl.dataset.notes = notes;
  }

  // עדכון כתובת ותצוגת מפות
  const placeTextEl = document.getElementById("placeText");
  const linkGmaps   = document.getElementById("linkGmaps");
  const linkWaze    = document.getElementById("linkWaze");

  if (placeTextEl) placeTextEl.textContent = `${branch} – ${location}`;

  if (branch === "בית המטופל") {
    if (linkGmaps) linkGmaps.style.display = "none";
    if (linkWaze)  linkWaze.style.display  = "none";
  } else {
    const encodedAddress = encodeURIComponent(location);
    const gmapsLink = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    const wazeLink  = `https://waze.com/ul?q=${encodedAddress}&navigate=yes`;
    if (linkGmaps) linkGmaps.href = gmapsLink;
    if (linkWaze)  linkWaze.href  = wazeLink;
  }

  // פרטי הגעה לפי הסניף
  const arrivalInfo = document.getElementById("arrivalInfo");
  if (!arrivalInfo) return;

  if (branch === "תל אביב") {
    arrivalInfo.innerHTML = `
      <h3>פרטי הגעה – תל אביב</h3>
      <p>
        הקליניקה ממוקמת בקומת הקרקע ברחוב הזוהר 32 (בבלי).<br>
        קיימות שתי כניסות:<br>
        • <strong>קליניקה 1</strong> – הכניסה משמאל לדלת הכניסה לבניין, ליד המכולת.<br>
        • <strong>קליניקה 2</strong> – הצמודה לדלת הכניסה הראשית של הבניין.
      </p>
    `;
  } else if (branch === "בית המטופל") {
    arrivalInfo.innerHTML = `
      <h3>פרטי הגעה – טיפול בבית המטופל</h3>
      <p>
        הטיפול יתקיים בביתך בהתאם לכתובת שסוכמה מראש עם יונתן.<br>
        אנא ודא שיש מקום מתאים למיטת טיפול או מזרן, וגישה נוחה לחניה או לפריקה.<br>
        במידת הצורך ניתן לתאם מראש פרטים נוספים מול יונתן בהודעה או בטלפון.
      </p>
    `;
  } else {
    arrivalInfo.innerHTML = `
      <h3>פרטי הגעה – פרדסיה</h3>
      <p>
        הקליניקה נמצאת בקומת הקרקע ברחוב הפרג 6, עם גישה נוחה וחניה זמינה לרוב ממש בסמוך.<br>
        במידה ולא מצאת חניה, ניתן ליצור קשר בהגעה ואכוון אותך למקום פנוי צמוד לקליניקה.
      </p>
    `;
  }
});
