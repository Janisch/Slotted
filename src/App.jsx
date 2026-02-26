import './App.css';
import React from 'react';
import Calendar from '../components/Calendar';
import SelectTimeFrame from '../components/SelectTimeFrame';
import EventList from '../components/EventList';
import DateSelection from '../components/DateSelection';
import AddEvent from '../components/AddEvent';

function App() {
  //State
  const [events, setEvents] = React.useState([
    {
      title: 'DnD mit den Boys',
      date: new Date(2026, 1, 18),
      start: 600,
      end: 690,
      isSelected: false,
      id: crypto.randomUUID(),
    },
    {
      title: 'Call of Cthulhu',
      date: new Date(2026, 1, 19),
      start: 720,
      end: 790,
      isSelected: false,
      id: crypto.randomUUID(),
    },
  ]);

  const [selectedEvent, setSelectedEvent] = React.useState(null);

  //const [timeFrame, setTimeFrame] = React.useState({ start: null, end: null, startMinutes: 360, endMinutes: 1020, });
  const [timeFrame, setTimeFrame] = React.useState({
    startDate: new Date(2026, 1, 24),
    endDate: new Date(2026, 2, 2),
    startMinutes: 0,
    endMinutes: 1440,
  });

  //Derived Variables
  const timeFrameIsEmpty = !Boolean(timeFrame.startDate && timeFrame.endDate);

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
