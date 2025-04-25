import {
  SearchOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  UserOutlined,
  ClockCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { Input, Button, Table, Tag, Row, Col, Typography, Space, Tooltip } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import type { InputRef } from 'antd';
import { useRef, useState, useMemo, useEffect } from 'react';
import { get } from 'lodash';
import {
  RegistrationDetail,
  TouramentregistrationStatus,
} from '../../../modules/Tournaments/models';
import { useApprovalPlayerTournament } from '../../../modules/Tournaments/hooks/useApprovalPlayerTournament';

const { Title } = Typography;

type DataIndex = string;

type PlayersTableProps = {
  tournamentId: number;
  tournamentName?: string;
  registrations: RegistrationDetail[];
  refetch: () => void;
};

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

const statusDescriptions = {
  [TouramentregistrationStatus.Pending]: 'Accepted by partner for payment',
  [TouramentregistrationStatus.Approved]: 'Payment completed',
  [TouramentregistrationStatus.Rejected]: 'Not allowed to participate in the tournament',
  [TouramentregistrationStatus.Waiting]: 'Waiting for partner acceptance',
  [TouramentregistrationStatus.Eliminated]: 'Eliminated',
  [TouramentregistrationStatus.Request]: 'Received invitation to participate',
  [TouramentregistrationStatus.Winner]: 'Tournament winner',
};

const PlayersTable = ({
  tournamentId,
  tournamentName,
  registrations = [],
  refetch,
}: PlayersTableProps) => {
  const [, setSearchText] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState<string>('');
  const searchInput = useRef<InputRef>(null);
  const [filteredRegistrations, setFilteredRegistrations] =
    useState<RegistrationDetail[]>(registrations);

  useEffect(() => {
    setFilteredRegistrations(registrations || []);
  }, [registrations]);

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

  const getColumnSearchProps = (dataIndex: string | string[]): ColumnType<any> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${typeof dataIndex === 'string' ? dataIndex : dataIndex.join('.')}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex.toString())
          }
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex.toString())
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      get(record, dataIndex)
        ?.toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
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
      ...getColumnSearchProps(['playerDetails', 'firstName']),
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
      ...getColumnSearchProps(['playerDetails', 'email']),
    },
    {
      title: 'Partner',
      dataIndex: ['partnerDetails', 'firstName'],
      key: 'partnerFirstName',
      ...getColumnSearchProps(['partnerDetails', 'firstName']),
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
      ...getColumnSearchProps(['partnerDetails', 'email']),
    },
    {
      title: 'Registered At',
      dataIndex: 'registeredAt',
      key: 'registeredAt',
      render: (registeredAt: string) => new Date(registeredAt).toLocaleString(),
    },
    {
      title: 'Status',
      dataIndex: 'isApproved',
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

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Pending: 0,
      Approved: 0,
      Rejected: 0,
      Waiting: 0,
      Eliminated: 0,
      Request: 0,
      Winner: 0
    };
    filteredRegistrations.forEach((r) => {
      const status = statusLabels[r.isApproved as TouramentregistrationStatus] || 'Unknown';
      if (counts[status] !== undefined) {
        counts[status]++;
      }
    });
    return counts;
  }, [filteredRegistrations]);

  return (
    <div>
      {tournamentName && (
        <Title level={4} style={{ marginBottom: 16 }}>
          Player Registrations for: {tournamentName}
        </Title>
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col>
          <Tag icon={<UserOutlined />} color="#1890ff">
            Total: {filteredRegistrations.length}
          </Tag>
        </Col>
        <Col>
          <Tag icon={<UserAddOutlined />} color={statusColors[TouramentregistrationStatus.Approved]}>
            Approved: {statusCounts.Approved}
          </Tag>
        </Col>
        <Col>
          <Tag icon={<ClockCircleOutlined />} color={statusColors[TouramentregistrationStatus.Pending]}>
            Pending: {statusCounts.Pending}
          </Tag>
        </Col>
        <Col>
          <Tag icon={<UserDeleteOutlined />} color={statusColors[TouramentregistrationStatus.Rejected]}>
            Rejected: {statusCounts.Rejected}
          </Tag>
        </Col>
        <Col>
          <Tag icon={<ClockCircleOutlined />} color={statusColors[TouramentregistrationStatus.Waiting]}>
            Waiting: {statusCounts.Waiting}
          </Tag>
        </Col>
        <Col>
          <Tag icon={<StopOutlined />} color={statusColors[TouramentregistrationStatus.Eliminated]}>
            Eliminated: {statusCounts.Eliminated}
          </Tag>
        </Col>
        <Col>
          <Tag icon={<UserOutlined />} color={statusColors[TouramentregistrationStatus.Request]}>
            Request: {statusCounts.Request}
          </Tag>
        </Col>
        <Col>
          <Tag icon={<UserOutlined />} color={statusColors[TouramentregistrationStatus.Winner]}>
            Winner: {statusCounts.Winner}
          </Tag>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filteredRegistrations}
        rowKey="id"
        style={{ backgroundColor: '#ffffff' }}
        pagination={{
          pageSize: 50,
          showSizeChanger: true,
          pageSizeOptions: ['10', '50', '100'],
          showTotal: (total) => `Total ${total} players`,
        }}
      />
    </div>
  );
};

export default PlayersTable;
