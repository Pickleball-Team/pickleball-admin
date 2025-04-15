import { SearchOutlined, PlusCircleOutlined, CalendarOutlined, PieChartOutlined } from '@ant-design/icons';
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
  message,
  Tooltip,
  Badge,
  Empty,
} from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetAllTournaments } from '../../modules/Tournaments/hooks/useGetAllTournaments';
import { useUpdateTournament } from '../../modules/Tournaments/hooks/useUpdateTournamen';
import { Pie } from '@ant-design/charts';
import { useGetTournamentsBySponsorId } from '../../modules/Tournaments/hooks/useGetTournamentsBySponsorId';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useCreateTournament } from '../../modules/Tournaments/hooks/useCreateTournament';
import { TournamentRequest } from '../../modules/Tournaments/models';
import { useQueryClient } from '@tanstack/react-query';
import CreateTournamentModal from './containers/CreateTournamentModal';

const { Title } = Typography;

type DataIndex = string;

// Tournament type enum
enum TournamentType {
  SinglesMale = 1,
  SinglesFemale = 2,
  DoublesMale = 3,
  DoublesFemale = 4,
  DoublesMix = 5
}

export const OverviewPage = () => {
  const user = useSelector((state: RootState) => state.authencation.user);
  const { data, isLoading, refetch } = useGetTournamentsBySponsorId(
    user?.id ?? 0
  );
  const [searchText, setSearchText] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState<string>('');
  const searchInput = useRef<InputRef>(null);
  const queryClient = useQueryClient();
  const { mutate: createTournament, isLoading: isCreating } =
    useCreateTournament();

  // Tournament creation state
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

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

  // Helper function to format dates
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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

  const columns: ColumnsType<any> = [
    {
      title: 'Tournament',
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name'),
      render: (text: string, record: any) => (
        <div style={{ display: 'flex', flexDirection: 'column', padding: '8px 0' }}>
          <span style={{ fontWeight: 'bold' }}>{text}</span>
          <span style={{ fontSize: '12px', color: '#888' }}>{record.location}</span>
        </div>
      ),
      width: 220,
    },
    {
      title: 'Period',
      key: 'period',
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column', padding: '6px 0' }}>
          <div>
            <CalendarOutlined /> <span style={{ fontWeight: 500 }}>Start:</span> {formatDate(record.startDate)}
          </div>
          <div style={{ marginTop: 4 }}>
            <CalendarOutlined /> <span style={{ fontWeight: 500 }}>End:</span> {formatDate(record.endDate)}
          </div>
        </div>
      ),
      width: 220,
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
        const { color, statusColor } = getStatusBadge(record.status);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', padding: '6px 0' }}>
            <Badge color={statusColor} text={record.status} />
            <span style={{ fontSize: '12px', marginTop: 8 }}>
              Prize: <strong>${record.totalPrize?.toLocaleString() || 0}</strong>
            </span>
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
      filters: [
        { text: 'Approved', value: true },
        { text: 'Pending', value: false },
      ],
      onFilter: (value, record) => record.isAccept === value,
      render: (isAccept: boolean) => (
        <div style={{ padding: '6px 0' }}>
          <Tag color={isAccept ? "success" : "processing"} style={{ margin: 0 }}>
            {isAccept ? "Approved" : "Pending"}
          </Tag>
        </div>
      ),
      width: 120,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div style={{ padding: '6px 0' }}>
          <Button type="link" style={{ padding: '4px 0' }}>
            <Link to={`/tournament/${record.id}`}>Details</Link>
          </Button>
        </div>
      ),
      width: 100,
    },
  ];

  const totalTournaments = data?.length || 0;
  const pendingTournaments =
    data?.filter((t) => t.status === 'Pending').length || 0;
  const ongoingTournaments =
    data?.filter((t) => t.status === 'Ongoing').length || 0;
  const completedTournaments =
    data?.filter((t) => t.status === 'Completed').length || 0;
  const disabledTournaments =
    data?.filter((t) => t.status === 'Disable').length || 0;

  const singlesMaleTournaments = data?.filter((t) => 
    String(t.type) === String(TournamentType.SinglesMale) || 
    String(t.type) === "1" || 
    String(t.type) === 'SinglesMale').length || 0;
  
  const singleFemaleTournaments = data?.filter((t) => 
    String(t.type) === String(TournamentType.SinglesFemale) || 
    String(t.type) === "2" || 
    String(t.type) === 'SinglesFemale').length || 0;
  
  const doublesMaleTournaments = data?.filter((t) => 
    String(t.type) === String(TournamentType.DoublesMale) || 
    String(t.type) === "3" || 
    String(t.type) === 'DoublesMale').length || 0;
  
  const doubleFemaleTournaments = data?.filter((t) => 
    String(t.type) === String(TournamentType.DoublesFemale) || 
    String(t.type) === "4" || 
    String(t.type) === 'DoublesFemale').length || 0;
  
  const doublesMixTournaments = data?.filter((t) => 
    String(t.type) === String(TournamentType.DoublesMix) || 
    String(t.type) === "5" || 
    String(t.type) === 'DoublesMix').length || 0;

  const singlesTournaments = singlesMaleTournaments + singleFemaleTournaments;
  const doublesTournaments = doublesMaleTournaments + doubleFemaleTournaments + doublesMixTournaments;

  const tournamentTypeData = [
    { type: 'Singles Male', value: singlesMaleTournaments },
    { type: 'Singles Female', value: singleFemaleTournaments },
    { type: 'Doubles Male', value: doublesMaleTournaments },
    { type: 'Doubles Female', value: doubleFemaleTournaments },
    { type: 'Doubles Mix', value: doublesMixTournaments },
  ].filter(item => item.value > 0);

  const tournamentStatusData = [
    { status: 'Pending', value: pendingTournaments },
    { status: 'Ongoing', value: ongoingTournaments },
    { status: 'Completed', value: completedTournaments },
    { status: 'Disable', value: disabledTournaments },
  ].filter(item => item.value > 0);

  // Updated pie chart configuration with smaller size
  const pieConfig = (data: any[], angleField: string, colorField: string) => ({
    appendPadding: 5,
    data,
    angleField,
    colorField,
    radius: 0.8,
    innerRadius: 0.6,
    width: 200,
    height: 200,
    label: {
      type: 'inner',
      offset: '-30%',
      content: (datum: any) => `${(datum.percent * 100).toFixed(0)}%`,
      style: {
        fontSize: 10,
        textAlign: 'center',
        fontWeight: 'bold',
      },
    },
    legend: {
      visible: false, // Hide the legend from chart itself
    },
    interactions: [{ type: 'element-active' }],
    color: colorField === 'type' ? 
      ['#1890ff', '#eb2f96', '#722ed1', '#a0d911', '#13c2c2'] : undefined,
  });

  const handleCreateTournament = (tournamentData: TournamentRequest) => {
    createTournament(tournamentData, {
      onSuccess: () => {
        message.success('Tournament created successfully!');
        setIsCreateModalVisible(false);
        refetch();
      },
      onError: (error: any) => {
        message.error(
          `Failed to create tournament: ${error.message || 'Unknown error'}`
        );
      },
    });
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f0f2f5' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <Typography.Title level={2} style={{ margin: 0 }}>
          Tournament Overview
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={() => setIsCreateModalVisible(true)}
          size="large"
        >
          Create Tournament
        </Button>
      </div>

      {/* First half of screen - Stats and Charts */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {/* Stats Cards */}
        <Col span={24}>
          <Row gutter={16}>
            <Col xs={12} sm={8} md={4}>
              <Card
                title="Total Tournaments"
                bordered={false}
                style={{ backgroundColor: '#ffffff', height: '100%' }}
              >
                <div style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>
                  {totalTournaments}
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card
                title="Active Tournaments"
                bordered={false}
                style={{ backgroundColor: '#ffffff', height: '100%' }}
              >
                <div style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', color: '#fa8c16' }}>
                  {ongoingTournaments}
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card
                title="Singles Tournaments"
                bordered={false}
                style={{ backgroundColor: '#ffffff', height: '100%' }}
              >
                <div style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', color: '#1890ff' }}>
                  {singlesTournaments}
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card
                title="Doubles Tournaments"
                bordered={false}
                style={{ backgroundColor: '#ffffff', height: '100%' }}
              >
                <div style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', color: '#722ed1' }}>
                  {doublesTournaments}
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card
                title="Completed"
                bordered={false}
                style={{ backgroundColor: '#ffffff', height: '100%' }}
              >
                <div style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', color: '#52c41a' }}>
                  {completedTournaments}
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card
                title="Pending"
                bordered={false}
                style={{ backgroundColor: '#ffffff', height: '100%' }}
              >
                <div style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', color: '#faad14' }}>
                  {pendingTournaments}
                </div>
              </Card>
            </Col>
          </Row>
        </Col>
        
        {/* Charts Row with Custom Legend Outside */}
        <Col span={24} style={{ marginTop: 16 }}>
          <Row gutter={10}>
            <Col xs={24} md={12}>
              <Card
                title={<><PieChartOutlined /> Tournament Types</>}
                bordered={false}
                style={{ backgroundColor: '#ffffff', height: '100%' }}
              >
                {tournamentTypeData.length > 0 ? (
                  <Row>
                    <Col span={12}>
                      <div style={{ display: 'flex', justifyContent: 'center', height: '140px' }}>
                        <Pie {...pieConfig(tournamentTypeData, 'value', 'type')} />
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ padding: '10px' }}>
                        {tournamentTypeData.map(item => (
                          <div key={item.type} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ 
                              width: '10px', 
                              height: '10px', 
                              borderRadius: '50%', 
                              backgroundColor: item.type === 'Singles Male' ? '#1890ff' : 
                                              item.type === 'Singles Female' ? '#eb2f96' :
                                              item.type === 'Doubles Male' ? '#722ed1' :
                                              item.type === 'Doubles Female' ? '#a0d911' : '#13c2c2',
                              marginRight: '8px'
                            }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '12px' }}>{item.type}</div>
                            </div>
                            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.value}</div>
                          </div>
                        ))}
                      </div>
                    </Col>
                  </Row>
                ) : (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No tournament data available" />
                )}
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                title={<><PieChartOutlined /> Tournament Status</>}
                bordered={false}
                style={{ backgroundColor: '#ffffff', height: '100%' }}
              >
                {tournamentStatusData.length > 0 ? (
                  <Row>
                    <Col span={12}>
                      <div style={{ display: 'flex', justifyContent: 'center', height: '140px' }}>
                        <Pie {...pieConfig(tournamentStatusData, 'value', 'status')} />
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ padding: '10px' }}>
                        {tournamentStatusData.map(item => (
                          <div key={item.status} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ 
                              width: '10px', 
                              height: '10px', 
                              borderRadius: '50%', 
                              backgroundColor: item.status === 'Pending' ? '#faad14' :
                                              item.status === 'Ongoing' ? '#52c41a' :
                                              item.status === 'Completed' ? '#13c2c2' : '#f5222d',
                              marginRight: '8px'
                            }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '12px' }}>{item.status}</div>
                            </div>
                            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.value}</div>
                          </div>
                        ))}
                      </div>
                    </Col>
                  </Row>
                ) : (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No tournament data available" />
                )}
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Second half of screen - Table */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          type="primary"
          onClick={() => refetch()}
          icon={<SearchOutlined />}
        >
          Refresh Data
        </Button>
        
        <Typography.Text type="secondary">
          Showing {data?.length || 0} tournaments
        </Typography.Text>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        loading={isLoading}
        rowKey="id"
        style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '8px',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
        }}
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} tournaments`
        }}
        size="middle"
        bordered={false}
      />

      {/* Tournament Creation Modal */}
      <CreateTournamentModal
        visible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        onSubmit={handleCreateTournament}
        isSubmitting={isCreating}
        organizerId={user?.id ?? 0}
      />
      
      <style>
        {`
        .chart-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 140px;
        }
        
        .compact-legend {
          display: flex;
          flex-direction: column;
          padding: 0 10px;
          font-size: 12px;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          margin-bottom: 5px;
        }
        
        .color-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: 6px;
        }
        
        .legend-label {
          flex: 1;
        }
        
        .legend-value {
          font-weight: bold;
        }
        
        @media (max-width: 768px) {
          .stats-row > div {
            margin-bottom: 10px;
          }
        }
        `}
      </style>
    </div>
  );
};

export default OverviewPage;
