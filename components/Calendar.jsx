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
import { useDragController } from '../src/useDragController';
import { motion } from 'motion/react';

export default function Calendar(props) {
  //Statics
  const SLOTS_PER_DAY = (24 * 60) / props.slotInterval;

  //State
  const [selectedSlots, setSelectedSlots] = React.useState({
    startSlot: null,
    endSlot: null,
  });
  const [selectionCommitted, setSelectionCommitted] = React.useState(false);

  const {
    eventDragPreview,
    handleSlotDragStart,
    handleEventDragStart,
    handleEventResizeStart,
    handleDragMove,
    handleDragEnd,
    handleCancel,
  } = useDragController({
    SLOT_HEIGHT,
    SLOT_INTERVAL: props.slotInterval,
    startMinutes: props.startMinutes,
    endMinutes: props.endMinutes,
    setSelectionCommitted,
    checkIfSlotIsOccupied,
    setSelectedSlots,
    setEvents: props.setEvents,
  });

  //Derived Variables
  const dates = React.useMemo(() => {
    return getDates(props.startDate, props.endDate);
  }, [props.startDate, props.endDate]);
  const showSelectionDiv = Boolean(selectedSlots.startSlot && selectedSlots.endSlot);
  const hasSelection = Boolean(selectedSlots.startSlot && selectedSlots.endSlot);
  const showEvent = hasSelection && selectionCommitted;
  const hasDragPreview = eventDragPreview?.eventId != null;

  //functions
  const clearSelection = () => {
    setSelectedSlots({ startSlot: null, endSlot: null });
    setSelectionCommitted(false);
  };

  function checkIfSlotIsOccupied(date, minutesFromStart) {
    return props.events.some(
      (e) =>
        isSameDay(e.date, date) &&
        e.start + props.slotInterval <= minutesFromStart &&
        minutesFromStart <= e.end - props.slotInterval,
    );
  }

  //Create blocks
  function createTimeSlots(date) {
    const slots = Array.from({ length: SLOTS_PER_DAY }, (_, i) => i);

    return slots.map((slotIndex) => {
      const minutesFromStart = slotIndex * props.slotInterval;

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
                  (eventDragPreview.start / props.slotInterval) * SLOT_HEIGHT -
                  (props.startMinutes / props.slotInterval) * SLOT_HEIGHT,
                height:
                  (eventDragPreview.end / props.slotInterval - eventDragPreview.start / props.slotInterval) *
                  SLOT_HEIGHT,
              }
            : {
                top:
                  (event.start / props.slotInterval) * SLOT_HEIGHT -
                  (props.startMinutes / props.slotInterval) * SLOT_HEIGHT,
                height: (event.end / props.slotInterval - event.start / props.slotInterval) * SLOT_HEIGHT,
              }
          }
          key={`${event.title}-${event.start}-${event.end}`}
          className={clsx('event', { currentSelection: props.selectedEvent === event })}>
          <div
            onPointerDown={(e) => {
              handleEventResizeStart(e, event, 'resize-top');
            }}
            className="topHandle"></div>
          <span className="eventTitle">{event.title}</span>
          <div
            onPointerDown={(e) => {
              handleEventResizeStart(e, event, 'resize-bot');
            }}
            className="botHandle"></div>
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
            data-slots
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
                      top: ((min - props.startMinutes) / props.slotInterval) * SLOT_HEIGHT,
                      height: ((max - min) / props.slotInterval + 1) * SLOT_HEIGHT,
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
          startMinutes={props.startMinutes}
          endMinutes={props.endMinutes}
          startDate={props.startDate}
          endDate={props.endDate}
          timeFrame={props.timeFrame}
          setTimeFrame={props.setTimeFrame}
          slotInterval={props.slotInterval}
        />{' '}
        <div className="datesWrapper">
          <div className="dates">{createDateElements()}</div>
        </div>
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
