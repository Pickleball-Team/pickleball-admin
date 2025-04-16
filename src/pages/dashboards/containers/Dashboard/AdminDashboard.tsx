import React, { useState, useMemo } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Tag,
  Progress,
  Button,
  Typography,
  Space,
  Tooltip,
  Divider,
  Badge,
  Spin,
} from 'antd';
import {
  UserOutlined,
  TrophyOutlined,
  TeamOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  LockOutlined,
  CreditCardOutlined,
  RiseOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { Column, Pie } from '@ant-design/charts';
import { Link } from 'react-router-dom';
import { User } from '../../../../modules/User/models';
import { useGetAllTournaments } from '../../../../modules/Tournaments/hooks/useGetAllTournaments';
import { useFetchAllUser } from '../../../../modules/User/hooks/useFetchAllUser';
import { useGetAllSponsors } from '../../../../modules/Sponsor/hooks/useGetAllSponner';
import { useGetAllReferees } from '../../../../modules/User/hooks/useGetAllReferees';
import { Tournament } from '../../../../modules/Tournaments/models';
import { useGetAllBill } from '../../../../modules/Payment/hooks/useGetAllBill';
import { useGetBlogCategories } from '../../../../modules/Category/hooks/useGetAllBlogCategories';
import { useGetAllRules } from '../../../../modules/Category/hooks/useGetAllRules';

const { Title, Text } = Typography;

interface AdminDashboardProps {
  user: any;
}

const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  // Fetch data using hooks
  const { data: tournamentsData = [], isLoading: isLoadingTournaments } =
    useGetAllTournaments();
  const { data: usersData = [], isLoading: isLoadingUsers } = useFetchAllUser(
    1,
    100,
    true
  );
  const { data: sponsorsData = [], isLoading: isLoadingSponsors } =
    useGetAllSponsors();
  const { data: refereesData = [], isLoading: isLoadingReferees } =
    useGetAllReferees();
  const { data: billsData = [] } = useGetAllBill();
  const { data: blogCategoriesData = [] } = useGetBlogCategories();
  const { data: rulesData = [] } = useGetAllRules();

  // Calculate statistics
  const statistics = useMemo(() => {
    // Determine blog post count - sum of rules across all categories
    const getBlogPostCount = () => {
      // If we have rules data, count them as blog posts
      if (rulesData && Array.isArray(rulesData) && rulesData.length > 0) {
        return rulesData.length;
      }
      // If we have categories data but no rules, estimate based on categories
      if (
        blogCategoriesData &&
        Array.isArray(blogCategoriesData) &&
        blogCategoriesData.length > 0
      ) {
        // Estimate about 3 posts per category as fallback
        return blogCategoriesData.length * 3;
      }
      // Fallback to a reasonable number if no real data
      return 0;
    };

    // Calculate actual number of teams if data is available
    const getTeamsCount = () => {
      // For actual implementation, we might need a teams API
      // For now, estimate based on users with roleId === 1 (players)
      const playerCount =
        usersData && Array.isArray(usersData)
          ? usersData.filter((user) => user.roleId === 1).length
          : 0;
      return Math.floor(playerCount / 2); // Roughly estimate teams based on player count
    };

    // Calculate revenue from billing data instead of prize money
    const totalRevenue =
      billsData && Array.isArray(billsData)
        ? billsData.reduce((sum, bill) => {
            return sum + (bill?.amount || 0);
          }, 0)
        : 0;

    return {
      tournaments:
        tournamentsData && Array.isArray(tournamentsData)
          ? tournamentsData.length
          : 0,
      users: usersData && Array.isArray(usersData) ? usersData.length : 0,
      teams: getTeamsCount(),
      revenue: totalRevenue,
      pendingTournaments:
        tournamentsData && Array.isArray(tournamentsData)
          ? tournamentsData.filter((t) => t.status === 'Pending').length
          : 0,
      ongoingTournaments:
        tournamentsData && Array.isArray(tournamentsData)
          ? tournamentsData.filter((t) => t.status === 'Ongoing').length
          : 0,
      completedTournaments:
        tournamentsData && Array.isArray(tournamentsData)
          ? tournamentsData.filter((t) => t.status === 'Completed').length
          : 0,
      disabledTournaments:
        tournamentsData && Array.isArray(tournamentsData)
          ? tournamentsData.filter((t) => t.status === 'Disable').length
          : 0,
      singlesTournaments:
        tournamentsData && Array.isArray(tournamentsData)
          ? tournamentsData.filter((t) => t.type === 'Singles').length
          : 0,
      doublesTournaments:
        tournamentsData && Array.isArray(tournamentsData)
          ? tournamentsData.filter((t) => t.type === 'Doubles').length
          : 0,
      blogPosts: getBlogPostCount(),
      authUsers: usersData && Array.isArray(usersData) ? usersData.length : 0,
      payments: billsData && Array.isArray(billsData) ? billsData.length : 0,
      activeUsers:
        usersData && Array.isArray(usersData)
          ? usersData.filter((u) => u.status).length
          : 0,
      completedPayments:
        billsData && Array.isArray(billsData)
          ? billsData.filter((bill) => bill && bill.status === 'Completed')
              .length
          : 0,
    };
  }, [
    tournamentsData,
    usersData,
    sponsorsData,
    refereesData,
    billsData,
    blogCategoriesData,
    rulesData,
  ]);

  // Prepare data for charts
  const tournamentStatusData = useMemo(
    () => [
      {
        status: 'Completed',
        value: statistics.completedTournaments,
        color: '#52c41a',
      },
      {
        status: 'Ongoing',
        value: statistics.ongoingTournaments,
        color: '#faad14',
      },
      {
        status: 'Pending',
        value: statistics.pendingTournaments,
        color: '#1890ff',
      },
      {
        status: 'Disabled',
        value: statistics.disabledTournaments,
        color: '#f5222d',
      },
    ],
    [statistics]
  );

  const userRoleData = useMemo(() => {
    if (!usersData || !Array.isArray(usersData) || usersData.length === 0)
      return [];

    const roleCounts = {
      Player: 0,
      Admin: 0,
      Sponsor: 0,
      Referee: 0,
    };

    usersData.forEach((user) => {
      if (user.roleId === 2) roleCounts['Admin']++;
      else if (user.roleId === 3) roleCounts['Sponsor']++;
      else if (user.roleId === 4) roleCounts['Referee']++;
      else roleCounts['Player']++;
    });

    return Object.entries(roleCounts)
      .filter(([_, value]) => value > 0) // Only include roles that have users
      .map(([role, value]) => ({ role, value }));
  }, [usersData]);

  // Monthly user growth data based on actual data
  const growthData = useMemo(() => {
    // Get current date
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();

    // Create array of the last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentDate.getFullYear(), currentMonth - i, 1);
      const monthName = month.toLocaleString('default', { month: 'short' });
      months.push(monthName);
    }

    // For real implementation, we would need API endpoints that provide historical data
    // For now, create estimations based on available data
    const userCount =
      usersData && Array.isArray(usersData) ? usersData.length : 0;
    const tournamentCount =
      tournamentsData && Array.isArray(tournamentsData)
        ? tournamentsData.length
        : 0;
    const revenue = statistics.revenue;

    // Create more realistic distribution patterns
    // This simulates growth over time rather than linear distribution
    const distributionPattern = [0.5, 0.65, 0.75, 0.85, 0.95, 1.0];

    const userDatapoints = months.map((month, i) => ({
      month,
      type: 'Users',
      value: Math.round(userCount * distributionPattern[i]),
    }));

    const tournamentDatapoints = months.map((month, i) => ({
      month,
      type: 'Tournaments',
      value: Math.round(tournamentCount * distributionPattern[i] * 0.8),
    }));

    const revenueDatapoints = months.map((month, i) => ({
      month,
      type: 'Revenue',
      value: Math.round(revenue * distributionPattern[i]),
    }));

    return [...userDatapoints, ...tournamentDatapoints, ...revenueDatapoints];
  }, [usersData, tournamentsData, statistics]);

  // Render tournament status pie chart
  const renderTournamentStatusChart = () => {
    // If there are no tournaments, show empty state
    if (tournamentStatusData.every((item) => item.value === 0)) {
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          No tournament data available
        </div>
      );
    }

    const config = {
      appendPadding: 10,
      data: tournamentStatusData,
      angleField: 'value',
      colorField: 'status',
      radius: 0.8,
      innerRadius: 0.6,
      color: ['#52c41a', '#faad14', '#1890ff', '#f5222d'],
      label: {
        type: 'inner',
        offset: '-50%',
        content: '{value}',
        style: {
          textAlign: 'center',
          fontSize: '14px',
          fill: '#fff',
        },
      },
      interactions: [{ type: 'element-active' }],
      statistic: {
        title: {
          style: {
            fontSize: '14px',
          },
          content: '',
        },
        content: {
          style: {
            whiteSpace: 'pre-wrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: '16px',
          },
          content: 'Tournament\nStatus',
        },
      },
    };
    return <Pie {...config} />;
  };

  // Render user role pie chart
  const renderUserRoleChart = () => {
    // If there are no users, show empty state
    if (userRoleData.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          No user data available
        </div>
      );
    }

    const config = {
      appendPadding: 10,
      data: userRoleData,
      angleField: 'value',
      colorField: 'role',
      radius: 0.8,
      innerRadius: 0.6,
      color: ['#1890ff', '#f5222d', '#faad14', '#722ed1'],
      label: {
        type: 'inner',
        offset: '-50%',
        content: '{value}',
        style: {
          textAlign: 'center',
          fontSize: '14px',
          fill: '#fff',
        },
      },
      interactions: [{ type: 'element-active' }],
      statistic: {
        title: {
          style: {
            fontSize: '14px',
          },
          content: '',
        },
        content: {
          style: {
            whiteSpace: 'pre-wrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: '16px',
          },
          content: 'User\nDistribution',
        },
      },
    };
    return <Pie {...config} />;
  };

  // this template not data
  const calculateProgressPercent = (value: number, type: string) => {
    switch (type) {
      case 'tournament':
        // Calculate percentage based on total possible tournaments (assuming a reasonable max)
        const maxTournaments = 100; // Adjust this based on your business logic
        return 100;
      case 'user':
        // Calculate percentage based on target user count
        const targetUsers = 500; // Adjust based on your business goals
        return 100;
      case 'blog':
        // Calculate percentage based on target blog posts
        const targetPosts = 50; // Adjust based on your content strategy
        return 100;
      case 'revenue':
        // Calculate percentage based on revenue target
        const targetRevenue = 100000; // Adjust based on financial goals
        return 100;
      default:
        return 50; // Default fallback
    }
  };

  // Determine if any data is still loading
  const isLoading =
    isLoadingTournaments ||
    isLoadingUsers ||
    isLoadingSponsors ||
    isLoadingReferees;

  // Card style for hover effect
  const cardStyle = {
    height: '100%',
    transition: 'all 0.3s',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    ':hover': {
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      transform: 'translateY(-5px)',
    },
  };

  return (
    <div>
      {/* Hero Section */}
      <Card
        style={{
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
          color: 'white',
        }}
        bodyStyle={{ padding: '24px' }}
        bordered={false}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={18}>
            <Title level={2} style={{ color: 'white', marginBottom: '8px' }}>
              Admin Dashboard
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px' }}>
              Welcome to your Pickleball Tournament Management Hub. Monitor
              tournament status, user activity, and system performance.
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Main Stats Cards - Consolidated to 4 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {/* Tournament Management Card */}
        <Col xs={24} md={12} lg={6}>
          <Card
            style={{
              height: '100%',
              background: 'linear-gradient(to bottom, #f6ffed, #ffffff)',
            }}
            hoverable
            bordered={false}
            bodyStyle={{ padding: '20px' }}
          >
            <Statistic
              title={
                <Title level={4} style={{ color: '#52c41a' }}>
                  Tournament Management
                </Title>
              }
              value={statistics.tournaments}
              prefix={<TrophyOutlined style={{ color: '#52c41a' }} />}
              loading={isLoadingTournaments}
              suffix={
                <Tooltip title="Total tournaments in the system">
                  <InfoCircleOutlined
                    style={{
                      fontSize: '16px',
                      marginLeft: 8,
                      color: '#52c41a',
                    }}
                  />
                </Tooltip>
              }
            />
            <Divider style={{ margin: '12px 0' }} />
            <Space direction="vertical" style={{ width: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Badge
                  status="success"
                  text={
                    <Text strong>
                      {statistics.completedTournaments} Completed
                    </Text>
                  }
                />
                <Badge
                  status="processing"
                  text={
                    <Text strong>{statistics.ongoingTournaments} Ongoing</Text>
                  }
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '8px',
                }}
              >
                <Badge
                  status="warning"
                  text={
                    <Text strong>{statistics.pendingTournaments} Pending</Text>
                  }
                />
                <Badge
                  status="error"
                  text={
                    <Text strong>
                      {statistics.disabledTournaments} Disabled
                    </Text>
                  }
                />
              </div>
              <Progress
                percent={calculateProgressPercent(
                  statistics.tournaments,
                  'tournament'
                )}
                status="active"
                strokeColor="#52c41a"
                showInfo={false}
                style={{ marginTop: '12px' }}
              />
              <Link to="/tournament/admin/overview">
                <Button
                  type="primary"
                  style={{
                    marginTop: '12px',
                    width: '100%',
                    background: '#52c41a',
                    borderColor: '#52c41a',
                  }}
                >
                  Tournament Admin
                </Button>
              </Link>
            </Space>
          </Card>
        </Col>

        {/* User Management Card */}
        <Col xs={24} md={12} lg={6}>
          <Card
            style={{
              height: '100%',
              background: 'linear-gradient(to bottom, #e6f7ff, #ffffff)',
            }}
            hoverable
            bordered={false}
            bodyStyle={{ padding: '20px' }}
          >
            <Statistic
              title={
                <Title level={4} style={{ color: '#1890ff' }}>
                  User Management
                </Title>
              }
              value={statistics.users}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
              loading={isLoadingUsers}
              suffix={
                <Tooltip title="Total registered users">
                  <InfoCircleOutlined
                    style={{
                      fontSize: '16px',
                      marginLeft: 8,
                      color: '#1890ff',
                    }}
                  />
                </Tooltip>
              }
            />
            <Divider style={{ margin: '12px 0' }} />
            <Space direction="vertical" style={{ width: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Badge
                  status="success"
                  text={<Text strong>{statistics.activeUsers} Active</Text>}
                />
                <Badge
                  status="error"
                  text={
                    <Text strong>
                      {statistics.users - statistics.activeUsers} Inactive
                    </Text>
                  }
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '8px',
                }}
              >
                <Text>
                  <TeamOutlined /> {statistics.teams} Teams
                </Text>
                <Text>
                  <LockOutlined />{' '}
                  {usersData?.filter((u) => u.roleId === 2).length || 0} Admins
                </Text>
              </div>
              <Progress
                percent={calculateProgressPercent(statistics.users, 'user')}
                status="active"
                strokeColor="#1890ff"
                showInfo={false}
                style={{ marginTop: '12px' }}
              />
              <Link to="/authencation/block-user">
                <Button
                  type="primary"
                  style={{ marginTop: '12px', width: '100%' }}
                >
                  User Admin
                </Button>
              </Link>
            </Space>
          </Card>
        </Col>

        {/* Content Management Card */}
        <Col xs={24} md={12} lg={6}>
          <Card
            style={{
              height: '100%',
              background: 'linear-gradient(to bottom, #f9f0ff, #ffffff)',
            }}
            hoverable
            bordered={false}
            bodyStyle={{ padding: '20px' }}
          >
            <Statistic
              title={
                <Title level={4} style={{ color: '#722ed1' }}>
                  Content Management
                </Title>
              }
              value={statistics.blogPosts}
              prefix={<FileTextOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
              loading={false}
              suffix={
                <Tooltip title="Total blog posts and rules">
                  <InfoCircleOutlined
                    style={{
                      fontSize: '16px',
                      marginLeft: 8,
                      color: '#722ed1',
                    }}
                  />
                </Tooltip>
              }
            />
            <Divider style={{ margin: '12px 0' }} />
            <Space direction="vertical" style={{ width: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Badge
                  color="purple"
                  text={
                    <Text strong>
                      {Array.isArray(rulesData) ? rulesData.length : 0} Rules
                    </Text>
                  }
                />
                <Badge
                  color="cyan"
                  text={
                    <Text strong>
                      {Array.isArray(blogCategoriesData)
                        ? blogCategoriesData.length
                        : 0}{' '}
                      Categories
                    </Text>
                  }
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '8px',
                }}
              >
                <Text>
                  <CalendarOutlined /> Last updated:{' '}
                  {new Date().toLocaleDateString()}
                </Text>
              </div>
              <Progress
                percent={calculateProgressPercent(statistics.blogPosts, 'blog')}
                status="active"
                strokeColor="#722ed1"
                showInfo={false}
                style={{ marginTop: '12px' }}
              />
              <Link to="/blog">
                <Button
                  type="primary"
                  style={{
                    marginTop: '12px',
                    width: '100%',
                    background: '#722ed1',
                    borderColor: '#722ed1',
                  }}
                >
                  Content Admin
                </Button>
              </Link>
            </Space>
          </Card>
        </Col>

        {/* Financial Management Card */}
        <Col xs={24} md={12} lg={6}>
          <Card
            style={{
              height: '100%',
              background: 'linear-gradient(to bottom, #fffbe6, #ffffff)',
            }}
            hoverable
            bordered={false}
            bodyStyle={{ padding: '20px' }}
          >
            <Statistic
              title={
                <Title level={4} style={{ color: '#faad14' }}>
                  Financial Management
                </Title>
              }
              value={statistics.revenue}
              prefix={<DollarOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
              precision={2}
              suffix="$"
              loading={isLoadingTournaments}
            />
            <Divider style={{ margin: '12px 0' }} />
            <Space direction="vertical" style={{ width: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Badge
                  color="gold"
                  text={<Text strong>{statistics.payments} Transactions</Text>}
                />
                <Badge
                  color="green"
                  text={
                    <Text strong>{statistics.completedPayments} Completed</Text>
                  }
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '8px',
                }}
              >
                <Text>
                  <CheckCircleOutlined /> Success rate:{' '}
                  {statistics.payments > 0
                    ? Math.round(
                        (statistics.completedPayments / statistics.payments) *
                          100
                      )
                    : 0}
                  %
                </Text>
              </div>
              <Progress
                percent={calculateProgressPercent(
                  statistics.revenue,
                  'revenue'
                )}
                status="active"
                strokeColor="#faad14"
                showInfo={false}
                style={{ marginTop: '12px' }}
              />
              <Link to="/admin/payment">
                <Button
                  type="primary"
                  style={{
                    marginTop: '12px',
                    width: '100%',
                    background: '#faad14',
                    borderColor: '#faad14',
                  }}
                >
                  Payment Admin
                </Button>
              </Link>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Pie Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} md={12}>
          <Card
            title={
              <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                <TrophyOutlined /> Tournament Status
              </span>
            }
            loading={isLoading}
            hoverable
            bordered={false}
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          >
            {!isLoading && renderTournamentStatusChart()}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title={
              <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                <UserOutlined /> User Distribution
              </span>
            }
            loading={isLoading}
            hoverable
            bordered={false}
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          >
            {!isLoading && renderUserRoleChart()}
          </Card>
        </Col>
      </Row>

      {/* Quick Access Panel */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title={
              <Title level={4} style={{ margin: 0 }}>
                Quick Access
              </Title>
            }
            bordered={false}
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Link to="/tournament/admin/overview">
                  <Card
                    hoverable
                    style={{ textAlign: 'center' }}
                    bodyStyle={{ padding: '12px' }}
                  >
                    <TrophyOutlined
                      style={{ fontSize: '24px', color: '#52c41a' }}
                    />
                    <div style={{ marginTop: '8px' }}>Tournaments</div>
                  </Card>
                </Link>
              </Col>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Link to="/authencation/block-user">
                  <Card
                    hoverable
                    style={{ textAlign: 'center' }}
                    bodyStyle={{ padding: '12px' }}
                  >
                    <UserOutlined
                      style={{ fontSize: '24px', color: '#1890ff' }}
                    />
                    <div style={{ marginTop: '8px' }}>Users</div>
                  </Card>
                </Link>
              </Col>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Link to="/blog">
                  <Card
                    hoverable
                    style={{ textAlign: 'center' }}
                    bodyStyle={{ padding: '12px' }}
                  >
                    <FileTextOutlined
                      style={{ fontSize: '24px', color: '#722ed1' }}
                    />
                    <div style={{ marginTop: '8px' }}>Blog</div>
                  </Card>
                </Link>
              </Col>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Link to="/admin/payment">
                  <Card
                    hoverable
                    style={{ textAlign: 'center' }}
                    bodyStyle={{ padding: '12px' }}
                  >
                    <CreditCardOutlined
                      style={{ fontSize: '24px', color: '#faad14' }}
                    />
                    <div style={{ marginTop: '8px' }}>Payments</div>
                  </Card>
                </Link>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
