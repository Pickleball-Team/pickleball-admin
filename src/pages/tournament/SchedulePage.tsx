import React from 'react';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

export const SchedulePage = () => {
  return (
    <div>
      <Title level={2}>Tournament Schedule</Title>
      <Paragraph>
        This is the schedule page for the tournament. Here you can find the schedule of matches.
      </Paragraph>
    </div>
  );
};
