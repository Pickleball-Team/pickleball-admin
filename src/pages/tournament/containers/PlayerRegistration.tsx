import {
  SearchOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  UserOutlined,
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
} from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { useRef, useState } from 'react';
import { RegistrationDetail } from '../../../modules/Tournaments/models';
import { useApprovalPlayerTournament } from '../../../modules/Tournaments/hooks/useApprovalPlayerTournament';

const { Text } = Typography;

type DataIndex = string;

type PlayersTableProps = {
  registrations: RegistrationDetail[];
  refetch: () => void;
};

const PlayersTable = ({ registrations = [], refetch }: PlayersTableProps) => {
  const [, setSearchText] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState<string>('');
  const searchInput = useRef<InputRef>(null);

  const { mutate: approvePlayer, status } = useApprovalPlayerTournament();

  const onAccept = (id: number) => {
    approvePlayer(
      { id, isApproved: true },
      {
        onSuccess: () => {
          refetch();
          message.success('Player approved successfully');
        },
        onError: (error) => {
          message.error(`Error approving player: ${error.message}`);
        },
      }
    );
  };

  const onReject = (id: number) => {
    approvePlayer(
      { id, isApproved: false },
      {
        onSuccess: () => {
          refetch();
          message.success('Player rejected successfully');
        },
        onError: (error) => {
          message.error(`Error rejecting player: ${error.message}`);
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
      ...getColumnSearchProps('id'),
    },
    {
      title: 'Player',
      dataIndex: ['playerDetails', 'firstName'],
      key: 'firstName',
      ...getColumnSearchProps('firstName'),
      render: (_: string, record: RegistrationDetail) => (
        <span>
          {record.playerDetails?.firstName} {record.playerDetails?.lastName}
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
      title: 'Is Approved',
      dataIndex: 'isApproved',
      key: 'isApproved',
      filters: [
        { text: 'Approved', value: true },
        { text: 'Not Approved', value: false },
      ],
      onFilter: (value, record) => record.isApproved === value,
      render: (isApproved: boolean) =>
        isApproved ? (
          <Tag color="green">Approved</Tag>
        ) : (
          <Tag color="red">Not Approved</Tag>
        ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => onAccept(record.id)}>
            Accept
          </Button>
          <Button danger onClick={() => onReject(record.id)}>
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  const totalPlayers = registrations?.length || 0;
  const approvedPlayers = registrations.filter((r) => r.isApproved).length;
  const notApprovedPlayers = totalPlayers - approvedPlayers;

  const data = [
    {
      type: 'Approved',
      value: approvedPlayers,
    },
    {
      type: 'Not Approved',
      value: notApprovedPlayers,
    },
  ];

  const config = {
    appendPadding: 10,
    data,
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
    interactions: [
      {
        type: 'element-active',
      },
    ],
    height: 150,
    width: 250,
  };

  return (
    <div>
      <Row gutter={8} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Pie {...config} />
        </Col>
        <Col span={6}>
          <Card title="Total Players" bordered={false} style={{ height: 150 }}>
            <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            <Text style={{ fontSize: 24, marginLeft: 8 }}>{totalPlayers}</Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            title="Approved Players"
            bordered={false}
            style={{ height: 150 }}
          >
            <UserAddOutlined style={{ fontSize: 24, color: '#52c41a' }} />
            <Text style={{ fontSize: 24, marginLeft: 8 }}>
              {approvedPlayers}
            </Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            title="Not Approved Players"
            bordered={false}
            style={{ height: 150 }}
          >
            <UserDeleteOutlined style={{ fontSize: 24, color: '#f5222d' }} />
            <Text style={{ fontSize: 24, marginLeft: 8 }}>
              {notApprovedPlayers}
            </Text>
          </Card>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={registrations}
        rowKey="id"
        style={{ backgroundColor: '#ffffff' }}
      />
    </div>
  );
};

export default PlayersTable;
