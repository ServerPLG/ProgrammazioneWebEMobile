// Funzioni di validazione condivise (immagini e date).

function isDataImage(fotoProfilo) {
  return typeof fotoProfilo === 'string' && fotoProfilo.trim().startsWith('data:image/');
}

function getLocalDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isValidDateValue(dateValue) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;
}

function isFutureDateValue(dateValue) {
  return isValidDateValue(dateValue) && dateValue > getLocalDateValue();
}

module.exports = { isDataImage, getLocalDateValue, isValidDateValue, isFutureDateValue };
