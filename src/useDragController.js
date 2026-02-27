import * as React from 'react';
import { isSameDay } from '../timeUtils';

export function useDragController({
  SLOT_HEIGHT,
  SLOT_INTERVAL,
  startMinutes,
  endMinutes,
  setSelectionCommitted,
  checkIfSlotIsOccupied,
  setSelectedSlots,
  setEvents,
}) {
  const [eventDragPreview, setEventDragPreview] = React.useState(null);

  //ref
  const initialDragState = {
    mode: null,
    pointerId: null,
    isDragging: false,
    startDay: null,
    eventId: null,
    eventStart: null,
    eventEnd: null,
    eventDuration: null,
    offset: null,
  };

  const dragRef = React.useRef({ ...initialDragState });

  const clearDragRef = () => {
    dragRef.current = { ...initialDragState };
  };

  const pointerToMinutes = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const slotIndex = Math.floor(y / SLOT_HEIGHT);
    const minutes = startMinutes + slotIndex * SLOT_INTERVAL;
    if (minutes > endMinutes) return endMinutes;
    if (minutes < startMinutes) return startMinutes;
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
    setEventDragPreview({ start: start, end: end, eventId: id });
  }

  function handleDragMove(e, date) {
    if (!dragRef.current.isDragging) return;
    if (e.pointerId !== dragRef.current.pointerId) return;

    const minutes = pointerToMinutes(e);
    if (minutes == null) return;

    if (dragRef.current.mode === 'move') {
      if (dragRef.current.eventStart === minutes) return;

      const duration = dragRef.current.eventDuration;
      const desiredStart = minutes - dragRef.current.offset;

      const clampedStart = Math.max(startMinutes, Math.min(desiredStart, endMinutes - duration));
      const clampedEnd = clampedStart + duration;

      if (
        dragRef.current.eventStart === clampedStart + dragRef.current.offset &&
        dragRef.current.eventEnd === clampedEnd + dragRef.current.offset
      ) {
        return;
      }

      dragRef.current.eventStart = clampedStart + dragRef.current.offset;
      dragRef.current.eventEnd = clampedEnd + dragRef.current.offset;

      setEventDragPreview((prev) => ({
        ...prev,
        start: clampedStart,
        end: clampedEnd,
      }));

      return;
    }

    if (!isSameDay(date, dragRef.current.startDay)) return;

    setSelectedSlots((prev) => ({
      ...prev,
      endSlot: { date, minutes },
    }));
  }

  function handleDragEnd(e, date) {
    if (e.pointerId !== dragRef.current.pointerId) return;
    if (dragRef.current.mode === 'move') {
      e.currentTarget.releasePointerCapture(dragRef.current.pointerId);
      setEvents((prev) =>
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
      clearDragRef();
      return;
    }

    e.currentTarget.releasePointerCapture(e.pointerId);
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
      clearDragRef();
      return {
        startSlot: { date, minutes: min },
        endSlot: { date, minutes: max },
      };
    });
  }

  function handleCancel(e, date) {
    if (e.pointerId !== dragRef.current.pointerId) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    clearDragRef();
  }

  return {
    eventDragPreview,
    initialDragState,
    handleSlotDragStart,
    handleEventDragStart,
    handleDragMove,
    handleDragEnd,
    handleCancel,
  };
}
