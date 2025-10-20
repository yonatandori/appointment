document.addEventListener("DOMContentLoaded", function() {
  const apptEl = document.getElementById("appt");
  const params = new URLSearchParams(window.location.search);

  // שליפת נתונים מה-URL + מיקום
const client = params.get("client") || "מטופל יקר";
const title = params.get("title") || "עיסוי רפואי";
const start = params.get("start") || "2025-10-22T09:00";
const end = params.get("end") || "2025-10-22T10:00";
const notes = params.get("notes") || "";
const location = params.get("location") || "פרדסיה, רח׳ הפרג 6"; // ברירת מחדל
const branch = params.get("branch") || "פרדסיה";

// קישורי ניווט
const encodedAddress = encodeURIComponent(location);
const gmapsLink = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
const wazeLink = `https://waze.com/ul?q=${encodedAddress}&navigate=yes`;

// שמירת הנתונים באלמנט
apptEl.dataset.clientName = client;
apptEl.dataset.title = title;
apptEl.dataset.startLocal = start;
apptEl.dataset.endLocal = end;
apptEl.dataset.location = location;
apptEl.dataset.notes = notes;

// הצגת הכתובת למטופל + קישורי מפה
document.getElementById("placeText").textContent = `${branch} – ${location}`;
document.getElementById("linkGmaps").href = gmapsLink;
document.getElementById("linkWaze").href = wazeLink;
// פרטי הגעה משתנים לפי הסניף
const arrivalInfo = document.getElementById("arrivalInfo");

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
} else {
  arrivalInfo.innerHTML = `
    <h3>פרטי הגעה – פרדסיה</h3>
    <p>
      הקליניקה נמצאת בקומת הקרקע ברחוב הפרג 6, עם גישה נוחה וחניה זמינה לרוב ממש בסמוך.<br>
      במידה ולא מצאת חניה, ניתן ליצור קשר בהגעה ואכוון אותך למקום פנוי צמוד לקליניקה.
    </p>
  `;
}


  // הצגה על המסך
  document.getElementById("clientName").textContent = decodeURIComponent(client);
  document.getElementById("dateText").textContent = new Date(start).toLocaleDateString("he-IL");
  document.getElementById("timeText").textContent =
    new Date(start).toLocaleTimeString("he-IL",{hour:"2-digit",minute:"2-digit"}) +
    " - " +
    new Date(end).toLocaleTimeString("he-IL",{hour:"2-digit",minute:"2-digit"});
  document.getElementById("notesText").textContent = decodeURIComponent(notes);
  document.getElementById("placeText").textContent = location;

  // עדכון כפתורי וואטסאפ
  const OWNER_PHONE = "972546257272";
  const waBase = `https://wa.me/${OWNER_PHONE}?text=`;
  const dateText = document.getElementById("dateText").textContent;
  const timeText = document.getElementById("timeText").textContent;

  const msgConfirm = `שלום יונתן, כאן ${decodeURIComponent(client)}. אני מאשר הגעה לטיפול "${decodeURIComponent(title)}" בתאריך ${dateText} בשעה ${timeText}.`;
  const msgCancel = `שלום יונתן, כאן ${decodeURIComponent(client)}. אני נאלץ לבטל את התור שנקבע ל-${dateText} בשעה ${timeText}.`;

  document.getElementById("btnConfirm").href = waBase + encodeURIComponent(msgConfirm);
  document.getElementById("btnCancel").href  = waBase + encodeURIComponent(msgCancel);

  // כפתור "הוסף ליומן"
  const startUTC = new Date(start).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const endUTC = new Date(end).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startUTC}/${endUTC}&details=${encodeURIComponent(notes)}&location=${encodeURIComponent(location)}`;

  const btnAdd = document.getElementById("btnAddToCal");
  btnAdd.href = gcalUrl;
  btnAdd.target = "_blank";

  console.log("✅ נתוני התור נטענו בהצלחה למטופל:", client, title, start);
});



