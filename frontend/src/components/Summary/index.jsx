import React from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';

const Summary = ({ summary }) => {
  return (
    <>
      <ReactMarkdown>{summary}</ReactMarkdown>
    </>
  );
};

Summary.propTypes = {
  summary: PropTypes.string,
};

export default Summary;
