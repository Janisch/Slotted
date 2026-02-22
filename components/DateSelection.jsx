import { getDateString } from '../timeUtils';

export default function DateSelection(props) {
  return <h2>{`${getDateString(props.startDate)} - ${getDateString(props.endDate)}`}</h2>;
}
