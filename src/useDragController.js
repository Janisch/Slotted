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
    eventOriginalStart: null,
    eventOriginalEnd: null,
    eventDidMove: false,
    eventStart: null,
    eventEnd: null,
    eventDuration: null,
    offset: null,
    slotsElement: null,
  };

  const dragRef = React.useRef({ ...initialDragState });

  const clearDragRef = () => {
    dragRef.current = { ...initialDragState };
  };

  const pointerToMinutes = (e) => {
    const el = dragRef.current.slotsElement ?? e.currentTarget;
    const rect = el.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const slotIndex = Math.floor(y / SLOT_HEIGHT);
    const minutes = startMinutes + slotIndex * SLOT_INTERVAL;
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
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current.eventDidMove = false;
    dragRef.current.isDragging = true;
    dragRef.current.pointerId = e.pointerId;
    dragRef.current.mode = 'move';
    dragRef.current.eventId = id;
    dragRef.current.eventStart = start;
    dragRef.current.eventOriginalStart = start;
    dragRef.current.eventEnd = end;
    dragRef.current.eventOriginalEnd = end;
    dragRef.current.eventDuration = end - start;
    dragRef.current.slotsElement = e.target.closest('[data-slots]');
    const grabbedMinutes = pointerToMinutes(e);
    const offset = grabbedMinutes - start;
    dragRef.current.offset = offset;
    setEventDragPreview({ start: start, end: end, eventId: id });
  }

  function handleEventResizeStart(e, eventInfo, resizeType) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const { title, date, start, end, id } = eventInfo;
    dragRef.current.isDragging = true;
    dragRef.current.pointerId = e.pointerId;
    dragRef.current.mode = resizeType;
    dragRef.current.eventId = id;
    dragRef.current.eventStart = start;
    dragRef.current.eventEnd = end;
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

      if (dragRef.current.eventStart === clampedStart && dragRef.current.eventEnd === clampedEnd) {
        return;
      }

      dragRef.current.eventStart = clampedStart;
      dragRef.current.eventEnd = clampedEnd;

      dragRef.current.eventDidMove = true;

      setEventDragPreview((prev) => ({
        ...prev,
        start: clampedStart,
        end: clampedEnd,
      }));

      return;
    }

    if (dragRef.current.mode.includes('resize')) {
      const clampedStart = Math.max(startMinutes, Math.min(minutes, dragRef.current.eventEnd - SLOT_INTERVAL));
      const clampedEnd = Math.max(dragRef.current.eventStart + SLOT_INTERVAL, Math.min(minutes, endMinutes));

      if (dragRef.current.mode === 'resize-top') {
        setEventDragPreview((prev) => ({
          ...prev,
          start: clampedStart,
          end: dragRef.current.eventEnd,
        }));
      }
      if (dragRef.current.mode === 'resize-bot') {
        setEventDragPreview((prev) => ({
          ...prev,
          start: dragRef.current.eventStart,
          end: clampedEnd,
        }));
      }
    }

    if (dragRef.current.mode === 'create') {
      if (!isSameDay(date, dragRef.current.startDay)) return;

      setSelectedSlots((prev) => ({
        ...prev,
        endSlot: { date, minutes },
      }));
    }
  }

  function handleDragEnd(e, date) {
    if (e.pointerId !== dragRef.current.pointerId) return;
    e.currentTarget.releasePointerCapture(dragRef.current.pointerId);
    const minutes = pointerToMinutes(e);

    if (dragRef.current.mode === 'move') {
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === dragRef.current.eventId && dragRef.current.eventDidMove ?
            {
              ...ev,
              start: eventDragPreview.start,
              end: eventDragPreview.end,
            }
          : ev,
        ),
      );
      setEventDragPreview(null);
      clearDragRef();
      return;
    }

    if (dragRef.current.mode.includes('resize')) {
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === dragRef.current.eventId ? { ...ev, start: eventDragPreview.start, end: eventDragPreview.end } : ev,
        ),
      );
      setEventDragPreview(null);
      clearDragRef();
      return;
    }

    if (dragRef.current.mode === 'create') {
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
    handleEventResizeStart,
  };
}
