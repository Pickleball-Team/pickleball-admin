import React from 'react';
import { WarningOutlined } from '@ant-design/icons';

interface AlertProps {
  message: string;
  description: string;
  type: 'warning' | 'info' | 'success' | 'error';
  showIcon?: boolean;
  style?: React.CSSProperties;
}

const AlertMessage: React.FC<AlertProps> = ({
  message,
  description,
  type,
  showIcon = true,
  style = {},
}) => {
  const getIconByType = () => {
    if (type === 'warning') return <WarningOutlined style={{ color: '#faad14' }} />;
    return null;
  };

  const getBgColor = () => {
    if (type === 'warning') return '#fffbe6';
    return '#fff';
  };

  return (
    <div
      style={{
        padding: '15px',
        backgroundColor: getBgColor(),
        border: `1px solid ${type === 'warning' ? '#faad14' : '#d9d9d9'}`,
        borderRadius: '2px',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {showIcon && (
          <div style={{ marginRight: '12px', fontSize: '16px' }}>
            {getIconByType()}
          </div>
        )}
        <div>
          <div style={{ marginBottom: '4px', fontWeight: 500 }}>{message}</div>
          <div style={{ color: 'rgba(0, 0, 0, 0.45)' }}>{description}</div>
        </div>
      </div>
    </div>
  );
};

export default AlertMessage;
