import React, { useMemo, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Button, Tag, Badge, Progress, Tooltip, Tabs, Empty, Spin } from 'antd';
import { CalendarOutlined, TeamOutlined, TrophyOutlined, DollarOutlined, InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useGetTournamentsBySponsorId } from '../../../../modules/Tournaments/hooks/useGetTournamentsBySponsorId';
import { useGetVenueBySponnerId } from '../../../../modules/Venues/hooks/useGetVenueBySponnerId';
import { useGetRefereeBySponnerId } from '../../../../modules/Refee/hooks/useGetRefereeBySponnerId';
import { Column } from '@ant-design/charts';
import { useGetAllBillBySponnerId } from '../../../../modules/Payment/hooks/useGetAllBillBySponnerId';
import { User } from '../../../../modules/User/models';

const { TabPane } = Tabs;

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
      return { total: 0, upcoming: 0, ongoing: 0, completed: 0, totalPlayers: 0, totalPrizeMoney: 0 };
    }

    const currentDate = new Date();
    const upcoming = sponsorTournaments.filter(tournament => 
      new Date(tournament.startDate) > currentDate && tournament.status !== 'Completed' && tournament.status !== 'Disable'
    ).length;
    const ongoing = sponsorTournaments.filter(tournament => tournament.status === 'Ongoing').length;
    const completed = sponsorTournaments.filter(tournament => tournament.status === 'Completed').length;
    const totalPlayers = sponsorTournaments.reduce((sum, tournament) => sum + (tournament.registrationDetails?.length || 0), 0);
    const totalPrizeMoney = sponsorTournaments.reduce((sum, tournament) => sum + (tournament.totalPrize ? Number(tournament.totalPrize) : 0), 0);

    return {
      total: sponsorTournaments.length,
      upcoming,
      ongoing,
      completed,
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
    const currentDate = new Date();
    switch (activeTab) {
      case 'upcoming':
        return formattedTournaments.filter(tournament => 
          new Date(tournament.startDate) > currentDate && tournament.status !== 'Completed' && tournament.status !== 'Disable'
        );
      case 'ongoing':
        return formattedTournaments.filter(tournament => tournament.status === 'Ongoing');
      case 'completed':
        return formattedTournaments.filter(tournament => tournament.status === 'Completed');
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
        }
        return (
          <Badge status={color as any} text={status} />
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: any) => (
        <Link to={`/tournament/${record.key}`}>View Details</Link>
      ),
    },
  ];

  const renderChart = () => {
    const config = {
      data: chartData,
      isGroup: true,
      xField: 'month',
      yField: 'count',
      seriesField: 'type',
      label: {
        position: 'top' as const,
      },
      legend: {
        position: 'top-right' as 'top-right',
      },
    };
    return <Column {...config} />;
  };

  const isLoading = isLoadingTournaments || isLoadingVenues || isLoadingReferees;

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="My Tournaments" 
              value={statistics.total} 
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#3f8600' }}
              loading={isLoadingTournaments}
              suffix={<Tooltip title="Total tournaments sponsored by you"><InfoCircleOutlined style={{ fontSize: '16px', marginLeft: 8 }} /></Tooltip>}
            />
            <div style={{ marginTop: 8 }}>
              <Progress percent={Math.min(100, statistics.total * 10)} size="small" status="active" showInfo={false} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Upcoming Events" 
              value={statistics.upcoming} 
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
              loading={isLoadingTournaments}
              suffix={<Tooltip title="Events that haven't started yet"><InfoCircleOutlined style={{ fontSize: '16px', marginLeft: 8 }} /></Tooltip>}
            />
            <div style={{ marginTop: 8 }}>
              <Progress percent={Math.min(100, statistics.upcoming * 20)} size="small" status="active" showInfo={false} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Total Prize Money" 
              value={sponnerBill?.reduce((sum: number, bill: any) => sum + (bill.amount || 0), 0) || 0} 
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#faad14' }}
              precision={2}
              suffix="$"
              loading={isLoadingTournaments}
            />
            <div style={{ marginTop: 8 }}>
              <Progress percent={Math.min(100, statistics.totalPrizeMoney / 200)} size="small" status="active" showInfo={false} />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card title="Tournament Activity" extra={<Link to="/payment"><Button type="link">View Financial Details</Button></Link>}>
            {isLoading ? <div style={{ textAlign: 'center', padding: '20px' }}><Spin /></div> : renderChart()}
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <Card 
            title="My Venues" 
            extra={<Link to="/tournament/vennues"><Button type="primary" icon={<PlusOutlined />}>Add Venue</Button></Link>}
          >
            View all venues
          </Card>
        </Col>
        <Col span={12}>
          <Card 
            title="My Referees" 
            extra={<Link to="/tournament/referees"><Button type="primary" icon={<PlusOutlined />}>Add Referee</Button></Link>}
          >
            View all referees
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card 
            title="My Tournaments" 
            extra={<Link to="/tournament/create"><Button type="primary" icon={<PlusOutlined />}>Create Tournament</Button></Link>}
          >
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              style={{ marginBottom: 16 }}
            >
              <TabPane tab={`Ongoing (${statistics.ongoing})`} key="ongoing" />
              <TabPane tab={`Upcoming (${statistics.upcoming})`} key="upcoming" />
              <TabPane tab={`Completed (${statistics.completed})`} key="completed" />
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
                locale={{ emptyText: <Empty description="No tournaments found" /> }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SponsorDashboard;