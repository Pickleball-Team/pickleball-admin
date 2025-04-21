import React, { useMemo, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Button, Tag, Badge, Progress, Tooltip, Tabs, Empty, Spin, Typography, Space, Divider } from 'antd';
import { CalendarOutlined, TeamOutlined, TrophyOutlined, DollarOutlined, InfoCircleOutlined, PlusOutlined, RiseOutlined, LineChartOutlined, EnvironmentOutlined, UserOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useGetTournamentsBySponsorId } from '../../../../modules/Tournaments/hooks/useGetTournamentsBySponsorId';
import { useGetVenueBySponnerId } from '../../../../modules/Venues/hooks/useGetVenueBySponnerId';
import { useGetRefereeBySponnerId } from '../../../../modules/Refee/hooks/useGetRefereeBySponnerId';
import { Column } from '@ant-design/charts';
import { useGetAllBillBySponnerId } from '../../../../modules/Payment/hooks/useGetAllBillBySponnerId';
import { User } from '../../../../modules/User/models';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

interface SponsorDashboardProps {
  user: User | null;
}

const SponsorDashboard: React.FC<SponsorDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('ongoing');
  const { data: sponsorTournaments = [], isLoading: isLoadingTournaments } = useGetTournamentsBySponsorId(user?.id || 0);
  const { data: sponsorVenues = [], isLoading: isLoadingVenues } = useGetVenueBySponnerId(user?.id || 0);
  const { data: sponsorReferees = [], isLoading: isLoadingReferees } = useGetRefereeBySponnerId(user?.id?.toString() || '');
  const { data: sponnerBill } = useGetAllBillBySponnerId(user?.id || 0);

  const statistics = useMemo(() => {
    if (!sponsorTournaments || !Array.isArray(sponsorTournaments)) {
      return { total: 0, upcoming: 0, ongoing: 0, completed: 0, scheduled: 0, disabled: 0, totalPlayers: 0, totalPrizeMoney: 0 };
    }

    const currentDate = new Date();
    const upcoming = sponsorTournaments.filter(tournament => 
      ['Pending'].includes(tournament.status) && new Date(tournament.startDate) > currentDate
    ).length;
    const ongoing = sponsorTournaments.filter(tournament => tournament.status === 'Ongoing').length;
    const completed = sponsorTournaments.filter(tournament => tournament.status === 'Completed').length;
    const scheduled = sponsorTournaments.filter(tournament => tournament.status === 'Scheduled').length;
    const disabled = sponsorTournaments.filter(tournament => tournament.status === 'Disable').length;
    const totalPlayers = sponsorTournaments.reduce((sum, tournament) => sum + (tournament.registrationDetails?.length || 0), 0);
    const totalPrizeMoney = sponsorTournaments.reduce((sum, tournament) => sum + (tournament.totalPrize ? Number(tournament.totalPrize) : 0), 0);

    return {
      total: sponsorTournaments.length,
      upcoming,
      ongoing,
      completed,
      scheduled,
      disabled,
      totalPlayers,
      totalPrizeMoney
    };
  }, [sponsorTournaments]);

  const formattedTournaments = useMemo(() => {
    if (!sponsorTournaments || !Array.isArray(sponsorTournaments)) return [];
    return sponsorTournaments.map(tournament => ({
      key: tournament.id,
      name: tournament.name,
      startDate: tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : 'N/A',
      endDate: tournament.endDate ? new Date(tournament.endDate).toLocaleDateString() : 'N/A',
      players: tournament.registrationDetails?.length || 'N/A',
      status: tournament.status,
      prize: tournament.totalPrize ? `$${Number(tournament.totalPrize).toLocaleString()}` : 'N/A',
      location: tournament.location || 'N/A',
      type: tournament.type
    }));
  }, [sponsorTournaments]);

  const filteredTournaments = useMemo(() => {
    switch (activeTab) {
      case 'upcoming':
        return formattedTournaments.filter(tournament => 
          tournament.status === 'Pending' && new Date(tournament.startDate) > new Date()
        );
      case 'ongoing':
        return formattedTournaments.filter(tournament => 
          tournament.status === 'Ongoing'
        );
      case 'completed':
        return formattedTournaments.filter(tournament => 
          tournament.status === 'Completed'
        );
      case 'scheduled':
        return formattedTournaments.filter(tournament => 
          tournament.status === 'Scheduled'
        );
      case 'disabled':
        return formattedTournaments.filter(tournament => 
          tournament.status === 'Disable'
        );
      case 'all':
      default:
        return formattedTournaments;
    }
  }, [formattedTournaments, activeTab]);

  const chartData = useMemo(() => {
    const months = Array.from({length: 6}, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - 5 + i);
      return d.toLocaleString('default', { month: 'short' });
    });

    return [
      ...months.map((month, i) => ({
        month,
        type: 'Tournaments',
        count: Math.max(1, Math.floor((i + 1) * statistics.total / 6))
      })),
      ...months.map((month, i) => ({
        month,
        type: 'Revenue',
        count: Math.max(100, Math.floor((i + 1) * statistics.totalPrizeMoney / 6))
      }))
    ];
  }, [statistics]);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'Singles' ? 'green' : 'blue'}>{type}</Tag>
      ),
    },
    {
      title: 'Players',
      dataIndex: 'players',
      key: 'players',
    },
    {
      title: 'Prize',
      dataIndex: 'prize',
      key: 'prize',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'blue';
        if (status === 'Completed') {
          color = 'green';
        } else if (status === 'Ongoing') {
          color = 'orange';
        } else if (status === 'Pending') {
          color = 'gold';
        } else if (status === 'Disable') {
          color = 'red';
        } else if (status === 'Scheduled') {
          color = 'purple';
        }
        return (
          <Tag color={color} style={{ borderRadius: '12px', padding: '0 10px' }}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: any) => (
        <Button type="primary" size="small">
          <Link to={`/tournament/${record.key}`}>View Details</Link>
        </Button>
      ),
    },
  ];
  const isLoading = isLoadingTournaments || isLoadingVenues || isLoadingReferees;
  const totalSpent = sponnerBill?.reduce((sum: number, bill: any) => sum + (bill.amount || 0), 0) || 0;

  return (
    <div>
      {/* Hero Section */}
      <Card 
        style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #faad14 0%, #ff7a45 100%)', color: 'white' }}
        bodyStyle={{ padding: '24px' }}
        bordered={false}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={16}>
            <Title level={2} style={{ color: 'white', marginBottom: '8px' }}>Sponsor Dashboard</Title>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px' }}>
              Welcome, {user?.firstName || 'Sponsor'}! Manage your tournaments, venues, and referees all in one place.
            </Text>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Space>
              <Link to="/tournament/overview">
                <Button type="primary" style={{ background: 'white', color: '#faad14', borderColor: 'white' }} icon={<PlusOutlined />}>
                  New Tournament
                </Button>
              </Link>
              <Link to="/payment">
                <Button type="default" ghost>Financial Report</Button>
              </Link>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {/* Tournament Stats Card */}
        <Col xs={24} sm={12} lg={8}>
          <Card 
            style={{ height: '100%', background: 'linear-gradient(to bottom, #fff7e6, #ffffff)' }} 
            hoverable 
            bordered={false}
            bodyStyle={{ padding: '20px' }}
          >
            <Statistic 
              title={<Title level={4} style={{ color: '#faad14' }}>Tournament Management</Title>}
              value={statistics.total} 
              prefix={<TrophyOutlined style={{ color: '#faad14' }} />} 
              valueStyle={{ color: '#faad14' }}
              loading={isLoadingTournaments}
              suffix={<Tooltip title="Total tournaments sponsored by you"><InfoCircleOutlined style={{ fontSize: '16px', marginLeft: 8, color: '#faad14' }} /></Tooltip>}
            />
            <Divider style={{ margin: '12px 0' }} />
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Badge status="processing" text={<Text strong>{statistics.ongoing} Ongoing</Text>} />
                <Badge status="warning" text={<Text strong>{statistics.upcoming} Upcoming</Text>} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <Badge status="success" text={<Text strong>{statistics.completed} Completed</Text>} />
                <Text><TeamOutlined /> {statistics.totalPlayers} Players</Text>
              </div>
              <Progress 
                percent={Math.min(100, statistics.total * 10)} 
                status="active" 
                strokeColor="#faad14"
                showInfo={false} 
                style={{ marginTop: '12px' }}
              />
              <Link to="/tournament/overview">
                <Button type="primary" style={{ marginTop: '12px', width: '100%', background: '#faad14', borderColor: '#faad14' }}>
                  Create Tournament
                </Button>
              </Link>
            </Space>
          </Card>
        </Col>

        {/* Financial Stats Card */}
        <Col xs={24} sm={12} lg={8}>
          <Card 
            style={{ height: '100%', background: 'linear-gradient(to bottom, #e6f7ff, #ffffff)' }} 
            hoverable 
            bordered={false}
            bodyStyle={{ padding: '20px' }}
          >
            <Statistic 
              title={<Title level={4} style={{ color: '#1890ff' }}>Financial Overview</Title>}
              value={totalSpent} 
              prefix={<DollarOutlined style={{ color: '#1890ff' }} />} 
              valueStyle={{ color: '#1890ff' }}
              precision={2}
              suffix="$"
              loading={isLoadingTournaments}
            />
            <Divider style={{ margin: '12px 0' }} />
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>Total Prize Money:</Text>
                <Text strong>${statistics.totalPrizeMoney.toLocaleString()}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                {/* <Text><CalendarOutlined /> Last payment: {sponnerBill && sponnerBill.length > 0 ? new Date(sponnerBill[0].createAt).toLocaleDateString() : 'N/A'}</Text> */}
              </div>
              <Progress 
                percent={Math.min(100, totalSpent / 1000)} 
                status="active" 
                strokeColor="#1890ff"
                showInfo={false} 
                style={{ marginTop: '12px' }}
              />
              <Link to="/payment">
                <Button type="primary" style={{ marginTop: '12px', width: '100%' }}>
                  View Financial Details
                </Button>
              </Link>
            </Space>
          </Card>
        </Col>

        {/* Resources Card */}
        <Col xs={24} lg={8}>
          <Card 
            style={{ height: '100%', background: 'linear-gradient(to bottom, #f6ffed, #ffffff)' }} 
            hoverable 
            bordered={false}
            bodyStyle={{ padding: '20px' }}
          >
            <Statistic 
              title={<Title level={4} style={{ color: '#52c41a' }}>My Resources</Title>}
              value={sponsorVenues.length + sponsorReferees.length} 
              prefix={<EnvironmentOutlined style={{ color: '#52c41a' }} />} 
              valueStyle={{ color: '#52c41a' }}
              loading={isLoadingVenues || isLoadingReferees}
              suffix={<Tooltip title="Total venues and referees"><InfoCircleOutlined style={{ fontSize: '16px', marginLeft: 8, color: '#52c41a' }} /></Tooltip>}
            />
            <Divider style={{ margin: '12px 0' }} />
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Badge color="green" text={<Text strong>{sponsorVenues.length} Venues</Text>} />
                <Badge color="cyan" text={<Text strong>{sponsorReferees.length} Referees</Text>} />
              </div>
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <Link to="/tournament/vennues">
                  <Button type="primary" icon={<PlusOutlined />} style={{ background: '#52c41a', borderColor: '#52c41a' }}>
                    Add Venue
                  </Button>
                </Link>
                <Link to="/tournament/referees">
                  <Button type="primary" icon={<PlusOutlined />} style={{ background: '#52c41a', borderColor: '#52c41a' }}>
                    Add Referee
                  </Button>
                </Link>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
      
      {/* My Tournaments Table */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card 
            title={<span style={{ color: '#faad14', fontWeight: 'bold' }}><TrophyOutlined /> My Tournaments</span>}
            bordered={false}
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          >
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              style={{ marginBottom: 16 }}
              type="card"
            >
              <TabPane tab={
                <span>
                  <ClockCircleOutlined /> Ongoing ({statistics.ongoing})
                </span>
              } key="ongoing" />
              <TabPane tab={
                <span>
                  <CalendarOutlined /> Upcoming ({statistics.upcoming})
                </span>
              } key="upcoming" />
              <TabPane tab={
                <span>
                  <CheckCircleOutlined /> Completed ({statistics.completed})
                </span>
              } key="completed" />
              <TabPane tab={
                <span>
                  <RiseOutlined /> Scheduled ({statistics.scheduled})
                </span>
              } key="scheduled" />
              <TabPane tab={
                <span>
                  <LineChartOutlined /> Disabled ({statistics.disabled})
                </span>
              } key="disabled" />
              <TabPane tab="All" key="all" />
            </Tabs>
            
            {isLoadingTournaments ? (
              <div style={{ textAlign: 'center', padding: '20px' }}><Spin /></div>
            ) : (
              <Table 
                columns={columns} 
                dataSource={filteredTournaments} 
                pagination={{ pageSize: 5 }}
                rowKey="key"
                locale={{ emptyText: <Empty description="No tournaments found" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SponsorDashboard;