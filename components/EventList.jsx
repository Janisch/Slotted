import {
  getDateString,
  timeToMinutes,
  formatDate,
  isSameDay,
  minutesToTimeString,
  dateIsInTimeFrame,
} from '../timeUtils';
import React from 'react';

export default function EventList(props) {
  function deleteEvent(id) {
    props.setEvents((prevEvents) => {
      return prevEvents.filter((event) => {
        return event.id != id;
      });
    });
  }

  function updateEventOnChange(e, id) {
    const { name, value } = e.target;
    const timeFields = ['start', 'end'];
    const derivedValue = timeFields.includes(name) ? timeToMinutes(value) : value;

    props.setEvents((prev) => prev.map((ev) => (ev.id === id ? { ...ev, [name]: derivedValue } : ev)));
  }

  function createEventElements() {
    let lastDate = null;

    return props.events.map((event) => {
      const isNewDate = lastDate === null || !isSameDay(lastDate, event.date);
      lastDate = event.date;

      return (
        <React.Fragment key={event.id}>
          {isNewDate ?
            <h4 className="eventListDayHeader">{getDateString(event.date)}</h4>
          : null}

          <div
            className="eventListElement"
            onPointerEnter={() => props.onEventHoverStart(event)}
            onPointerLeave={props.onEventHoverExit}>
            <div className="eventListElementContent">
              <span>
                <input
                  onChange={(e) => updateEventOnChange(e, event.id)}
                  type="time"
                  name="start"
                  value={minutesToTimeString(event.start)}></input>
                <input
                  type="time"
                  name="end"
                  onChange={(e) => updateEventOnChange(e, event.id)}
                  value={minutesToTimeString(event.end)}></input>
              </span>{' '}
              <input
                type="text"
                name="title"
                onChange={(e) => updateEventOnChange(e, event.id)}
                value={event.title}></input>
            </div>{' '}
            <button className="deleteEvent" onClick={() => deleteEvent(event.id)}>
              X
            </button>
          </div>
        </React.Fragment>
      );
    });
  }

  return (
    <div className="eventListWrapper">
      <div className="eventList">{createEventElements()}</div>
    </div>
  );
}
