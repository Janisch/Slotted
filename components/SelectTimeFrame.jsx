import { formatDate } from '../timeUtils';
import { motion } from 'motion/react';

export default function SelectTimeFrame(props) {
  function updateState(e) {
    console.log('update state');
    const { name, value } = e.target;
    const date = formatDate(value);
    props.setTimeFrame((prevTimeFrame) => {
      return { ...prevTimeFrame, [name]: date };
    });
  }

  return (
    <div className="timeFrameContainer">
      <motion.div
        className="selectTimeFrame"
        initial={{ clipPath: 'inset(0 100% 0 0)' }}
        animate={{ clipPath: 'inset(0 0% 0 0)' }}
        transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}>
        <h1>
          Wann soll ge
          <motion.span
            className="highlight"
            initial={{ color: '#ff9a00', clipPath: 'inset(0 0 0 0)' }}
            animate={{ color: '#FFFFFF', backgroundColor: '#ff9a00' }}
            transition={{ delay: 1.5, duration: 0.5, ease: 'easeOut' }}>
            slotted
          </motion.span>{' '}
          <motion.span>werden?</motion.span>
        </h1>
        <motion.form
          onChange={updateState}
          action=""
          className="dateForm"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2.8, ease: 'easeOut' }}>
          <label htmlFor="startDate">Von</label>
          <input
            type="date"
            max={props.timeFrame.endDate ? formatDate(props.timeFrame.endDate) : ''}
            name="startDate"
            id="startDate"
          />
          <label htmlFor="endDate">Bis</label>
          <input
            type="date"
            min={props.timeFrame.startDate ? formatDate(props.timeFrame.startDate) : ''}
            name="endDate"
            id="endDate"
          />
        </motion.form>
      </motion.div>
    </div>
  );
}
