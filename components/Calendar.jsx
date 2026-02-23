import clsx from 'clsx';
import React from 'react';
import {
  getDates,
  minutesToTimeString,
  isSameDay,
  MONTHS,
  DAYS,
  SLOT_HEIGHT,
  minutesAreInTimeFrame,
} from '../timeUtils';
import AddEvent from '../components/AddEvent';
import {
  useFloating,
  useDismiss,
  useInteractions,
  offset,
  flip,
  shift,
  autoUpdate,
  autoPlacement,
} from '@floating-ui/react';
import { motion } from 'motion/react';

export default function Calendar(props) {
  //Statics
  const SLOT_INTERVAL = 15;
  const SLOTS_PER_DAY = (24 * 60) / SLOT_INTERVAL;

  //State
  const [selectedSlots, setSelectedSlots] = React.useState({
    isSelected: false,
    startSlot: null,
    endSlot: null,
  });
  const [showEvent, setShowEvent] = React.useState(false);

  React.useEffect(() => {
    if (!showEvent) {
      setSelectedSlots({
        isSelected: false,
        startSlot: null,
        endSlot: null,
      });
    }
  }, [showEvent]);

  //Derived Variables
  const dates = getDates(props.startDate, props.endDate);

  //floatUI
  const { refs, floatingStyles, context } = useFloating({
    open: showEvent,
    onOpenChange: (open) => {
      setShowEvent(open);
      if (!open) {
        setSelectedSlots({
          isSelected: false,
          startSlot: null,
          endSlot: null,
        });
      }
    },
    placement: 'right-start',
    middleware: [flip(), shift(), offset(10)],
  });

  useDismiss(context);

  function isInSelectedRange(date, minutesFromStart) {
    if (!selectedSlots.isSelected || !selectedSlots.startSlot || !selectedSlots.endSlot) return false;
    if (!isSameDay(date, selectedSlots.startSlot.date)) return false;

    const min = Math.min(selectedSlots.startSlot.minutes, selectedSlots.endSlot.minutes);
    const max = Math.max(selectedSlots.startSlot.minutes, selectedSlots.endSlot.minutes);

    return minutesFromStart >= min && minutesFromStart <= max;
  }

  //functions
  function checkIfSlotIsOccupied(date, minutesFromStart) {
    return props.events.some(
      (e) =>
        isSameDay(e.date, date) &&
        e.start + SLOT_INTERVAL <= minutesFromStart &&
        minutesFromStart <= e.end - SLOT_INTERVAL,
    );
  }

  function checkIfOccupiedSlotIsInRange(date, minutesStart, minutesEnd) {
    if (minutesStart == null || minutesEnd == null) return false;

    const min = Math.min(minutesStart, minutesEnd);
    const max = Math.max(minutesStart, minutesEnd);

    return props.events.some((e) => isSameDay(e.date, date) && min <= e.start && max >= e.end);
  }

  function createTimeSlots(date) {
    const slots = Array.from({ length: SLOTS_PER_DAY }, (_, i) => i);

    return slots.map((slotIndex) => {
      const minutesFromStart = slotIndex * SLOT_INTERVAL;
      const hour = Math.floor(minutesFromStart / 60);
      const minutes = minutesFromStart % 60;

      if (minutesFromStart < props.startMinutes || minutesFromStart > props.endMinutes) {
        return null;
      }

      return (
        <div
          className={clsx('slot', {
            isOccupied: checkIfSlotIsOccupied(date, minutesFromStart),
            isSelected: isInSelectedRange(date, minutesFromStart),
            isFullHour: minutesFromStart % 60 === 0,
          })}
          key={`${date.toISOString()}-${minutesFromStart}`}
          role="gridcell"
          onPointerDown={(e) => handleDragStart(e, date, minutesFromStart)}
          onPointerEnter={(e) => handleDragMove(e, date, minutesFromStart)}>
          {`${hour}:${String(minutes).padStart(2, '0')}`}
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
          <div className="slots">
            {createTimeSlots(date)}
            {createEventsBlocks(date)}
          </div>
        </div>
      );
    });
  }

  function handleDragStart(e, date, minutes) {
    setShowEvent(false);
    refs.setReference(e.currentTarget);
    setSelectedSlots(
      checkIfSlotIsOccupied(date, minutes) ?
        { isSelected: false, startSlot: null, endSlot: null }
      : {
          isSelected: true,
          startSlot: { date: date, minutes: minutes },
          endSlot: { date: date, minutes: minutes },
        },
    );
  }

  function handleDragMove(e, date, minutes) {
    if (e.pointerType === 'mouse' && (e.buttons & 1) !== 1) return;
    setSelectedSlots((prev) => {
      if (
        !prev.isSelected ||
        showEvent ||
        checkIfOccupiedSlotIsInRange(date, prev.startSlot.minutes, minutes) ||
        checkIfSlotIsOccupied(date, minutes)
      )
        return prev;
      return { ...prev, endSlot: { date, minutes } };
    });
  }

  function handleDragEnd(e) {
    setShowEvent(true);
    setSelectedSlots((prev) => {
      return prev.endSlot.minutes >= prev.startSlot.minutes ?
          { ...prev }
        : { ...prev, startSlot: prev.endSlot, endSlot: prev.startSlot };
    });
  }

  return (
    <>
      <motion.div
        className="calendar"
        onPointerUp={(e) => {
          if (selectedSlots.isSelected) handleDragEnd(e);
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}>
        <div className="dates">{createDateElements()}</div>
        {showEvent && selectedSlots.startSlot && selectedSlots.endSlot ?
          <motion.div
            ref={refs.setFloating}
            style={floatingStyles}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}>
            <AddEvent
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
