/* eslint-disable no-undef */
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout, Space, Row, Col, Card, Divider } from 'antd';
import { Typography } from 'antd';
import Mark from 'mark.js';
import AppConfig from '../utils/config';
import Title from '../components/Title';
import VideoPlayer from '../components/VideoPlayer';
import Topics from '../components/Topics';
import Summary from '../components/Summary';
import SpeakerLabel from '../components/SpeakerLabel';
import NotFound from './NotFound';

const { Paragraph } = Typography;
const { Content } = Layout;
const ClassNotes = () => {
  const [searchParams] = useSearchParams();
  const meetingId = searchParams.get('meetingId');
  const [topicsTag, setTopicsTag] = React.useState('');
  // const [topicText, setTopicText] = React.useState([]);
  let classNotes = {};

  const handleTopicsTagClick = (tag, checked) => {
    if (checked) {
      setTopicsTag(tag);
      highlight(tag);
    } else {
      setTopicsTag('');
      const elm = document.querySelectorAll('.transcription');
      const instance = new Mark(elm);
      instance.unmark();
    }
  };

  // load json file
  if (meetingId) {
    try {
      const data = require(`/var/bigbluebutton/published/presentation/${meetingId}/class_notes.json`);

      const sanitizedTopics = data.topics.results.map((topic) => {
        return {
          text: topic.text,
          // eslint-disable-next-line no-unused-vars
          labels: topic.labels.map(({ relevance, ...keep }) => keep.label.split('>').pop()),
        };
      });
      classNotes = { ...data, sanitizedTopics };
    } catch (error) {
      classNotes = null;
      console.log(error);
    }
  }

  // If there is only single speaker the this function will handle the topic highlighting
  function highlight(selectedTopic) {
    let topicTexts = [];

    classNotes.sanitizedTopics.filter((topic) => {
      if (topic.labels.includes(selectedTopic)) {
        topicTexts.push(topic.text);
      }
    });
    // highlight text
    const elm = document.querySelectorAll('.transcription');
    const instance = new Mark(elm);
    instance.unmark();
    instance.mark(topicTexts, {
      className: 'related',
      separateWordSearch: false,
      acrossElements: true,
    });
  }

  const videoJsOptions = {
    autoplay: false,
    aspectRatio: '16:9',
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: `${AppConfig.bbbServerUrl}/recording/${meetingId}.mp4`,
        type: 'video/mp4',
      },
    ],
    tracks: [
      {
        kind: 'captions',
        src: `${AppConfig.bbbServerUrl}/presentation/${meetingId}/captions.vtt`,
        srcLang: '',
        label: 'Caption On',
        default: true,
      },
    ],
  };

  React.useEffect(() => {
    if (topicsTag) {
      const elm = document.querySelectorAll('.related');
      console.log('Scrolling to element');

      if (elm.length)
        elm[0].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }
  }, [topicsTag]);

  if (!classNotes) {
    return <NotFound />;
  }

  return (
    <Content style={{ padding: '20px 50px  50px' }}>
      <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
        {/* Title */}
        <Row>
          <Col xs={{ span: 24 }} md={{ span: 24, offset: 0 }} lg={{ span: 15, offset: 4 }}>
            <Title meetingName={classNotes.meeting_name} startTime={classNotes.start_time} />
          </Col>
        </Row>

        {/* Video player */}
        <Row>
          <Col xs={{ span: 24 }} md={{ span: 24, offset: 0 }} lg={{ span: 15, offset: 4 }}>
            <VideoPlayer
              options={videoJsOptions}
              onReady={() => {
                console.log('Player is ready');
              }}
            />
          </Col>
        </Row>

        <Card>
          {/* Topics */}
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
            }}
          >
            Topics
          </h1>
          <Paragraph>
            {classNotes && classNotes.topics ? (
              <Topics
                selectedTopic={topicsTag}
                handleClick={handleTopicsTagClick}
                topics={classNotes.topics.summary}
              />
            ) : (
              'No topics available'
            )}
          </Paragraph>
          <Divider />

          {/* Summary */}
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
            }}
          >
            Summary
          </h1>
          {classNotes && classNotes.summary ? (
            <Paragraph style={{ fontSize: '120%' }}>
              <Summary summary={classNotes.summary} />
            </Paragraph>
          ) : (
            <p>No summary available</p>
          )}
          <Divider />
          {/* transcription  */}
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
            }}
          >
            Transcription
          </h1>
          <span>
            <span
              style={{
                marginRight: '5px',
                marginLeft: '10px',
                height: '10px',
                width: '10px',
                borderRadius: '50%',
                backgroundColor: '#F44336',
                display: 'inline-block',
              }}
            ></span>
            Positive
          </span>
          <span>
            <span
              style={{
                marginRight: '5px',
                marginLeft: '10px',
                height: '10px',
                width: '10px',
                borderRadius: '50%',
                backgroundColor: '#8BC34A',
                display: 'inline-block',
              }}
            ></span>
            Negative
          </span>
          <span>
            <span
              style={{
                marginRight: '5px',
                marginLeft: '10px',
                height: '10px',
                width: '10px',
                borderRadius: '50%',
                backgroundColor: '#D7CCC8',
                display: 'inline-block',
              }}
            ></span>
            Neutral
          </span>
          {classNotes &&
            classNotes.speaker_labels.map((talk, i) => (
              <SpeakerLabel
                key={`${i}`}
                selectedTopic={topicsTag}
                talk={talk}
                sanitizedTopics={classNotes.sanitizedTopics}
                sentiment={classNotes.sentiment_analysis_results}
              />
            ))}
        </Card>
      </Space>
    </Content>
  );
};

export default ClassNotes;
