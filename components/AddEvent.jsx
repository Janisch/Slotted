import { formatDate, timeToMinutes, minutesToTimeString } from '../timeUtils';
import { getRandomPlaceholder } from '../placeholder';
import React from 'react';

export default function AddEvent(props) {
  const [randomPlaceholder, setRandomPlaceholder] = React.useState(() => getRandomPlaceholder());
  const [eventForm, setEventForm] = React.useState({ title: "hey", date: props.day ? formatDate(props.day) : formatDate(props.timeFrame.startDate), start: minutesToTimeString(props.start), end: minutesToTimeString(props.end) });

  function addEvent(e) {
    e.preventDefault();
    const newEvent = {
      ...eventForm,
      id: crypto.randomUUID(),
    };

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

  function updateForm(e) {
    const { name, value } = e.target;

    setEventForm(prev => ({
      ...prev,
      [name]: value
    }));
  }

  return (
    <form
      className="addEvent"
      onSubmit={addEvent}
    >
      <label htmlFor="title">Titel</label>
      <input type="text" onChange={updateForm} placeholder={randomPlaceholder} value={eventForm.title} autoFocus name="title" id="title" required />
      <label htmlFor="date">Datum</label>
      <input
        type="date" onChange={updateForm}
        required
        value={eventForm.date}
        min={props.startDate ? formatDate(props.startDate) : ''}
        max={props.endDate ? formatDate(props.endDate) : ''}
        name="date"
        id="date"
      />
      <label htmlFor="start">Beginn</label>
      <input onChange={updateForm}
        required
        type="time"
        name="start"
        value={eventForm.start}
        step={900}
        id="start"></input>
      <label htmlFor="end">Ende</label>
      <input onChange={updateForm}
        required
        type="time"
        name="end"
        value={eventForm.end}
        step={900}
        id="end"></input>
      <button type="submit">Hinzufügen</button>
    </form>
  );
}
