import {
  SearchOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  UserOutlined,
  ClockCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { Pie } from '@ant-design/plots';
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
} from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { useRef, useState, useMemo, useEffect } from 'react';
import { RegistrationDetail, TouramentregistrationStatus } from '../../../modules/Tournaments/models';
import { useApprovalPlayerTournament } from '../../../modules/Tournaments/hooks/useApprovalPlayerTournament';

const { Text, Title } = Typography;

type DataIndex = string;

type PlayersTableProps = {
  tournamentId: number;
  tournamentName?: string; // Optional tournament name for display
  registrations: RegistrationDetail[];
  refetch: () => void;
};

// Define status color and label mappings
const statusColors = {
  [TouramentregistrationStatus.Pending]: 'orange',
  [TouramentregistrationStatus.Approved]: 'green',
  [TouramentregistrationStatus.Rejected]: 'red',
  [TouramentregistrationStatus.Waiting]: 'blue',
  [TouramentregistrationStatus.Eliminated]: 'black',
  [TouramentregistrationStatus.Request]: 'purple',
  [TouramentregistrationStatus.Winner]: 'gold',
};

const statusLabels = {
  [TouramentregistrationStatus.Pending]: 'Pending',
  [TouramentregistrationStatus.Approved]: 'Approved',
  [TouramentregistrationStatus.Rejected]: 'Rejected',
  [TouramentregistrationStatus.Waiting]: 'Waiting',
  [TouramentregistrationStatus.Eliminated]: 'Eliminated',
  [TouramentregistrationStatus.Request]: 'Request',
  [TouramentregistrationStatus.Winner]: 'Winner',
};

// Vietnamese descriptions for tooltips
const statusDescriptions = {
  [TouramentregistrationStatus.Pending]: 'Accepted from partner for payment',
  [TouramentregistrationStatus.Approved]: 'Payment completed',
  [TouramentregistrationStatus.Rejected]: 'Not approved to participate in tournament',
  [TouramentregistrationStatus.Waiting]: 'Waiting for partner acceptance',
  [TouramentregistrationStatus.Eliminated]: 'Eliminated',
  [TouramentregistrationStatus.Request]: 'Received invitation to participate',
  [TouramentregistrationStatus.Winner]: 'Tournament winner',
};

const PlayersTable = ({ tournamentId, tournamentName, registrations = [], refetch }: PlayersTableProps) => {
  const [, setSearchText] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState<string>('');
  const searchInput = useRef<InputRef>(null);
  const [filteredRegistrations, setFilteredRegistrations] = useState<RegistrationDetail[]>(registrations);

  const { mutate: approvePlayer } = useApprovalPlayerTournament();

  // Handle player status changes
  const handleStatusChange = (
    playerId: number, 
    partnerId: number | undefined,
    status: TouramentregistrationStatus
  ) => {
    approvePlayer(
      { 
        tournamentId, // Use the prop tournamentId consistently
        playerId,
        partnerId,
        isApproved: status 
      },
      {
        onSuccess: () => {
          refetch();
          message.success(`Player status updated to ${statusLabels[status]}`);
        },
        onError: (error) => {
          message.error(`Error updating player status: ${error.message}`);
        },
      }
    );
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

  const columns: ColumnsType<any> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      ...getColumnSearchProps('id'),
    },
    {
      title: 'Player',
      dataIndex: ['playerDetails', 'firstName'],
      key: 'firstName',
      ...getColumnSearchProps('firstName'),
      render: (_: string, record: RegistrationDetail) => (
        <span>
          {record?.playerDetails?.firstName} {record?.playerDetails?.lastName}
        </span>
      ),
    },
    {
      title: 'Email',
      dataIndex: ['playerDetails', 'email'],
      key: 'email',
      ...getColumnSearchProps('email'),
    },
    {
      title: 'Partner',
      dataIndex: ['partnerDetails', 'firstName'],
      key: 'partnerFirstName',
      render: (_: string, record: RegistrationDetail) => (
        <span>
          {record.partnerDetails?.firstName} {record.partnerDetails?.lastName}
        </span>
      ),
        },
        {
      title: 'Partner Email',
      dataIndex: ['partnerDetails', 'email'],
      key: 'partnerEmail',
        },
        {
      title: 'Registered At',
      dataIndex: 'registeredAt',
      key: 'registeredAt',
      render: (registeredAt: string) => new Date(registeredAt).toLocaleString(),
        },
        {
      title: 'Status',
      dataIndex: 'isApproved', // Changed from status to isApproved
      key: 'isApproved',
      filters: Object.entries(statusLabels).map(([value, text]) => ({
        text,
        value: Number(value),
      })),
      onFilter: (value, record) => record.isApproved === value,
      render: (isApproved: TouramentregistrationStatus) => (
        <Tooltip title={statusDescriptions[isApproved]}>
          <Tag color={statusColors[isApproved] || 'default'}>
        {statusLabels[isApproved] || 'Unknown'}
          </Tag>
        </Tooltip>
      ),
        },
        
  ];

  // Calculate registration stats for display
  const statusCounts = useMemo(() => {
    const counts = {
      total: filteredRegistrations.length,
      [TouramentregistrationStatus.Pending]: 0,
      [TouramentregistrationStatus.Approved]: 0,
      [TouramentregistrationStatus.Rejected]: 0,
      [TouramentregistrationStatus.Waiting]: 0,
      [TouramentregistrationStatus.Eliminated]: 0,
      [TouramentregistrationStatus.Request]: 0,
      [TouramentregistrationStatus.Winner]: 0,
    };

    filteredRegistrations.forEach(registration => {
      const status: TouramentregistrationStatus = registration.status || TouramentregistrationStatus.Pending;
      counts[status] = (counts[status] || 0) + 1;
    });

    return counts;
  }, [filteredRegistrations]);

  // Prepare data for pie chart
  const chartData = useMemo(() => {
    return Object.entries(statusLabels).map(([status, label]) => ({
      type: label,
      value: statusCounts[Number(status) as TouramentregistrationStatus] || 0
    })).filter(item => item.value > 0); // Only show statuses that have at least one player
  }, [statusCounts]);

  const pieConfig = {
    appendPadding: 10,
    data: chartData,
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    innerRadius: 0.6,
    label: {
      type: 'inner',
      offset: '-50%',
      content: '{value}',
      style: {
        textAlign: 'center',
        fontSize: 14,
      },
    },
    interactions: [{ type: 'element-active' }],
    height: 200,
    width: 300,
    legend: {
      position: 'bottom' as 'bottom'
    }
  };

  return (
    <div>
      {tournamentName && (
        <Title level={4} style={{ marginBottom: 16 }}>
          Player Registrations for: {tournamentName}
        </Title>
      )}
      
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={10}>
          <Card title="Registration Statistics" bordered={false}>
            <Pie {...pieConfig} />
          </Card>
        </Col>
        <Col span={14}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Card 
                title="Total Players" 
                bordered={false}
                headStyle={{ backgroundColor: '#e6f7ff' }}
              >
                <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                <Text style={{ fontSize: 24, marginLeft: 8 }}>{statusCounts.total}</Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card 
                title="Approved Players" 
                bordered={false}
                headStyle={{ backgroundColor: '#f6ffed' }}
              >
                <UserAddOutlined style={{ fontSize: 24, color: statusColors[TouramentregistrationStatus.Approved] }} />
                <Text style={{ fontSize: 24, marginLeft: 8 }}>
                  {statusCounts[TouramentregistrationStatus.Approved]}
                </Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card 
                title="Pending Players" 
                bordered={false}
                headStyle={{ backgroundColor: '#fff7e6' }}
              >
                <ClockCircleOutlined style={{ fontSize: 24, color: statusColors[TouramentregistrationStatus.Pending] }} />
                <Text style={{ fontSize: 24, marginLeft: 8 }}>
                  {statusCounts[TouramentregistrationStatus.Pending]}
                </Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card 
                title="Waiting Players" 
                bordered={false}
                headStyle={{ backgroundColor: '#e6f7ff' }}
              >
                <ClockCircleOutlined style={{ fontSize: 24, color: statusColors[TouramentregistrationStatus.Waiting] }} />
                <Text style={{ fontSize: 24, marginLeft: 8 }}>
                  {statusCounts[TouramentregistrationStatus.Waiting]}
                </Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card 
                title="Rejected Players" 
                bordered={false}
                headStyle={{ backgroundColor: '#fff1f0' }}
              >
                <UserDeleteOutlined style={{ fontSize: 24, color: statusColors[TouramentregistrationStatus.Rejected] }} />
                <Text style={{ fontSize: 24, marginLeft: 8 }}>
                  {statusCounts[TouramentregistrationStatus.Rejected]}
                </Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card 
                title="Eliminated Players" 
                bordered={false}
                headStyle={{ backgroundColor: '#f0f0f0' }}
              >
                <StopOutlined style={{ fontSize: 24, color: statusColors[TouramentregistrationStatus.Eliminated] }} />
                <Text style={{ fontSize: 24, marginLeft: 8 }}>
                  {statusCounts[TouramentregistrationStatus.Eliminated]}
                </Text>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filteredRegistrations}
        rowKey="id"
        style={{ backgroundColor: '#ffffff' }}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default PlayersTable;
