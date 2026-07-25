import { getTimeSlots, getAvailability, createReservation, getUserReservations, downloadICS, getOrCreateGuestId } from '../features/reservations.js';
import { getCurrentUser } from '../core/auth.js';
import { rules, initFormValidation } from '../core/forms.js';
import { showToast } from '../core/toast.js';

let partySize = 2;
let lastReservation = null;

const formatDisplayDate = dateStr => new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const populateTimeSlots = () => {
  const dateInput = document.getElementById('reservation-date');
  const timeSelect = document.getElementById('reservation-time');
  if (!dateInput || !timeSelect) return;

  const slots = getTimeSlots(dateInput.value);
  timeSelect.innerHTML = '<option value="">Select a time</option>' +
    slots.map(slot => `<option value="${slot}">${slot}</option>`).join('');
};

const updateAvailability = () => {
  const date = document.getElementById('reservation-date')?.value;
  const time = document.getElementById('reservation-time')?.value;
  const indicator = document.getElementById('availability-indicator');
  if (!indicator) return;

  const availability = getAvailability(date, time);
  if (!availability) {
    indicator.innerHTML = '<span class="badge badge-info">Pick a date &amp; time</span>';
    return;
  }

  indicator.innerHTML = availability.full
    ? '<span class="badge badge-error">Fully booked — try another time</span>'
    : `<span class="badge badge-success">${availability.tablesAvailable} table${availability.tablesAvailable !== 1 ? 's' : ''} available</span>`;
};

const initPartySizeStepper = () => {
  const valueEl = document.getElementById('party-size-value');
  const hiddenInput = document.getElementById('reservation-party-size');

  const sync = () => {
    valueEl.textContent = partySize;
    hiddenInput.value = partySize;
  };

  document.getElementById('party-size-inc')?.addEventListener('click', () => {
    partySize = Math.min(20, partySize + 1);
    sync();
  });

  document.getElementById('party-size-dec')?.addEventListener('click', () => {
    partySize = Math.max(1, partySize - 1);
    sync();
  });
};

const showConfirmation = reservation => {
  lastReservation = reservation;
  document.getElementById('reservation-form').hidden = true;
  const confirmation = document.getElementById('reservation-confirmation');
  confirmation.hidden = false;
  document.getElementById('reservation-confirmation-details').textContent =
    `${formatDisplayDate(reservation.date)} at ${reservation.time} for ${reservation.partySize} guest${reservation.partySize !== 1 ? 's' : ''}.`;
  confirmation.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const renderMyReservations = () => {
  const user = getCurrentUser();
  const section = document.getElementById('my-reservations-section');
  const list = document.getElementById('my-reservations-list');
  if (!section || !list) return;

  const ownerId = user?.id ?? getOrCreateGuestId();
  const reservations = getUserReservations(ownerId);
  if (!reservations.length) {
    section.hidden = true;
    return;
  }

  section.hidden = false;
  list.innerHTML = reservations.map(r => `
    <div class="reservation-card">
      <span class="reservation-card-date">${formatDisplayDate(r.date)}</span>
      <span class="reservation-card-meta">${r.time} · ${r.partySize} guest${r.partySize !== 1 ? 's' : ''}</span>
    </div>
  `).join('');
};

export const init = () => {
  const dateInput = document.getElementById('reservation-date');
  const timeSelect = document.getElementById('reservation-time');
  const form = document.getElementById('reservation-form');

  partySize = 2;
  const today = new Date().toISOString().split('T')[0];
  if (dateInput) {
    dateInput.min = today;
    dateInput.value = today;
  }

  populateTimeSlots();
  updateAvailability();
  initPartySizeStepper();
  renderMyReservations();

  dateInput?.addEventListener('change', () => {
    populateTimeSlots();
    updateAvailability();
  });

  timeSelect?.addEventListener('change', updateAvailability);

  initFormValidation(form, {
    date: [rules.required('Please choose a date')],
    time: [rules.required('Please choose a time')],
    name: [rules.required('Please enter your name')],
    phone: [rules.required('Please enter your phone number'), rules.phone()]
  }, () => {
    const availability = getAvailability(dateInput.value, timeSelect.value);
    if (availability?.full) {
      showToast('That time is fully booked — please choose another', 'error');
      return;
    }

    const reservation = createReservation({
      date: dateInput.value,
      time: timeSelect.value,
      partySize,
      name: form.elements.namedItem('name').value.trim(),
      phone: form.elements.namedItem('phone').value.trim(),
      notes: form.elements.namedItem('notes').value.trim(),
      userId: getCurrentUser()?.id ?? getOrCreateGuestId()
    });

    showConfirmation(reservation);
    renderMyReservations();
  });

  document.getElementById('add-to-calendar-btn')?.addEventListener('click', () => {
    if (lastReservation) downloadICS(lastReservation);
  });

  document.getElementById('book-another-btn')?.addEventListener('click', () => {
    document.getElementById('reservation-confirmation').hidden = true;
    form.hidden = false;
    form.reset();
    partySize = 2;
    document.getElementById('party-size-value').textContent = 2;
    if (dateInput) dateInput.value = today;
    populateTimeSlots();
    updateAvailability();
  });
};
