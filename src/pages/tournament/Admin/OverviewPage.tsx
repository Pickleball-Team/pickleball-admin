import {
  SearchOutlined,
  CalendarOutlined,
  LineChartOutlined,
  PieChartOutlined,
  TeamOutlined,
  TrophyOutlined,
  BarsOutlined,
  ReloadOutlined,
  DollarOutlined,
  MessageOutlined,
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
  Form,
  Modal,
  Descriptions,
} from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetAllTournaments } from '../../../modules/Tournaments/hooks/useGetAllTournaments';
import { useUpdateTournament } from '../../../modules/Tournaments/hooks/useUpdateTournamen';
import { Pie } from '@ant-design/charts';
import { useTournamentNotes } from '../../../modules/Tournaments/hooks/ useTournamentNotes';

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
  const { mutate: updateTournament } = useUpdateTournament();
  const { writeNote, getNoteByTournamentId } = useTournamentNotes();
  const [searchText, setSearchText] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState<string>('');
  const searchInput = useRef<InputRef>(null);
  const [activeTab, setActiveTab] = useState<string>('all');

  const [tournamentNotes, setTournamentNotes] = useState<Record<number, any>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [viewNoteModalOpen, setViewNoteModalOpen] = useState(false);
  const [noteType, setNoteType] = useState<'accept' | 'reject'>('accept');
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchNotes = async () => {
      if (data) {
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

  const handleSubmitNote = async () => {
    try {
      const values = await form.validateFields();
      const note = values.note;
      const id = selectedTournament.id;
      const action = noteType;

      // First write the note
      await writeNote(id, action, note);
      
      // Then update the tournament status
      if (action === 'accept') {
        await handleAccept(id);
      } else {
        await handleReject(id);
      }
      
      setModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to submit note');
    }
  };

  const openNoteModal = (record: any, type: 'accept' | 'reject') => {
    setSelectedTournament(record);
    setNoteType(type);
    setModalOpen(true);
  };

  const openViewNoteModal = async (record: any) => {
    setSelectedTournament(record);
    const noteData = tournamentNotes[record.id];
    if (noteData) {
      setSelectedNote(noteData);
      setViewNoteModalOpen(true);
    } else {
      message.info('No notes available for this tournament');
    }
  };

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

  // Calculate tournament statistics based on the correct enum values
  const totalTournaments = data?.length || 0;
  const pendingTournaments =
    data?.filter((t) => t.status === 'Pending').length || 0;
  const ongoingTournaments =
    data?.filter((t) => t.status === 'Ongoing').length || 0;
  const scheduledTournaments =
    data?.filter((t) => t.status === 'Scheduled').length || 0;
  const completedTournaments =
    data?.filter((t) => t.status === 'Completed').length || 0;
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
        (typeof t.type === 'number' &&
          t.type === TournamentType.SinglesFemale) ||
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
        (typeof t.type === 'number' &&
          t.type === TournamentType.DoublesFemale) ||
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
        return data.filter((t) => t.status === 'Pending');
      case 'ongoing':
        return data.filter((t) => t.status === 'Ongoing');
      case 'scheduled':
        return data.filter((t) => t.status === 'Scheduled');
      case 'completed':
        return data.filter((t) => t.status === 'Completed');
      case 'disabled':
        return data.filter(
          (t) => t.status === 'Disable' || t.status === 'Canceled'
        );
      default:
        return data;
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
          <Space>
            <Tooltip title={tournamentNotes[record.id]?.note || ''}>
              <span style={{ fontWeight: 'bold' }}>{text}</span>
            </Tooltip>
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
      title: 'Status / Prize',
      key: 'statusPrize',
      render: (_: any, record: any) => {
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

            <span
              style={{
                fontSize: '12px',
                marginTop: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <TrophyOutlined style={{ color: '#faad14' }} />
              Prize:{' '}
              <strong>${record.totalPrize?.toLocaleString() || 0}</strong>
            </span>
            <span
              style={{
                fontSize: '12px',
                marginTop: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <DollarOutlined style={{ color: '#52c41a' }} />
              Entry:{' '}
              <strong>
                ${record.entryFee && record.entryFee.toLocaleString()}
              </strong>
            </span>
          </div>
        );
      },
      width: 180,
    },
    {
      title: 'Approval',
      dataIndex: 'isAccept',
      key: 'isAccept',
      render: (isAccept: boolean, record) => {
        const endDatePassed = new Date(record.endDate) < new Date();

        if (record.status === 'Completed') {
          return (
            <div>
              <Tag color="success">Completed</Tag>
              {tournamentNotes[record.id] && (
                <Button 
                  type="link" 
                  size="small" 
                  icon={<MessageOutlined />} 
                  onClick={() => openViewNoteModal(record)}
                >
                  View Note
                </Button>
              )}
            </div>
          );
        }
        
        if (endDatePassed) {
          return (
            <div>
              <Tag color="default">Expired</Tag>
              {tournamentNotes[record.id] && (
                <Button 
                  type="link" 
                  size="small" 
                  icon={<MessageOutlined />} 
                  onClick={() => openViewNoteModal(record)}
                >
                  View Note
                </Button>
              )}
            </div>
          );
        }
        
        if (isAccept) {
          return (
            <div>
              <Tag color="success">Approved</Tag>
              {tournamentNotes[record.id] && (
                <Button 
                  type="link" 
                  size="small" 
                  icon={<MessageOutlined />} 
                  onClick={() => openViewNoteModal(record)}
                >
                  View Note
                </Button>
              )}
            </div>
          );
        }
        
        if (record.status === 'Disable') {
          return (
            <div>
              <Tag color="error">Rejected</Tag>
              {tournamentNotes[record.id] && (
                <Button 
                  type="link" 
                  size="small" 
                  icon={<MessageOutlined />} 
                  onClick={() => openViewNoteModal(record)}
                >
                  View Note
                </Button>
              )}
            </div>
          );
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Button
              type="primary"
              onClick={() => openNoteModal(record, 'accept')}
              style={{ width: '100%', marginBottom: 4 }}
              size="small"
            >
              Approve
            </Button>
            <Button
              danger
              onClick={() => openNoteModal(record, 'reject')}
              style={{ width: '100%' }}
              size="small"
            >
              Reject
            </Button>
          </div>
        );
      },
      width: 140,
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


      <Card title="Tournament List" className="table-card">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="filter-tabs"
        >
          <TabPane tab="All Tournaments" key="all" />
          <TabPane tab={`Pending (${pendingTournaments})`} key="pending" />
          <TabPane
            tab={`Scheduled (${scheduledTournaments})`}
            key="scheduled"
          />
          <TabPane tab={`Ongoing (${ongoingTournaments})`} key="ongoing" />
          <TabPane
            tab={`Completed (${completedTournaments})`}
            key="completed"
          />
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
      height: auto;
      min-height: 340px;
    }
          
       .chart-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
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
      <Modal
        title={noteType === 'accept' ? 'Approve Tournament' : 'Reject Tournament'}
        open={modalOpen}
        onOk={handleSubmitNote}
        onCancel={() => setModalOpen(false)}
        okText={noteType === 'accept' ? 'Approve' : 'Reject'}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="note"
            label="Note"
            rules={[{ required: true, message: 'Please input your note' }]}
          >
            <Input.TextArea rows={4} placeholder="Write your note here..." />
          </Form.Item>
        </Form>
      </Modal>

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
    </div>
  );
};

export default OverviewPage;
