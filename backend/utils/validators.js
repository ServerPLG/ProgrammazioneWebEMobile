// Validazioni condivise (immagini e date).

function isDataImage(fotoProfilo) {
  return typeof fotoProfilo === 'string' && fotoProfilo.trim().startsWith('data:image/');
}

function getLocalDateValue(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isValidDateValue(dateValue) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  if (!m) return false;
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function isFutureDateValue(dateValue) {
  return isValidDateValue(dateValue) && dateValue > getLocalDateValue();
}

module.exports = { isDataImage, getLocalDateValue, isValidDateValue, isFutureDateValue };
