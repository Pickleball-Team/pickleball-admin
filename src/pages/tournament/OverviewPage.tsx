import { Pie } from '@ant-design/charts';
import {
  CalendarOutlined,
  MessageOutlined,
  PieChartOutlined,
  PlusCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import type { InputRef } from 'antd';
import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Input,
  message,
  Modal,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useCreateTournament } from '../../modules/Tournaments/hooks/useCreateTournament';
import { useGetTournamentsBySponsorId } from '../../modules/Tournaments/hooks/useGetTournamentsBySponsorId';
import { useTournamentNotes } from '../../modules/Tournaments/hooks/useTournamentNotes';
import { TournamentRequest } from '../../modules/Tournaments/models';
import { RootState } from '../../redux/store';
import CreateTournamentModal from './containers/CreateTournamentModal';

const { Title } = Typography;

type DataIndex = string;

// Tournament type enum
enum TournamentType {
  SinglesMale = 1,
  SinglesFemale = 2,
  DoublesMale = 3,
  DoublesFemale = 4,
  DoublesMix = 5,
}

// Define Tournament interface
interface Tournament {
  id: number;
  name: string;
  location?: string;
  type: string;
  status: string;
  isAccept: boolean;
  totalPrize?: number;
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

  const { getNoteByTournamentId } = useTournamentNotes();
  const [tournamentNotes, setTournamentNotes] = useState<Record<number, any>>(
    {}
  );
  const [viewNoteModalOpen, setViewNoteModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);

  // Fetch notes for all tournaments
  useEffect(() => {
    const fetchNotes = async () => {
      if (data && data.length > 0) {
        const notesMap: Record<number, any> = {};
        await Promise.all(
          data.map(async (tournament) => {
            const noteData = await getNoteByTournamentId(tournament.id);
            if (noteData) {
              notesMap[tournament.id] = noteData;
            }
          })
        );
        setTournamentNotes(notesMap);
      }
    };
    fetchNotes();
  }, [data, getNoteByTournamentId]);

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
      year: 'numeric',
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
    return typeName
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace(/^./, (str) => str.toUpperCase());
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
        <div
          style={{ display: 'flex', flexDirection: 'column', padding: '8px 0' }}
        >
          <span style={{ fontWeight: 'bold' }}>{text}</span>
          <span style={{ fontSize: '12px', color: '#888' }}>
            {record.location}
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
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '6px 0',
            }}
          >
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
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '6px 0',
            }}
          >
            <Badge color={statusColor} text={record.status} />
            <span style={{ fontSize: '12px', marginTop: 8 }}>
              Prize:{' '}
              <strong>${record.totalPrize?.toLocaleString() || 0}</strong>
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
      render: (isAccept: boolean, record: any) => {
        const hasNote = tournamentNotes[record.id];

        return (
          <div>
            <Tag
              color={
                isAccept
                  ? 'green'
                  : record.status === 'Disable'
                    ? 'red'
                    : 'orange'
              }
            >
              {isAccept
                ? 'Approved'
                : record.status === 'Disable'
                  ? 'Rejected'
                  : 'Pending'}
            </Tag>
            {hasNote && (
              <Button
                type="link"
                size="small"
                icon={<MessageOutlined />}
                onClick={() => openViewNoteModal(record)}
                style={{ padding: 0 }}
              >
                View Note
              </Button>
            )}
          </div>
        );
      },
      width: 120,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div style={{ padding: '6px 0' }}>
          {record.isAccept ? (
            <Button type="link" style={{ padding: '4px 0' }}>
              <Link to={`/tournament/${record.id}`}>Details</Link>
            </Button>
          ) : null}
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

  const singlesMaleTournaments =
    data?.filter(
      (t) =>
        String(t.type) === String(TournamentType.SinglesMale) ||
        String(t.type) === '1' ||
        String(t.type) === 'SinglesMale'
    ).length || 0;

  const singleFemaleTournaments =
    data?.filter(
      (t) =>
        String(t.type) === String(TournamentType.SinglesFemale) ||
        String(t.type) === '2' ||
        String(t.type) === 'SinglesFemale'
    ).length || 0;

  const doublesMaleTournaments =
    data?.filter(
      (t) =>
        String(t.type) === String(TournamentType.DoublesMale) ||
        String(t.type) === '3' ||
        String(t.type) === 'DoublesMale'
    ).length || 0;

  const doubleFemaleTournaments =
    data?.filter(
      (t) =>
        String(t.type) === String(TournamentType.DoublesFemale) ||
        String(t.type) === '4' ||
        String(t.type) === 'DoublesFemale'
    ).length || 0;

  const doublesMixTournaments =
    data?.filter(
      (t) =>
        String(t.type) === String(TournamentType.DoublesMix) ||
        String(t.type) === '5' ||
        String(t.type) === 'DoublesMix'
    ).length || 0;

  const singlesTournaments = singlesMaleTournaments + singleFemaleTournaments;
  const doublesTournaments =
    doublesMaleTournaments + doubleFemaleTournaments + doublesMixTournaments;

  // Updated pie chart configuration with smaller size
  const pieConfig = (data: any[], angleField: string, colorField: string) => ({
    appendPadding: 5,
    data,
    angleField,
    colorField,
    radius: 0.85,
    innerRadius: 0.6,
    width: 360,
    height: 360,
    label: {
      type: 'inner',
      offset: '-30%',
      content: (datum: any) => `${(datum.percent * 100).toFixed(0)}%`,
      style: {
        fontSize: 12,
        textAlign: 'center',
        fontWeight: 'bold',
      },
    },
    legend: {
      visible: false,
    },
    interactions: [{ type: 'element-active' }],
    color:
      colorField === 'type'
        ? ['#1890ff', '#eb2f96', '#722ed1', '#a0d911', '#13c2c2']
        : undefined,
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

  // Function to open the view note modal
  const openViewNoteModal = async (record: any) => {
    const noteData = tournamentNotes[record.id];
    if (noteData) {
      setSelectedNote(noteData);
      setViewNoteModalOpen(true);
    } else {
      console.log('No notes available for this tournament');
    }
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
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
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
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#fa8c16',
                  }}
                >
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
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#1890ff',
                  }}
                >
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
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#722ed1',
                  }}
                >
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
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#52c41a',
                  }}
                >
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
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#faad14',
                  }}
                >
                  {pendingTournaments}
                </div>
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Charts Row with Custom Legend Outside */}
        <Col span={24} style={{ marginTop: 16 }}></Col>
      </Row>

      {/* Second half of screen - Table */}
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
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
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} tournaments`,
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

      {/* Add View Note Modal */}
      <Modal
        title="Tournament Note"
        open={viewNoteModalOpen}
        onCancel={() => setViewNoteModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setViewNoteModalOpen(false)}>
            Close
          </Button>,
        ]}
      >
        {selectedNote && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Action">
              <Tag color={selectedNote.action === 'accept' ? 'green' : 'red'}>
                {selectedNote.action === 'accept' ? 'Approved' : 'Rejected'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Note">
              {selectedNote.note}
            </Descriptions.Item>
            <Descriptions.Item label="Timestamp">
              {new Date(selectedNote.timestamp).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

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
