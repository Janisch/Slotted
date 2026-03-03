import { formatDate, timeToMinutes, minutesToTimeString } from '../timeUtils';
import { getRandomPlaceholder } from '../placeholder';
import React from 'react';
import { useId } from 'react';

export default function AddEvent(props) {
  const [randomPlaceholder, setRandomPlaceholder] = React.useState(() => getRandomPlaceholder());
  const [eventForm, setEventForm] = React.useState({
    title: '',
    date: props.day ? props.day : props.timeFrame.startDate,
    start: props.start ? props.start : props.timeFrame.startMinutes,
    end: props.end ? props.end : props.timeFrame.endMinutes,
  });

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
    setEventForm((prevEventForm) => {
      return { ...prevEventForm, title: '' };
    });
    props.clearSelection();
  }

  function handleChange(e) {
    const { name, value } = e.target;

    const nextDate = name === 'date' ? formatDate(value) : null;
    const nextMinutes = name === 'start' || name === 'end' ? timeToMinutes(value) : null;

    setEventForm((prev) => {
      if (name === 'date') return { ...prev, date: nextDate };
      if (name === 'start' || name === 'end') return { ...prev, [name]: nextMinutes };
      return { ...prev, [name]: value };
    });

    props.setSelectedSlots((prev) => {
      if (name === 'date') {
        return {
          ...prev,
          startSlot: { ...prev.startSlot, date: nextDate },
          endSlot: { ...prev.endSlot, date: nextDate },
        };
      }
      if (name === 'start') {
        return {
          ...prev,
          startSlot: { ...prev.startSlot, minutes: nextMinutes },
        };
      }
      if (name === 'end') {
        return {
          ...prev,
          endSlot: { ...prev.endSlot, minutes: nextMinutes },
        };
      }
      return prev;
    });
  }

  const titleInputId = useId();
  const dateInputId = useId();
  const startInputId = useId();
  const endInputId = useId();

  return (
    <form className="addEvent" onSubmit={addEvent} style={props.floatingStyle} ref={props.floatingRef}>
      <label htmlFor={titleInputId}>Titel</label>
      <input
        type="text"
        onChange={handleChange}
        placeholder={randomPlaceholder}
        value={eventForm.title}
        autoFocus
        name="title"
        id={titleInputId}
        required
      />
      <label htmlFor={dateInputId}>Datum</label>
      <input
        type="date"
        onChange={handleChange}
        required
        value={formatDate(eventForm.date)}
        min={props.startDate ? formatDate(props.startDate) : ''}
        max={props.endDate ? formatDate(props.endDate) : ''}
        name="date"
        id={dateInputId}
      />
      <label htmlFor={startInputId}>Beginn</label>
      <input
        onChange={handleChange}
        required
        type="time"
        name="start"
        value={minutesToTimeString(eventForm.start)}
        step={900}
        id={startInputId}></input>
      <label htmlFor={endInputId}>Ende</label>
      <input
        onChange={handleChange}
        required
        type="time"
        name="end"
        value={minutesToTimeString(eventForm.end)}
        step={900}
        id={endInputId}></input>
      <button type="submit">Hinzufügen</button>
    </form>
  );
}
