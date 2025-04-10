import React from 'react';
import { Row, Col, Card, Statistic, Table, Tag } from 'antd';
import { CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

interface RefereeDashboardProps {
  user: any;
}

const RefereeDashboard: React.FC<RefereeDashboardProps> = ({ user }) => {
  // Sample matches data
  const matches = [
    {
      key: '1',
      matchId: 'M-2023-001',
      tournament: 'Summer Championship',
      court: 'Court A',
      time: '10:00 AM',
      status: 'Scheduled',
    },
    {
      key: '2',
      matchId: 'M-2023-002',
      tournament: 'Summer Championship',
      court: 'Court B',
      time: '11:30 AM',
      status: 'Scheduled',
    },
    {
      key: '3',
      matchId: 'M-2023-003',
      tournament: 'Summer Championship',
      court: 'Court A',
      time: '1:00 PM',
      status: 'Completed',
    },
  ];

  const columns = [
    {
      title: 'Match ID',
      dataIndex: 'matchId',
      key: 'matchId',
    },
    {
      title: 'Tournament',
      dataIndex: 'tournament',
      key: 'tournament',
    },
    {
      title: 'Court',
      dataIndex: 'court',
      key: 'court',
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Scheduled' ? 'blue' : 'green'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: any, record: any) => (
        <Link to={`/match/${record.matchId}`}>View Details</Link>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic 
              title="Today's Matches" 
              value={3} 
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic 
              title="Pending Matches" 
              value={2} 
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic 
              title="Completed Matches" 
              value={1} 
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Today's Assigned Matches">
            <Table 
              columns={columns} 
              dataSource={matches} 
              pagination={false} 
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RefereeDashboard;