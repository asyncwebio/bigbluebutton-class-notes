import React from 'react';
import PropTypes from 'prop-types';

const Title = ({ meetingName, startTime }) => {
  return (
    <div style={{ textAlign: 'center' }}>
      <h1
        style={{
          textAlign: 'center',
          fontSize: '1.5rem',
          fontWeight: 800,
          marginBottom: '0.5rem',
        }}
      >
        {meetingName}
      </h1>
      <p style={{ margin: 0, padding: 0, fontSize: '1rem' }}>
        {' '}
        {new Date(startTime).toLocaleDateString('en-GB')}
      </p>
    </div>
  );
};

Title.propTypes = {
  meetingName: PropTypes.string.isRequired,
  startTime: PropTypes.string.isRequired,
};

export default Title;
