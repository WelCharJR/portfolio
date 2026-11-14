export function localDateISO(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function dateInDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("pt-BR");
}

export function daysUntil(dateValue) {
  if (!dateValue) return null;
  let year, month, day;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    [year, month, day] = dateValue.split("-").map(Number);
  } else {
    [day, month, year] = dateValue.split("/").map(Number);
  }
  const due = new Date(year, month - 1, day);
  if (Number.isNaN(due.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due - today) / 86400000);
}
