import { SearchOutlined, CalendarOutlined } from '@ant-design/icons';
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
  Select,
  Typography,
  Badge,
  Tooltip,
} from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetAllTournaments } from '../../../modules/Tournaments/hooks/useGetAllTournaments';
import { useUpdateTournament } from '../../../modules/Tournaments/hooks/useUpdateTournamen';
import { Pie } from '@ant-design/charts';

const { Option } = Select;
const { Title } = Typography;

type DataIndex = string;

export const OverviewPage = () => {
  const { data, isLoading, refetch } = useGetAllTournaments();
  const { mutate: updateTournament } = useUpdateTournament();
  const [searchText, setSearchText] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState<string>('');
  const searchInput = useRef<InputRef>(null);

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
            console.log(`Accepted tournament with id: ${id}`);
            refetch();
          },
          onError: (error) => {
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
            console.log(`Rejected tournament with id: ${id}`);
            refetch();
          },
          onError: (error) => {
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
            {isDatePassed(record.endDate) && (
              <Tag color="red" style={{ marginLeft: 8 }}>
                Expired
              </Tag>
            )}
          </div>
        </div>
      ),
      width: 220,
    },
    {
      title: 'Type / Players',
      key: 'typeAndPlayers',
      render: (_, record) => (
        <div
          style={{ display: 'flex', flexDirection: 'column', padding: '6px 0' }}
        >
          <Tag color="processing">{record.type}</Tag>
          <span style={{ fontSize: '12px', marginTop: 4 }}>
            Max: <strong>{record.maxPlayer}</strong> players
          </span>
        </div>
      ),
      filters: [
        { text: 'Singles', value: 'Singles' },
        { text: 'Doubles', value: 'Doubles' },
      ],
      onFilter: (value, record) => record.type.indexOf(value as string) === 0,
      width: 140,
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
      render: (isAccept: boolean, record) => {
        // Check if end date has passed
        const endDatePassed = isDatePassed(record.endDate);

        if (endDatePassed) {
          return (
            <Tooltip title="Tournament has ended">
              <Tag color="gray">Expired</Tag>
            </Tooltip>
          );
        }

        return isAccept ? (
          <>
            <Tag color="success">Approved</Tag>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
             <Button
              type="primary"
              onClick={() => handleAccept(record.id)}
              style={{ width: '100%',marginBottom: 2 }}
            >
              Accept
            </Button>
            <Button
              danger
              onClick={() => handleReject(record.id)}
              style={{ width: '100%', marginBottom: 2 }}
            >
              Reject
            </Button>
            <br/>
           
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
          <Button type="link" style={{ padding: '4px 0' }}>
            <Link to={`/tournament/admin/${record.id}`}>Details</Link>
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
  const singlesTournaments =
    data?.filter((t) => t.type === 'Singles').length || 0;
  const doublesTournaments =
    data?.filter((t) => t.type === 'Doubles').length || 0;

  const tournamentTypeData = [
    { type: 'Singles', value: singlesTournaments },
    { type: 'Doubles', value: doublesTournaments },
  ];

  const tournamentStatusData = [
    { status: 'Pending', value: pendingTournaments },
    { status: 'Ongoing', value: ongoingTournaments },
    { status: 'Completed', value: completedTournaments },
    { status: 'Disable', value: disabledTournaments },
  ];

  const pieConfig = (data: any[], angleField: string, colorField: string) => ({
    appendPadding: 10,
    data,
    angleField,
    colorField,
    radius: 1,
    innerRadius: 0.6,
    width: 170,
    height: 170,
    label: {
      type: 'inner',
      offset: '-50%',
      content: (data: any) => `${(data.percent * 100).toFixed(0)}%`,
      style: {
        fontSize: 14,
        textAlign: 'center',
      },
    },
    interactions: [{ type: 'element-active' }],
  });

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
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Row gutter={16}>
            <Col span={12}>
              <Card
                title="Total Tournaments"
                bordered={false}
                style={{ backgroundColor: '#ffffff' }}
              >
                {totalTournaments}
              </Card>
            </Col>
            <Col span={12}>
              <Card
                title="Active Tournaments"
                bordered={false}
                style={{ backgroundColor: '#ffffff' }}
              >
                {ongoingTournaments}
              </Card>
            </Col>
          </Row>
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={12}>
              <Card
                title="Singles Tournaments"
                bordered={false}
                style={{ backgroundColor: '#ffffff' }}
              >
                {singlesTournaments}
              </Card>
            </Col>
            <Col span={12}>
              <Card
                title="Doubles Tournaments"
                bordered={false}
                style={{ backgroundColor: '#ffffff' }}
              >
                {doublesTournaments}
              </Card>
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Row gutter={16}>
            <Col span={12}>
              <Card
                title="Tournament Types"
                bordered={false}
                style={{ backgroundColor: '#ffffff' }}
              >
                <Pie {...pieConfig(tournamentTypeData, 'value', 'type')} />
              </Card>
            </Col>
            <Col span={12}>
              <Card
                title="Tournament Status"
                bordered={false}
                style={{ backgroundColor: '#ffffff' }}
              >
                <Pie {...pieConfig(tournamentStatusData, 'value', 'status')} />
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

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
    </div>
  );
};

export default OverviewPage;
