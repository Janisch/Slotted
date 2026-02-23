import { getDateString, formatDate, isSameDay, minutesToTimeString, isInTimeFrame } from '../timeUtils';
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

      const eventKey = `${formatDate(event.date)}-${event.start}-${event.end}-${event.title}`;
      const inFrame = isInTimeFrame(event.date, props.timeFrame.start, props.timeFrame.end);

      if (!inFrame) return null;

      return (
        <React.Fragment key={eventKey}>
          {isNewDate ?
            <h4>{getDateString(event.date)}</h4>
          : null}

          <div
            className="eventListElement"
            onPointerEnter={() => props.onEventHoverStart(event)}
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
