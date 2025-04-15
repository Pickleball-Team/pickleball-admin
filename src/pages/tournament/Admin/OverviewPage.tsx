import {
  SearchOutlined,
  CalendarOutlined,
  LineChartOutlined,
  PieChartOutlined,
  TeamOutlined,
  TrophyOutlined,
  BarsOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { InputRef } from 'antd';
import {
  Button,
  Card,
  Col,
  Input,
  Row,
  Space,
  Table,
  Tag,
  Typography,
  Badge,
  Tooltip,
  Statistic,
  Empty,
  Tabs,
  message,
} from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetAllTournaments } from '../../../modules/Tournaments/hooks/useGetAllTournaments';
import { useUpdateTournament } from '../../../modules/Tournaments/hooks/useUpdateTournamen';
import { Pie } from '@ant-design/charts';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

type DataIndex = string;

// Tournament type enum
enum TournamentType {
  SinglesMale = 1,
  SinglesFemale = 2,
  DoublesMale = 3,
  DoublesFemale = 4,
  DoublesMix = 5,
}

export const OverviewPage = () => {
  const { data, isLoading, refetch } = useGetAllTournaments();
  const { mutate: updateTournament } =
    useUpdateTournament();
  const [searchText, setSearchText] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState<string>('');
  const searchInput = useRef<InputRef>(null);
  const [activeTab, setActiveTab] = useState<string>('all');

  const handleSearch = (
    selectedKeys: string[],
    confirm: () => void,
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters?: () => void) => {
    if (clearFilters) {
      clearFilters();
    }
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<any> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes((value as string).toLowerCase())
        : '',
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <span style={{ backgroundColor: '#ffc069', padding: 0 }}>{text}</span>
      ) : (
        text
      ),
  });

  const handleAccept = async (id: number) => {
    try {
      updateTournament(
        { id, data: { isAccept: true, status: 'Scheduled' } },
        {
          onSuccess: () => {
            message.success('Tournament approved successfully');
            refetch();
          },
          onError: (error) => {
            message.error('Failed to approve tournament');
            console.error('Error accepting tournament:', error);
          },
        }
      );
    } catch (error) {
      console.error('Error accepting tournament:', error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      updateTournament(
        { id, data: { isAccept: false, status: 'Disable' } },
        {
          onSuccess: () => {
            message.success('Tournament rejected successfully');
            refetch();
          },
          onError: (error) => {
            message.error('Failed to reject tournament');
            console.error('Error rejecting tournament:', error);
          },
        }
      );
    } catch (error) {
      console.error('Error rejecting tournament:', error);
    }
  };

  // Helper function to format dates
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Helper to check if date has passed
  const isDatePassed = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const today = new Date();
    const endDate = new Date(dateStr);
    return endDate < today;
  };

  // Helper to get status badge
  const getStatusBadge = (status: string) => {
    let color = '';
    let statusColor = '';

    switch (status) {
      case 'Scheduled':
        statusColor = 'blue';
        color = 'blue';
        break;
      case 'Ongoing':
        statusColor = 'orange';
        color = 'orange';
        break;
      case 'Completed':
        statusColor = 'green';
        color = 'green';
        break;
      case 'Disable':
        statusColor = 'red';
        color = 'red';
        break;
      case 'Pending':
        statusColor = 'gold';
        color = 'gold';
        break;
      default:
        statusColor = 'default';
        color = 'default';
    }

    return { color, statusColor };
  };

  // Helper function to get tournament type name by value
  const getTournamentTypeName = (typeValue: number | string): string => {
    if (typeof typeValue === 'string') {
      return typeValue; // Already a string name
    }

    switch (typeValue) {
      case TournamentType.SinglesMale:
        return 'Singles Male';
      case TournamentType.SinglesFemale:
        return 'Singles Female';
      case TournamentType.DoublesMale:
        return 'Doubles Male';
      case TournamentType.DoublesFemale:
        return 'Doubles Female';
      case TournamentType.DoublesMix:
        return 'Doubles Mix';
      default:
        return 'Unknown';
    }
  };

  // Calculate tournament statistics based on the correct enum values
  const totalTournaments = data?.length || 0;
  const pendingTournaments =
    data?.filter((t) => t.status === 'Pending' || !t.isAccept).length || 0;
  const ongoingTournaments =
    data?.filter((t) => t.status === 'Ongoing' && t.isAccept).length || 0;
  const scheduledTournaments =
    data?.filter((t) => t.status === 'Scheduled' && t.isAccept).length || 0;
  const completedTournaments =
    data?.filter((t) => t.status === 'Completed' && t.isAccept).length || 0;
  const disabledTournaments =
    data?.filter((t) => t.status === 'Disable' || t.status === 'Canceled')
      .length || 0;

  // Count tournaments by type using type checking to handle different possible formats
  const singlesMaleTournaments =
    data?.filter(
      (t) =>
        (typeof t.type === 'number' && t.type === TournamentType.SinglesMale) ||
        (typeof t.type === 'number' && t.type === 1) ||
        (typeof t.type === 'string' && t.type === 'SinglesMale')
    ).length || 0;

  const singleFemaleTournaments =
    data?.filter(
      (t) =>
        (typeof t.type === 'number' && t.type === TournamentType.SinglesFemale) ||
        (typeof t.type === 'number' && t.type === 2) ||
        (typeof t.type === 'string' && t.type === 'SinglesFemale')
    ).length || 0;

  const doublesMaleTournaments =
    data?.filter(
      (t) =>
        (typeof t.type === 'number' && t.type === TournamentType.DoublesMale) ||
        (typeof t.type === 'number' && t.type === 3) ||
        (typeof t.type === 'string' && t.type === 'DoublesMale')
    ).length || 0;

  const doubleFemaleTournaments =
    data?.filter(
      (t) =>
        (typeof t.type === 'number' && t.type === TournamentType.DoublesFemale) ||
        (typeof t.type === 'number' && t.type === 4) ||
        (typeof t.type === 'string' && t.type === 'DoublesFemale')
    ).length || 0;

  const doublesMixTournaments =
    data?.filter(
      (t) =>
        (typeof t.type === 'number' && t.type === TournamentType.DoublesMix) ||
        (typeof t.type === 'number' && t.type === 5) ||
        (typeof t.type === 'string' && t.type === 'DoublesMix')
    ).length || 0;

  // Get filtered data based on active tab
  const getFilteredData = () => {
    if (!data || !Array.isArray(data)) return [];

    switch (activeTab) {
      case 'pending':
        return data.filter((t) => t.status === 'Pending' || !t.isAccept);
      case 'ongoing':
        return data.filter((t) => t.status === 'Ongoing' && t.isAccept);
      case 'scheduled':
        return data.filter((t) => t.status === 'Scheduled' && t.isAccept);
      case 'completed':
        return data.filter((t) => t.status === 'Completed' && t.isAccept);
      case 'disabled':
        return data.filter(
          (t) => t.status === 'Disable' || t.status === 'Canceled'
        );
      default:
        return data;
    }
  };

    // Helper function to get tournament type name by value and format it for display
    const formatTypeName = (type: string | number) => {
      if (!type) return 'Unknown';
      
      let typeName = '';
      
      if (typeof type === 'number') {
        switch (type) {
          case TournamentType.SinglesMale:
            typeName = 'SinglesMale';
            break;
          case TournamentType.SinglesFemale:
            typeName = 'SinglesFemale';
            break;
          case TournamentType.DoublesMale:
            typeName = 'DoublesMale';
            break;
          case TournamentType.DoublesFemale:
            typeName = 'DoublesFemale';
            break;
          case TournamentType.DoublesMix:
            typeName = 'DoublesMix';
            break;
          default:
            typeName = 'Unknown';
        }
      } else {
        typeName = type;
      }
      
      // Insert space before capital letters and capitalize first letter
      return typeName.replace(/([A-Z])/g, ' $1')
        .trim()
        .replace(/^./, str => str.toUpperCase());
    };
  
    // Helper to get color for tournament type
    const getTypeColor = (type: string | number) => {
      let typeName = '';
      
      if (typeof type === 'number') {
        switch (type) {
          case TournamentType.SinglesMale:
            typeName = 'SinglesMale';
            break;
          case TournamentType.SinglesFemale:
            typeName = 'SinglesFemale';
            break;
          case TournamentType.DoublesMale:
            typeName = 'DoublesMale';
            break;
          case TournamentType.DoublesFemale:
            typeName = 'DoublesFemale';
            break;
          case TournamentType.DoublesMix:
            typeName = 'DoublesMix';
            break;
          default:
            return 'default';
        }
      } else {
        typeName = type;
      }
  
      switch (typeName) {
        case 'SinglesMale':
          return 'blue';
        case 'SinglesFemale':
          return 'magenta';
        case 'DoublesMale':
          return 'geekblue';
        case 'DoublesFemale':
          return 'purple';
        case 'DoublesMix':
          return 'cyan';
        default:
          return 'default';
      }
    };

  // Updated tournament type data for pie chart
  const tournamentTypeData = [
    { type: 'Singles Male', value: singlesMaleTournaments, color: '#1890ff' },
    { type: 'Singles Female', value: singleFemaleTournaments, color: '#eb2f96' },
    { type: 'Doubles Male', value: doublesMaleTournaments, color: '#722ed1' },
    { type: 'Doubles Female', value: doubleFemaleTournaments, color: '#a0d911' },
    { type: 'Doubles Mix', value: doublesMixTournaments, color: '#13c2c2' },
  ].filter((item) => item.value > 0); // Only show types with tournaments

  const tournamentStatusData = [
    { status: 'Pending', value: pendingTournaments, color: '#faad14' },
    { status: 'Scheduled', value: scheduledTournaments, color: '#1890ff' },
    { status: 'Ongoing', value: ongoingTournaments, color: '#52c41a' },
    { status: 'Completed', value: completedTournaments, color: '#13c2c2' },
    { status: 'Disabled', value: disabledTournaments, color: '#f5222d' },
  ].filter((item) => item.value > 0); // Only show statuses with tournaments

  // Updated pie chart configuration with better visuals
  const pieConfig = (data: any[], angleField: string, colorField: string) => ({
    appendPadding: 10,
    data,
    angleField,
    colorField,
    radius: 0.8,
    innerRadius: 0.6,
    width: 170,
    height: 140,
    label: {
      type: 'outer',
      content: '{name}: {value}',
      style: {
        fontSize: 12,
        textAlign: 'center',
      },
    },
    legend: {
      layout: 'horizontal' as const,
      position: 'bottom' as 'bottom', // Use type-safe position value
    },
    interactions: [{ type: 'element-active' }],
    color: (datum: any) => {
      const item = data.find((item) => item[colorField] === datum[colorField]);
      return item?.color;
    },
    statistic: {
      title: {
        style: {
          fontSize: '14px',
          fontWeight: 'normal',
        },
        formatter: () => 'Total',
      },
      content: {
        style: {
          fontSize: '20px',
          fontWeight: 'bold',
        },
        formatter: () => data.reduce((sum, item) => sum + item.value, 0),
      },
    },
  });

  const columns: ColumnsType<any> = [
    {
      title: 'Tournament',
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name'),
      render: (text: string, record: any) => (
        <div
          style={{ display: 'flex', flexDirection: 'column', padding: '8px 0' }}
        >
          <Space>
            <span style={{ fontWeight: 'bold' }}>{text}</span>
            {record.isAccept ? (
              <Badge status="success" text="" />
            ) : (
              <Badge status="warning" text="" />
            )}
          </Space>
          <span style={{ fontSize: '12px', color: '#888' }}>
            {record.location || 'No location'}
          </span>
        </div>
      ),
      width: 220,
    },
    {
      title: 'Period',
      key: 'period',
      render: (_, record) => (
        <div
          style={{ display: 'flex', flexDirection: 'column', padding: '6px 0' }}
        >
          <div>
            <CalendarOutlined /> <span style={{ fontWeight: 500 }}>Start:</span>{' '}
            {formatDate(record.startDate)}
          </div>
          <div style={{ marginTop: 4 }}>
            <CalendarOutlined /> <span style={{ fontWeight: 500 }}>End:</span>{' '}
            {formatDate(record.endDate)}
            {isDatePassed(record.endDate) && record.status !== 'Completed' && (
              <Tag color="red" style={{ marginLeft: 8 }}>
                Expired
              </Tag>
            )}
          </div>
        </div>
      ),
      width: 220,
      sorter: (a, b) => {
        const dateA = new Date(a.startDate).getTime();
        const dateB = new Date(b.startDate).getTime();
        return dateA - dateB;
      },
    },
  {
      title: 'Type / Players',
      key: 'typeAndPlayers',
      render: (_, record) => {
        // Get type color based on the type value
        const typeColor = getTypeColor(record.type);
        
        // Format display name for better readability
        const displayName = formatTypeName(record.type);
        
        return (
          <div style={{ display: 'flex', flexDirection: 'column', padding: '6px 0' }}>
            <Tag color={typeColor}>{displayName}</Tag>
            <span style={{ fontSize: '12px', marginTop: 4 }}>
              Max: <strong>{record.maxPlayer}</strong> players
            </span>
          </div>
        );
      },
      filters: [
        { text: 'Singles Male', value: 'SinglesMale' },
        { text: 'Singles Female', value: 'SinglesFemale' },
        { text: 'Doubles Male', value: 'DoublesMale' },
        { text: 'Doubles Female', value: 'DoublesFemale' },
        { text: 'Doubles Mix', value: 'DoublesMix' },
      ],
      onFilter: (value, record) => {
        if (typeof record.type === 'number') {
          // Convert number type to string type for comparison
          const typeValue = TournamentType[record.type];
          return typeValue === value;
        }
        return record.type === value;
      },
      width: 160,
    },
    {
      title: 'Status / Prize',
      key: 'statusPrize',
      render: (_, record) => {
        const { statusColor } = getStatusBadge(record.status);
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '6px 0',
            }}
          >
            <Badge color={statusColor} text={record.status || 'Unknown'} />
            <span style={{ fontSize: '12px', marginTop: 8 }}>
              <TrophyOutlined /> Prize:{' '}
              <strong>${record.totalPrize?.toLocaleString() || 0}</strong>
            </span>
            {record.entryFee && (
              <span style={{ fontSize: '12px', marginTop: 2 }}>
                Entry: <strong>${record.entryFee.toLocaleString()}</strong>
              </span>
            )}
          </div>
        );
      },
      filters: [
        { text: 'Scheduled', value: 'Scheduled' },
        { text: 'Ongoing', value: 'Ongoing' },
        { text: 'Completed', value: 'Completed' },
        { text: 'Disable', value: 'Disable' },
        { text: 'Pending', value: 'Pending' },
      ],
      onFilter: (value, record) => record.status === value,
      width: 150,
    },
    {
      title: 'Approval',
      dataIndex: 'isAccept',
      key: 'isAccept',
      render: (isAccept: boolean, record) => {
        // Check if end date has passed
        const endDatePassed = isDatePassed(record.endDate);
        const isPending = record.status === 'Pending';

        if (record.status === 'Completed') {
          return <Tag color="success">Completed</Tag>;
        }

        if (endDatePassed) {
          return (
            <Tooltip title="Tournament has ended">
              <Tag color="default">Expired</Tag>
            </Tooltip>
          );
        }

        if (isAccept) {
          return <Tag color="success">Approved</Tag>;
        }

        if (record.status === 'Disable') {
          return <Tag color="error">Rejected</Tag>;
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Button
              type="primary"
              onClick={() => handleAccept(record.id)}
              style={{ width: '100%', marginBottom: 4 }}
              size="small"

            >
              Approve
            </Button>
            <Button
              danger
              onClick={() => handleReject(record.id)}
              style={{ width: '100%' }}
              size="small"

            >
              Reject
            </Button>
          </div>
        );
      },
      filters: [
        { text: 'Approved', value: true },
        { text: 'Pending', value: false },
      ],
      onFilter: (value, record) => record.isAccept === value,
      width: 120,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div style={{ padding: '6px 0' }}>
          <Button type="primary" size="small" style={{ marginBottom: 4 }}>
            <Link to={`/tournament/admin/${record.id}`}>View Details</Link>
          </Button>
        </div>
      ),
      width: 110,
    },
  ];

  return (
    <div className="admin-overview">
      <Card className="header-card">
        <div className="page-header">
          <div>
            <Title level={2}>Tournament Overview</Title>
            <Text type="secondary">
              Manage and monitor all tournaments in the system
            </Text>
          </div>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => {
              refetch();
              message.success('Data refreshed successfully');
            }}
          >
            Refresh Data
          </Button>
        </div>

        <Row gutter={[16, 16]} className="stats-row">
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card className="stat-card">
              <Statistic
                title="Total Tournaments"
                value={totalTournaments}
                valueStyle={{ color: '#1890ff' }}
                prefix={<BarsOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card className="stat-card">
              <Statistic
                title="Pending Approval"
                value={pendingTournaments}
                valueStyle={{ color: '#faad14' }}
                prefix={<LineChartOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card className="stat-card">
              <Statistic
                title="Scheduled"
                value={scheduledTournaments}
                valueStyle={{ color: '#1890ff' }}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card className="stat-card">
              <Statistic
                title="Ongoing"
                value={ongoingTournaments}
                valueStyle={{ color: '#52c41a' }}
                prefix={<LineChartOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card className="stat-card">
              <Statistic
                title="Completed"
                value={completedTournaments}
                valueStyle={{ color: '#13c2c2' }}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card className="stat-card">
              <Statistic
                title="Disabled"
                value={disabledTournaments}
                valueStyle={{ color: '#f5222d' }}
                prefix={<LineChartOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      <Row gutter={10} style={{ marginTop: 16, marginBottom: 16 }}>
        <Col xs={10} md={12}>
          <Card
            title={
              <>
                <PieChartOutlined /> Tournament Types
              </>
            }
            bordered={false}
            className="chart-card"
          >
            {tournamentTypeData.length > 0 ? (
              <Row gutter={16}>
                <Col span={24}>
                  <div className="chart-container">
                    <Pie {...pieConfig(tournamentTypeData, 'value', 'type')} />
                  </div>
                </Col>
                <Col span={24}>
                  <div className="chart-legend">
                    {tournamentTypeData.map((item) => (
                      <div key={item.type} className="legend-item">
                        <div
                          className="color-dot"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="legend-label">
                          <div>{item.type}</div>
                          <div className="legend-value">{item.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Col>
              </Row>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No tournament data available"
              />
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title={
              <>
                <PieChartOutlined /> Tournament Status
              </>
            }
            bordered={false}
            className="chart-card"
          >
            {tournamentStatusData.length > 0 ? (
              <Row gutter={16}>
                <Col span={24}>
                  <div className="chart-container">
                    <Pie {...pieConfig(tournamentStatusData, 'value', 'status')} />
                  </div>
                </Col>
                <Col span={24}>
                  <div className="chart-legend">
                    {tournamentStatusData.map((item) => (
                      <div key={item.status} className="legend-item">
                        <div
                          className="color-dot"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="legend-label">
                          <div>{item.status}</div>
                          <div className="legend-value">{item.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Col>
              </Row>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No tournament data available"
              />
            )}
          </Card>
        </Col>
      </Row>

      <Card title="Tournament List" className="table-card">
        <Tabs activeKey={activeTab} onChange={setActiveTab} className="filter-tabs">
          <TabPane tab="All Tournaments" key="all" />
          <TabPane tab={`Pending (${pendingTournaments})`} key="pending" />
          <TabPane tab={`Scheduled (${scheduledTournaments})`} key="scheduled" />
          <TabPane tab={`Ongoing (${ongoingTournaments})`} key="ongoing" />
          <TabPane tab={`Completed (${completedTournaments})`} key="completed" />
          <TabPane tab={`Disabled (${disabledTournaments})`} key="disabled" />
        </Tabs>

        <div className="table-info">
          <Text type="secondary">
            Showing {getFilteredData().length} tournaments{' '}
            {activeTab !== 'all' ? `in ${activeTab} status` : 'in total'}
          </Text>
        </div>

        <Table
          columns={columns}
          dataSource={getFilteredData()}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `Total ${total} tournaments`,
          }}
          size="middle"
          bordered={false}
          rowClassName={(record) => (!record.isAccept ? 'pending-row' : '')}
        />
      </Card>

      <style>
        {`
          .admin-overview {
            padding: 20px;
            background-color: #f0f2f5;
          }
          
          .header-card {
            margin-bottom: 16px;
            border-radius: 8px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.03);
          }
          
          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
          }
          
          .stats-row {
            margin-top: 16px;
          }
          
          .stat-card {
            height: 100%;
            border-radius: 8px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.03);
            transition: all 0.3s;
          }
          
          .stat-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          }
          
          .chart-card {
            height: 100%;
            border-radius: 8px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.03);
          }
          
          .chart-container {
            display: flex;
            justify-content: center;
            padding: 16px;
          }
          
          .table-card {
            border-radius: 8px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.03);
          }
          
          .table-info {
            margin-bottom: 16px;
          }
          
          .filter-tabs {
            margin-bottom: 16px;
          }
          
          .chart-legend {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 16px;
            margin-top: 8px;
            padding: 0 16px 16px;
          }
          
          .legend-item {
            display: flex;
            align-items: center;
          }
          
          .color-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
          }
          
          .legend-label {
            display: flex;
            flex-direction: column;
          }
          
          .legend-value {
            font-weight: bold;
            font-size: 14px;
          }
          
          .pending-row {
            background-color: #fffbe6;
          }
          
          @media (max-width: 576px) {
            .page-header {
              flex-direction: column;
              align-items: stretch;
            }
            
            .page-header button {
              margin-top: 16px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default OverviewPage;
