import React from 'react';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

export const OverviewPage = () => {
  return (
    <div>
      <Title level={2}>Tournament Overview</Title>
      <Paragraph>
        This is the overview page for the tournament. Here you can find general information about the tournament.
      </Paragraph>
    </div>
  );
};
