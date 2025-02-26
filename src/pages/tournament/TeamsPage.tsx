import React from 'react';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

export const TeamsPage = () => {
  return (
    <div>
      <Title level={2}>Tournament Teams</Title>
      <Paragraph>
        This is the teams page for the tournament. Here you can find information about the teams participating in the tournament.
      </Paragraph>
    </div>
  );
};

export default React.memo(TeamsPage);
