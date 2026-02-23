export const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
export const DAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
//Static
const slotHeight = getComputedStyle(document.documentElement).getPropertyValue('--slot-height').trim();
export const SLOT_HEIGHT = parseInt(slotHeight);

export function getDates(startDate, endDate) {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const dates = [];
  for (let q = startDate.getTime(); q <= endDate.getTime(); q += ONE_DAY) {
    dates.push(new Date(q));
  }
  return dates;
}

export function roundTime(minutes, slotInterval = 30) {}

export function timeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  return totalMinutes;
}

export function minutesToTimeString(minutesFromStart) {
  const hours = Math.floor(minutesFromStart / 60);
  const mins = minutesFromStart % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function getDateString(date) {
  return `${date.getDate()}. ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function formatDate(date) {
  console.log(date);
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } else {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
}
