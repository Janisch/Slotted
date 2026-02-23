import './App.css';
import React from 'react';
import Calendar from '../components/Calendar';
import SelectTimeFrame from '../components/SelectTimeFrame';
import EventList from '../components/EventList';
import DateSelection from '../components/DateSelection';

function App() {
  //State
  const [events, setEvents] = React.useState([
    { title: 'DnD mit den Boys', date: new Date(2026, 1, 18), start: 0, end: 90 },
    { title: 'Call of Cthulhu', date: new Date(2026, 1, 19), start: 60, end: 120 },
  ]);

  const [selectedEvent, setSelectedEvent] = React.useState(null);

  //const [timeFrame, setTimeFrame] = React.useState({ start: null, end: null });
  const [timeFrame, setTimeFrame] = React.useState({ start: new Date(2026, 1, 16), end: new Date(2026, 1, 22) });

  //Derived Variables
  const timeFrameIsEmpty = !Boolean(timeFrame.start && timeFrame.end);

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
              <DateSelection
                startDate={timeFrame.start}
                endDate={timeFrame.end}
                timeFrame={timeFrame}
                setTimeFrame={setTimeFrame}
              />
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
              startDate={timeFrame.start}
              endDate={timeFrame.end}
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
