import { formatDate, minutesToTimeString, timeToMinutes } from '../timeUtils';

const slotIntervalRange = [15, 30, 60];

export default function DateSelection(props) {
  function updateState(e) {
    const { name, value } = e.target;
    const nextDate = name === 'startDate' || name === 'endDate' ? formatDate(value) : null;
    const nextMinutes = name === 'startMinutes' || name === 'endMinutes' ? timeToMinutes(value) : null;
    const nextSlotInterval = name === 'slotInterval' ? value : null;
    props.setTimeFrame((prevTimeFrame) => {
      if (nextDate != null) return { ...prevTimeFrame, [name]: nextDate };
      if (nextMinutes != null) return { ...prevTimeFrame, [name]: nextMinutes };
      if (nextSlotInterval != null) return { ...prevTimeFrame, [name]: slotIntervalRange[nextSlotInterval] };
    });
  }

  return (
    <h2>
      <input type="date" name="startDate" value={formatDate(props.startDate)} onChange={updateState} />
      <input type="time" name="startMinutes" value={minutesToTimeString(props.startMinutes)} onChange={updateState} />
      <input
        type="range"
        name="slotInterval"
        id="slotInterval"
        value={slotIntervalRange.findIndex((el) => el === props.slotInterval)}
        onChange={updateState}
        min={0}
        max={2}
      />
      <input type="time" name="endMinutes" value={minutesToTimeString(props.endMinutes)} onChange={updateState} />
      <input type="date" name="endDate" value={formatDate(props.endDate)} onChange={updateState} />
    </h2>
  );
}
