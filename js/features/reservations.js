import { get, set, generateId } from '../core/store.js';
import config from '../config.js';

const RESERVATIONS_KEY = 'reservations';
const GUEST_ID_KEY = 'guest_id';

const getReservations = () => get(RESERVATIONS_KEY, []);
const saveReservations = reservations => set(RESERVATIONS_KEY, reservations);

export const getOrCreateGuestId = () => {
  let guestId = get(GUEST_ID_KEY, null);
  if (!guestId) {
    guestId = generateId('guest');
    set(GUEST_ID_KEY, guestId);
  }
  return guestId;
};

export const getTimeSlots = dateStr => {
  const day = new Date(`${dateStr}T00:00:00`).getDay();
  const hours = config.hours.find(h => h.day === day);
  if (!hours) return [];

  const [openH, openM] = hours.open.split(':').map(Number);
  const [closeH, closeM] = hours.close.split(':').map(Number);
  const openMins = openH * 60 + openM;
  const closeMins = closeH * 60 + closeM - 60;

  const slots = [];
  for (let mins = openMins; mins <= closeMins; mins += 30) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
  return slots;
};

const hashString = str => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

export const getAvailability = (date, time) => {
  if (!date || !time) return null;
  const tablesAvailable = hashString(`${date}-${time}`) % 9;
  return { tablesAvailable, full: tablesAvailable === 0 };
};

export const createReservation = ({ date, time, partySize, name, phone, notes, userId = null }) => {
  const reservation = {
    id: generateId('res'),
    userId,
    name,
    phone,
    date,
    time,
    partySize,
    notes,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };

  const reservations = getReservations();
  reservations.push(reservation);
  saveReservations(reservations);

  return reservation;
};

export const getUserReservations = userId => getReservations()
  .filter(r => r.userId === userId)
  .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

const toICSDate = (date, time) => {
  const [h, m] = time.split(':');
  const dt = new Date(`${date}T${time}:00`);
  const pad = n => String(n).padStart(2, '0');
  return `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}00`;
};

export const buildICS = reservation => {
  const start = toICSDate(reservation.date, reservation.time);
  const endDate = new Date(`${reservation.date}T${reservation.time}:00`);
  endDate.setHours(endDate.getHours() + 2);
  const pad = n => String(n).padStart(2, '0');
  const end = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kristy\'s Kitchen//Reservations//EN',
    'BEGIN:VEVENT',
    `UID:${reservation.id}@kristyskitchen`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:Table Reservation at ${config.name}`,
    `DESCRIPTION:Reservation for ${reservation.partySize} guest(s).${reservation.notes ? ` Notes: ${reservation.notes}` : ''}`,
    'LOCATION:Kristy\'s Kitchen',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
};

export const downloadICS = reservation => {
  const ics = buildICS(reservation);
  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `reservation-${reservation.id}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
