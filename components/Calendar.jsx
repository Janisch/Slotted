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
import { useFloating, useDismiss, offset, flip, shift, autoUpdate } from '@floating-ui/react';
import { motion } from 'motion/react';

export default function Calendar(props) {
  //Statics
  const SLOT_INTERVAL = 30;
  const SLOTS_PER_DAY = (24 * 60) / SLOT_INTERVAL;

  //State

  const [eventDragPreview, setEventDragPreview] = React.useState({ start: null, end: null, eventId: null });
  const [selectedSlots, setSelectedSlots] = React.useState({
    startSlot: null,
    endSlot: null,
  });
  const [selectionCommitted, setSelectionCommitted] = React.useState(false);

  //ref
  const dragRef = React.useRef({
    mode: null, //create || move
    pointerId: null,
    isDragging: false,
    startDay: null,
    //events
    eventId: null,
    eventStart: null,
    eventEnd: null,
    eventDuration: null,
  });

  //Derived Variables
  const dates = getDates(props.startDate, props.endDate);
  const showSelectionDiv = Boolean(selectedSlots.startSlot && selectedSlots.endSlot);
  const hasSelection = Boolean(selectedSlots.startSlot && selectedSlots.endSlot);
  const showEvent = hasSelection && selectionCommitted;
  const hasDragPreview = eventDragPreview?.eventId != null;

  //functions

  const clearSelection = () => {
    setSelectedSlots({ startSlot: null, endSlot: null });
    setSelectionCommitted(false);
  };

  const pointerToMinutes = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const slotIndex = Math.floor(y / SLOT_HEIGHT);
    const minutes = props.startMinutes + slotIndex * SLOT_INTERVAL;
    if (minutes > props.endMinutes) return props.endMinutes;
    if (minutes < props.startMinutes) return props.startMinutes;
    return minutes;
  };

  function handleSlotDragStart(e, date) {
    setSelectionCommitted(false);
    e.currentTarget.setPointerCapture(e.pointerId);
    const minutes = pointerToMinutes(e);
    if (checkIfSlotIsOccupied(date, minutes)) return;
    dragRef.current.isDragging = true;
    dragRef.current.pointerId = e.pointerId;
    dragRef.current.startDay = date;
    dragRef.current.mode = 'create';

    setSelectedSlots({ startSlot: { date: date, minutes: minutes }, endSlot: { date: date, minutes: minutes } });
  }
  function handleEventDragStart(e, eventInfo) {
    e.stopPropagation();
    const { title, date, start, end, id } = eventInfo;
    const offset = pointerToMinutes(e);
    dragRef.current.isDragging = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current.pointerId = e.pointerId;
    dragRef.current.mode = 'move';
    dragRef.current.eventId = id;
    dragRef.current.eventStart = start;
    dragRef.current.offset = offset;
    dragRef.current.eventEnd = end;
    dragRef.current.eventDuration = end - start;
    setEventDragPreview((prev) => {
      return { start: start, end: end, eventId: id };
    });
  }

  function handleDragMove(e, date) {
    if (dragRef.current.mode === 'move') {
      const minutes = pointerToMinutes(e);

      if (dragRef.current.eventStart != minutes) {
        dragRef.current.eventStart = minutes;
        dragRef.current.eventEnd = minutes + dragRef.current.eventDuration;
        setEventDragPreview((prev) => {
          return {
            ...prev,
            start: minutes - dragRef.current.offset,
            end: minutes + dragRef.current.eventDuration - dragRef.current.offset,
          };
        });
      }
      return;
    }

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
    if (dragRef.current.mode === 'move') {
      if (e.pointerId !== dragRef.current.pointerId) return;
      e.currentTarget.releasePointerCapture(dragRef.current.pointerId);
      props.setEvents((prev) =>
        prev.map((ev) =>
          ev.id === dragRef.current.eventId ?
            {
              ...ev,
              start: dragRef.current.eventStart - dragRef.current.offset,
              end: dragRef.current.eventEnd - dragRef.current.offset,
            }
          : ev,
        ),
      );
      setEventDragPreview(null);

      dragRef.current.isDragging = false;
      dragRef.current.mode = null;
      dragRef.current.eventId = null;
      dragRef.current.eventStart = null;
      dragRef.current.eventEnd = null;
      dragRef.current.eventDuration = null;

      return;
    }

    if (e.pointerId !== dragRef.current.pointerId) return;
    dragRef.current.isDragging = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    dragRef.current.pointerId = null;
    const minutes = pointerToMinutes(e);
    setSelectedSlots((prev) => {
      const didSelect = minutes !== prev.startSlot.minutes;
      if (!didSelect) {
        setSelectionCommitted(false);
        return { startSlot: null, endSlot: null };
      }
      const min = Math.min(prev.startSlot.minutes, minutes);
      const max = Math.max(prev.startSlot.minutes, minutes);
      setSelectionCommitted(true);
      dragRef.current.mode = null;
      return {
        startSlot: { date, minutes: min },
        endSlot: { date, minutes: max },
      };
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
      .map((event) => (
        <button
          onPointerDown={(e) => handleEventDragStart(e, event)}
          onPointerEnter={() => {
            props.onEventHoverStart(event);
          }}
          onPointerLeave={props.onEventHoverExit}
          style={
            hasDragPreview && eventDragPreview?.eventId === event.id ?
              {
                top:
                  (eventDragPreview.start / SLOT_INTERVAL) * SLOT_HEIGHT -
                  (props.startMinutes / SLOT_INTERVAL) * SLOT_HEIGHT,
                height: (eventDragPreview.end / SLOT_INTERVAL - eventDragPreview.start / SLOT_INTERVAL) * SLOT_HEIGHT,
              }
            : {
                top: (event.start / SLOT_INTERVAL) * SLOT_HEIGHT - (props.startMinutes / SLOT_INTERVAL) * SLOT_HEIGHT,
                height: (event.end / SLOT_INTERVAL - event.start / SLOT_INTERVAL) * SLOT_HEIGHT,
              }
          }
          key={`${event.title}-${event.start}-${event.end}`}
          className={clsx('event', { currentSelection: props.selectedEvent === event })}>
          <span className="eventTitle">{event.title}</span>
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
              handleSlotDragStart(e, date);
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

  //floating
  const { refs, floatingStyles, context } = useFloating({
    open: showEvent,
    onOpenChange: (open) => {
      if (!open) {
        clearSelection();
      }
    },

    strategy: 'fixed',
    placement: 'right-start',
    whileElementsMounted: autoUpdate,
    middleware: [offset(10), flip(), shift({ padding: 8 })],
  });

  const dismiss = useDismiss(context);

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
        {showEvent ?
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
            <AddEvent
              floatingRef={refs.setFloating}
              floatingStyle={floatingStyles}
              setSelectionCommitted={setSelectionCommitted}
              showEvent={showEvent}
              selectedSlots={selectedSlots}
              setSelectedSlots={setSelectedSlots}
              startDate={props.startDate}
              endDate={props.endDate}
              setEvents={props.setEvents}
              events={props.events}
              day={selectedSlots.startSlot.date}
              start={selectedSlots.startSlot.minutes}
              end={selectedSlots.endSlot.minutes}
              clearSelection={clearSelection}
            />
          </motion.div>
        : null}
      </motion.div>
    </>
  );
}
