import { formatDate, timeToMinutes, minutesToTimeString } from '../timeUtils';
import { getRandomPlaceholder } from '../placeholder';
import React from 'react';

export default function AddEvent(props) {
  const [randomPlaceholder, setRandomPlaceholder] = React.useState(() => getRandomPlaceholder());
  function addEvent(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const eventDate = formData.get('date');
    const eventStart = formData.get('startSlot');
    const eventEnd = formData.get('endSlot');
    const eventTitle = formData.get('titleInput');
    const newEvent = {
      title: eventTitle,
      date: formatDate(eventDate),
      start: timeToMinutes(eventStart),
      end: timeToMinutes(eventEnd),
      id: crypto.randomUUID(),
    };
    e.target.reset();
    props.setEvents((prevEvents) => {
      return [...prevEvents, newEvent].sort((a, b) => {
        const dateDiff = a.date - b.date;
        if (dateDiff !== 0) return dateDiff;

        const startDiff = a.start - b.start;
        if (startDiff !== 0) return startDiff;

        return a.end - b.end;
      });
    });
    props.setShowEvent ? props.setShowEvent(false) : null;
  }

  function updateSelectedSlotsOnChange(e) {
    const { name, value } = e.target;
    const time = name === 'date' ? formatDate(value) : timeToMinutes(value);
    props.setSelectedSlots((prevSelectedSlots) => {
      if (name === 'date') {
        return {
          ...prevSelectedSlots,
          startSlot: {
            ...prevSelectedSlots.startSlot,
            date: time,
          },
          endSlot: {
            ...prevSelectedSlots.endSlot,
            date: time,
          },
        };
      }
      return { ...prevSelectedSlots, [name]: { ...prevSelectedSlots[name], minutes: time } };
    });
  }

  return (
    <form
      className="addEvent"
      onSubmit={addEvent}
      onChange={props.setSelectedSlots ? updateSelectedSlotsOnChange : null}>
      <label htmlFor="titleInput">Titel</label>
      <input type="text" placeholder={randomPlaceholder} autoFocus name="titleInput" id="titleInput" required />
      <label htmlFor="date">Datum</label>
      <input
        type="date"
        required
        defaultValue={props.day ? formatDate(props.day) : formatDate(props.timeFrame.startDate)}
        min={props.startDate ? formatDate(props.startDate) : ''}
        max={props.endDate ? formatDate(props.endDate) : ''}
        name="date"
        id="date"
      />
      <label htmlFor="startSlot">Beginn</label>
      <input
        required
        type="time"
        name="startSlot"
        defaultValue={minutesToTimeString(props.start)}
        step={900}
        id="startSlot"></input>
      <label htmlFor="endSlot">Ende</label>
      <input
        required
        type="time"
        name="endSlot"
        defaultValue={minutesToTimeString(props.end)}
        step={900}
        id="endSlot"></input>
      <button type="submit">Hinzufügen</button>
    </form>
  );
}
