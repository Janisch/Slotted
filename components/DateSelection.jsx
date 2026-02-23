import { formatDate } from '../timeUtils';

export default function DateSelection(props) {
  function updateState(e) {
    const { name, value } = e.target;
    const date = formatDate(value);
    props.setTimeFrame((prevTimeFrame) => {
      return { ...prevTimeFrame, [name]: date };
    });
  }

  return (
    <h2>
      <input type="date" name="start" value={formatDate(props.startDate)} onChange={updateState} />
      {' - '}
      <input type="date" name="end" value={formatDate(props.endDate)} onChange={updateState} />
    </h2>
  );
}
