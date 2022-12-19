import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'antd';

const SpeakerLabel = ({ talk, sentiment, selectedTopic, sanitizedTopics }) => {
  function findSentiment(talk) {
    const sentimentObj = sentiment.find(
      (s) => s.speaker === talk.speaker && s.start === talk.start,
    );

    if (sentimentObj && sentimentObj.sentiment === 'POSITIVE') return '#F44336'; //Red;

    if (sentimentObj && sentimentObj.sentiment === 'NEGATIVE') return '#8BC34A'; //Light green ;

    return '#D7CCC8'; // Nutral, light;
  }

  function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
  }
  function convertMsToTime(milliseconds) {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    seconds = seconds % 60;
    minutes = minutes % 60;

    // 👇️ If you don't want to roll hours over, e.g. 24 to 00
    // 👇️ comment (or remove) the line below
    // commenting next line gets you `24:00:00` instead of `00:00:00`
    // or `36:15:31` instead of `12:15:31`, etc.
    hours = hours % 24;

    return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`;
  }

  function isTopicRelated() {
    let related = false;
    sanitizedTopics.some((topic) => {
      const isRelated =
        topic.labels.includes(selectedTopic) && new RegExp(`${talk.text}`).test(topic.text);

      if (isRelated) {
        related = true;

        return true;
      }
      related = false;

      return false;
    });

    return related;
  }

  return (
    <>
      <Row>
        <Col span={2}>
          <Row>
            <Col>
              <p style={{ marginBottom: 0, paddingBottom: 0 }}>
                <span
                  style={{
                    marginRight: '5px',
                    height: '10px',
                    width: '10px',
                    borderRadius: '50%',
                    backgroundColor: findSentiment(talk),
                    display: 'inline-block',
                  }}
                ></span>
                {`Speaker ${talk.speaker}`}
              </p>
              <p
                style={{
                  marginTop: 0,
                  paddingTop: 0,
                  paddingLeft: '20%',
                  fontSize: '1rem',
                }}
              >
                {convertMsToTime(parseInt(talk.end) - parseInt(talk.start))}
              </p>
            </Col>
          </Row>
        </Col>
        <Col span={18}>
          <p
            className={`transcription  ${isTopicRelated() ? 'related' : ''}`}
            data-topic={isTopicRelated() ? selectedTopic : ''}
          >
            {talk.text}{' '}
          </p>
        </Col>
      </Row>
    </>
  );
};

SpeakerLabel.propTypes = {
  talk: PropTypes.object,
  sentiment: PropTypes.array,
  selectedTopic: PropTypes.string,
  sanitizedTopics: PropTypes.array,
};

export default SpeakerLabel;
