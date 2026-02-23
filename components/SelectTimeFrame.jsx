import { formatDate } from '../timeUtils';
import { AnimatePresence, motion } from 'motion/react';

export default function SelectTimeFrame(props) {
  function updateState(e) {
    const { name, value } = e.target;
    const date = formatDate(value);
    props.setTimeFrame((prevTimeFrame) => {
      return { ...prevTimeFrame, [name]: date };
    });
  }

  return (
    <motion.div
      className="selectTimeFrame"
      initial={{ opacity: 0, y: 8, fontSize: '1rem ' }}
      animate={{ opacity: 1, y: 0, fontSize: '1rem ' }}
      transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}>
      <h1>
        Wann soll{' '}
        <motion.span
          className="highlight"
          style={{
            overflow: 'hidden',
          }}
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0% 0 0)' }}
          transition={{ delay: 1, duration: 0.4, ease: 'easeOut' }}>
          geslotted
        </motion.span>{' '}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7, duration: 0.5, ease: 'easeOut' }}>
          werden?
        </motion.span>
      </h1>
      <motion.form
        onChange={updateState}
        action=""
        className="dateForm"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 2.8, ease: 'easeOut' }}>
        <label htmlFor="timeFrameStart">Von</label>
        <input
          type="date"
          max={props.timeFrame.endDate ? formatDate(props.timeFrame.endDate) : ''}
          name="start"
          id="start"
        />
        <label htmlFor="timeFrameStart">Bis</label>
        <input
          type="date"
          min={props.timeFrame.startDate ? formatDate(props.timeFrame.startDate) : ''}
          name="end"
          id="end"
        />
      </motion.form>
    </motion.div>
  );
}
