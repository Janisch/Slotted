import { getDateString, formatDate, isSameDay, minutesToTimeString } from '../timeUtils';
import React from 'react';

export default function EventList(props) {
  function deleteEvent(index) {
    props.setEvents((prevEvents) => {
      return prevEvents.toSpliced(index, 1);
    });
  }

  function createEventElements() {
    let lastDate = null;

    return props.events.map((event, index) => {
      const isNewDate = lastDate === null || !isSameDay(lastDate, event.date);
      lastDate = event.date;

      const rowKey = `${formatDate(event.date)}-${event.start}-${event.end}-${event.title}`;

      return (
        <React.Fragment key={rowKey}>
          {isNewDate ?
            <h4>{getDateString(event.date)}</h4>
          : null}
          <div
            className="eventListElement"
            onPointerEnter={() => {
              props.onEventHoverStart(event);
            }}
            onPointerLeave={props.onEventHoverExit}>
            <button className="eventListElementContent">
              <span>
                {minutesToTimeString(event.start)} - {minutesToTimeString(event.end)}
              </span>{' '}
              {event.title}
            </button>{' '}
            <button className="deleteEvent" onClick={() => deleteEvent(index)}>
              X
            </button>
          </div>
        </React.Fragment>
      );
    });
  }

  return <div className="eventList">{createEventElements()}</div>;
}
