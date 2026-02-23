import { formatDate, timeToMinutes, minutesToTimeString } from '../timeUtils';
import { getRandomPlaceholder } from '../placeholder';
import React from 'react';

export default function AddEvent(props) {
  const [randomPlaceholder, setRandomPlaceholder] = React.useState(() => getRandomPlaceholder());
  function addEvent(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const eventDate = formData.getAll('eventDateInput')[0];
    const eventStart = formData.getAll('eventStartInput')[0];
    const eventEnd = formData.getAll('eventEndInput')[0];
    const eventTitle = formData.getAll('titleInput')[0];
    const newEvent = {
      title: eventTitle,
      date: formatDate(eventDate),
      start: timeToMinutes(eventStart),
      end: timeToMinutes(eventEnd),
    };
    props.setEvents((prevEvents) => {
      return [...prevEvents, newEvent].sort((a, b) => a.date - b.date);
    });
    props.setShowEvent(false);
  }

  return (
    <form className="addEvent" onSubmit={addEvent}>
      <label htmlFor="titleInput">Titel</label>
      <input type="text" placeholder={randomPlaceholder} autoFocus name="titleInput" id="titleInput" required />
      <label htmlFor="eventDateInput">Datum</label>
      <input
        type="date"
        required
        defaultValue={formatDate(props.day)}
        min={formatDate(props.startDate)}
        max={formatDate(props.endDate)}
        name="eventDateInput"
        id="eventDateInput"
      />
      <label htmlFor="eventStartInput">Beginn</label>
      <input
        required
        type="time"
        name="eventStartInput"
        defaultValue={minutesToTimeString(props.start)}
        step={900}
        id="eventStartInput"></input>
      <label htmlFor="eventEndInput">Ende</label>
      <input
        required
        type="time"
        name="eventEndInput"
        defaultValue={minutesToTimeString(props.end)}
        step={900}
        id="eventEndInput"></input>
      <button type="submit">Hinzufügen</button>
    </form>
  );
}
