import React from 'react';
import { Result } from 'antd';

const NotFound = () => {
  return (
    <Result status='404' title='404' subTitle='Sorry, class notes not found for this meeting id.' />
  );
};

export default NotFound;
