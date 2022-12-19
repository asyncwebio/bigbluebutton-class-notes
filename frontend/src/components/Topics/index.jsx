import React from 'react';
import PropTypes from 'prop-types';
import { Tag } from 'antd';
const { CheckableTag } = Tag;

const Topics = ({ topics, selectedTopic, handleClick }) => {
  const getTopics = () => {
    //Get first 6 topics from the object
    const rawTopics = Object.keys(topics).slice(0, 6);

    const topicsList = rawTopics.map((t) => t.split('>').pop());

    return topicsList;
  };

  return (
    <>
      {getTopics().map((topic) => (
        <CheckableTag
          key={topic}
          color='blue'
          checked={selectedTopic === topic}
          onChange={(checked) => handleClick(topic, checked)}
        >
          {topic}
        </CheckableTag>
      ))}
    </>
  );
};

Topics.propTypes = {
  topics: PropTypes.object,
  selectedTopic: PropTypes.string,
  handleClick: PropTypes.func,
};

export default Topics;
