import './App.css';
import React from 'react';
import Calendar from '../components/Calendar';
import SelectTimeFrame from '../components/SelectTimeFrame';
import EventList from '../components/EventList';
import AddEvent from '../components/AddEvent';

function App() {
  //State
  const [events, setEvents] = React.useState([]);
  const [selectedEvent, setSelectedEvent] = React.useState(null);

  const [timeFrame, setTimeFrame] = React.useState({
    startDate: null,
    endDate: null,
    startMinutes: 0,
    endMinutes: 1410,
    slotInterval: 30,
  });

  //Derived Variables
  const timeFrameIsEmpty = !Boolean(timeFrame.startDate && timeFrame.endDate);

  //Statics
  function handleEventHover(event) {
    setSelectedEvent((prevSelectedEvent) => {
      return event != prevSelectedEvent ? event : prevSelectedEvent;
    });
  }

  return (
    <>
      <main>
        {timeFrameIsEmpty ?
          <SelectTimeFrame timeFrame={timeFrame} setTimeFrame={setTimeFrame} />
        : <>
            <section className="eventControlContainer">
              {<AddEvent setEvents={setEvents} timeFrame={timeFrame} />}
              {events.length > 0 ?
                <EventList
                  timeFrame={timeFrame}
                  events={events}
                  setEvents={setEvents}
                  setSelectedEvent={setSelectedEvent}
                  selectedEvent={selectedEvent}
                  onEventHoverStart={handleEventHover}
                  onEventHoverExit={handleEventHover}
                />
              : null}
            </section>

            <Calendar
              slotInterval={timeFrame.slotInterval}
              timeFrame={timeFrame}
              setTimeFrame={setTimeFrame}
              startMinutes={timeFrame.startMinutes}
              endMinutes={timeFrame.endMinutes}
              startDate={timeFrame.startDate}
              endDate={timeFrame.endDate}
              events={events}
              setEvents={setEvents}
              selectedEvent={selectedEvent}
              onEventHoverStart={handleEventHover}
              onEventHoverExit={handleEventHover}
            />
          </>
        }
      </main>
    </>
  );
}

export default App;
