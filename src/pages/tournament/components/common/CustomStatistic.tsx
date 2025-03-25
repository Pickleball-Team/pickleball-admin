import React from 'react';

interface StatisticProps {
  title: string;
  value: string | number;
  valueStyle?: React.CSSProperties;
  prefix?: React.ReactNode;
}

const CustomStatistic: React.FC<StatisticProps> = ({ 
  title, 
  value, 
  valueStyle, 
  prefix 
}) => {
  return (
    <div>
      <div style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.45)' }}>
        {title}
      </div>
      <div style={{ fontSize: '24px', ...valueStyle }}>
        {prefix && <span style={{ marginRight: '8px' }}>{prefix}</span>}
        {value}
      </div>
    </div>
  );
};

export default CustomStatistic;
