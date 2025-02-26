import React from 'react';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

export const ResultsPage = () => {
  return (
    <div>
      <Title level={2}>Tournament Results</Title>
      <Paragraph>
        This is the results page for the tournament. Here you can find the results of the matches.
      </Paragraph>
    </div>
  );
};

export default React.memo(ResultsPage);
