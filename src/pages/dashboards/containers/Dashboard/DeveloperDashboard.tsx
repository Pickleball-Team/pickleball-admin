import React from 'react';
import { Row, Col, Card, Statistic, Table, Progress, Tag } from 'antd';
import { BugOutlined, CodeOutlined, ApiOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

interface DeveloperDashboardProps {
  user: any;
}

const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({ user }) => {
  // Sample tasks data
  const tasks = [
    {
      key: '1',
      taskId: 'DEV-2023-001',
      title: 'API Integration for Player Stats',
      priority: 'High',
      progress: 75,
      status: 'In Progress',
    },
    {
      key: '2',
      taskId: 'DEV-2023-002',
      title: 'Fix Tournament Bracket Display',
      priority: 'Critical',
      progress: 30,
      status: 'In Progress',
    },
    {
      key: '3',
      taskId: 'DEV-2023-003',
      title: 'User Authentication Improvements',
      priority: 'Medium',
      progress: 100,
      status: 'Completed',
    },
    {
      key: '4',
      taskId: 'DEV-2023-004',
      title: 'Mobile Responsive Design Updates',
      priority: 'Low',
      progress: 10,
      status: 'In Progress',
    },
  ];

  const columns = [
    {
      title: 'Task ID',
      dataIndex: 'taskId',
      key: 'taskId',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <Link to={`/dev/task/${record.key}`}>{text}</Link>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        let color = 'blue';
        if (priority === 'High') color = 'orange';
        if (priority === 'Critical') color = 'red';
        if (priority === 'Low') color = 'green';
        
        return <Tag color={color}>{priority}</Tag>;
      },
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <Progress percent={progress} size="small" />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'processing';
        if (status === 'Completed') color = 'success';
        if (status === 'On Hold') color = 'warning';
        if (status === 'Cancelled') color = 'error';
        
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Active Projects" 
              value={3} 
              prefix={<CodeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="API Endpoints" 
              value={42} 
              prefix={<ApiOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Resolved Issues" 
              value={18} 
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Open Bugs" 
              value={7} 
              prefix={<BugOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Development Tasks" extra={<Link to="/dev/tasks">View All</Link>}>
            <Table 
              columns={columns} 
              dataSource={tasks} 
              pagination={false} 
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24} lg={12}>
          <Card title="System Performance" style={{ height: '300px' }}>
            <p>System performance metrics would go here</p>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Deployment Status" style={{ height: '300px' }}>
            <p>CI/CD pipeline status would go here</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DeveloperDashboard;