import clsx from 'clsx';
import React from 'react';
import {
  getDates,
  isSameDay,
  MONTHS,
  DAYS,
  SLOT_HEIGHT,
  minutesToTimeString,
  minutesAreInTimeFrame,
} from '../timeUtils';
import AddEvent from '../components/AddEvent';
import DateSelection from './DateSelection';
import {
  useFloating,
  useDismiss,
  offset,
  flip,
  shift,
  autoUpdate,
  FloatingPortal,
  computePosition,
  autoPlacement,
} from '@floating-ui/react';
import { motion } from 'motion/react';

export default function Calendar(props) {
  //Statics
  const SLOT_INTERVAL = 15;
  const SLOTS_PER_DAY = (24 * 60) / SLOT_INTERVAL;

  //State
  const [showEvent, setShowEvent] = React.useState(false);
  const [selectedSlots, setSelectedSlots] = React.useState({
    startSlot: null,
    endSlot: null,
  });

  React.useEffect(() => {
    if (!showEvent) setSelectedSlots({ startSlot: null, endSlot: null });
  }, [showEvent]);

  //ref
  const dragRef = React.useRef({
    pointerId: null,
    isDragging: false,
    startDay: null,
  });

  //Derived Variables
  const dates = getDates(props.startDate, props.endDate);
  const showSelectionDiv = showEvent || Boolean(selectedSlots.startSlot && selectedSlots.endSlot);

  //floating
  const { refs, floatingStyles, context } = useFloating({
    open: showEvent,
    onOpenChange: setShowEvent,

    strategy: 'fixed',
    placement: 'right-start',
    whileElementsMounted: autoUpdate,
    middleware: [offset(10), flip(), shift({ padding: 8 })],
  });

  const dismiss = useDismiss(context);

  //functions

  const pointerToMinutes = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const slotIndex = Math.floor(y / SLOT_HEIGHT);
    const minutes = props.startMinutes + slotIndex * SLOT_INTERVAL;
    if (minutes > props.endMinutes) return props.endMinutes;
    if (minutes < props.startMinutes) return props.startMinutes;
    return minutes;
  };

  function handleDragStart(e, date) {
    e.currentTarget.setPointerCapture(e.pointerId);
    const minutes = pointerToMinutes(e);
    if (checkIfSlotIsOccupied(date, minutes)) return;
    setShowEvent(false);
    dragRef.current.isDragging = true;
    dragRef.current.pointerId = e.pointerId;
    dragRef.current.startDay = date;

    setSelectedSlots({ startSlot: { date: date, minutes: minutes }, endSlot: { date: date, minutes: minutes } });
  }

  function handleDragMove(e, date) {
    if (!dragRef.current.isDragging) return;
    if (e.pointerId !== dragRef.current.pointerId) return;
    if (!isSameDay(date, dragRef.current.startDay)) return;
    const minutes = pointerToMinutes(e);
    if (minutes == null) return;
    setSelectedSlots((prev) => ({
      ...prev,
      endSlot: { date, minutes },
    }));
  }

  function handleDragEnd(e, date) {
    if (e.pointerId !== dragRef.current.pointerId) return;
    dragRef.current.isDragging = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    dragRef.current.pointerId = null;
    const minutes = pointerToMinutes(e);
    setSelectedSlots((prev) => {
      const didSelect = minutes !== prev.startSlot.minutes;
      const next = didSelect ? { ...prev, endSlot: { date, minutes } } : { startSlot: null, endSlot: null };
      setShowEvent(didSelect);
      return next;
    });
  }

  function handleCancel(e, date) {
    if (e.pointerId !== dragRef.current.pointerId) return;
    dragRef.current.isDragging = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    dragRef.current.pointerId = null;
  }

  function checkIfSlotIsOccupied(date, minutesFromStart) {
    return props.events.some(
      (e) =>
        isSameDay(e.date, date) &&
        e.start + SLOT_INTERVAL <= minutesFromStart &&
        minutesFromStart <= e.end - SLOT_INTERVAL,
    );
  }

  //Create blocks
  function createTimeSlots(date) {
    const slots = Array.from({ length: SLOTS_PER_DAY }, (_, i) => i);

    return slots.map((slotIndex) => {
      const minutesFromStart = slotIndex * SLOT_INTERVAL;

      if (minutesFromStart < props.startMinutes || minutesFromStart > props.endMinutes) {
        return null;
      }

      return (
        <div
          className={clsx('slot', {
            isOccupied: checkIfSlotIsOccupied(date, minutesFromStart),
            isFullHour: minutesFromStart % 60 === 0,
          })}
          key={`${date.toISOString()}-${minutesFromStart}`}
          role="gridcell">
          {`${minutesToTimeString(minutesFromStart)}`}
        </div>
      );
    });
  }

  function createEventsBlocks(date) {
    return props.events
      .filter(
        (e) => isSameDay(date, e.date) && minutesAreInTimeFrame(e.start, e.end, props.startMinutes, props.endMinutes),
      )
      .map((e) => (
        <button
          onPointerEnter={() => {
            props.onEventHoverStart(e);
          }}
          onPointerLeave={props.onEventHoverExit}
          style={{
            top: (e.start / SLOT_INTERVAL) * SLOT_HEIGHT - (props.startMinutes / SLOT_INTERVAL) * SLOT_HEIGHT,
            height: (e.end / SLOT_INTERVAL - e.start / SLOT_INTERVAL) * SLOT_HEIGHT,
          }}
          key={`${e.title}-${e.start}-${e.end}`}
          className={clsx('event', { currentSelection: props.selectedEvent === e })}>
          <span className="eventTitle">{e.title}</span>
        </button>
      ));
  }

  function createDateElements() {
    return dates.map((date) => {
      return (
        <div className="day" key={date.toISOString()}>
          <h3>{`${DAYS[date.getDay()]} ${date.getDate()}. ${MONTHS[date.getMonth()]} `}</h3>
          <div
            className="slots"
            onPointerCancel={(e) => handleCancel(e, date)}
            onPointerMove={(e) => handleDragMove(e, date)}
            onPointerDown={(e) => {
              handleDragStart(e, date);
            }}
            onPointerUp={(e) => handleDragEnd(e, date)}>
            {createTimeSlots(date)}
            {createEventsBlocks(date)}
            {showSelectionDiv &&
              isSameDay(date, selectedSlots.startSlot?.date) &&
              (() => {
                const min = Math.min(selectedSlots.startSlot.minutes, selectedSlots.endSlot.minutes);
                const max = Math.max(selectedSlots.startSlot.minutes, selectedSlots.endSlot.minutes);

                return (
                  <div
                    ref={refs.setReference}
                    style={{
                      top: ((min - props.startMinutes) / SLOT_INTERVAL) * SLOT_HEIGHT,
                      height: ((max - min) / SLOT_INTERVAL + 1) * SLOT_HEIGHT,
                    }}
                    className="selection"></div>
                );
              })()}
          </div>
        </div>
      );
    });
  }

  return (
    <>
      <motion.div
        className="calendar"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}>
        <DateSelection
          startDate={props.startDate}
          endDate={props.endDate}
          timeFrame={props.timeFrame}
          setTimeFrame={props.setTimeFrame}
        />{' '}
        <div className="dates">{createDateElements()}</div>
        {showEvent && selectedSlots.startSlot && selectedSlots.endSlot ?
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
            <AddEvent
              floatingRef={refs.setFloating}
              floatingStyle={floatingStyles}
              showEvent={showEvent}
              setShowEvent={setShowEvent}
              selectedSlots={selectedSlots}
              setSelectedSlots={setSelectedSlots}
              startDate={props.startDate}
              endDate={props.endDate}
              setEvents={props.setEvents}
              events={props.events}
              day={selectedSlots.startSlot.date}
              start={selectedSlots.startSlot.minutes}
              end={selectedSlots.endSlot.minutes}
            />
          </motion.div>
        : null}
      </motion.div>
    </>
  );
}
