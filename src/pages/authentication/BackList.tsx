import { SearchOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import {
  Button,
  DatePicker,
  Input,
  InputRef,
  Space,
  Table,
  Tag,
  Card,
  Row,
  Col,
  Select,
  message,
} from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import moment from 'moment';
import React, { useRef, useState, useEffect } from 'react';
import { useFetchAllUser } from '../../modules/User/hooks/useFetchAllUser';
import { useUpdateUser } from '../../modules/User/hooks/useUpdateUser';
import { User } from '../../modules/User/models';
import { Pie, Column } from '@ant-design/plots';

// Define UserRole enum
enum UserRole {
  Player = 1,
  Admin = 2,
  Sponsor = 3,
  Referee = 4,
  User = 5,
  Staff = 6,
  AdminClub = 7,
}

// Map role IDs to names for display
const roleNames: Record<number, string> = {
  [UserRole.Player]: 'Player',
  [UserRole.Admin]: 'Admin',
  [UserRole.Sponsor]: 'Sponsor',
  [UserRole.Referee]: 'Referee',
  [UserRole.User]: 'User',
  [UserRole.Staff]: 'Staff',
  [UserRole.AdminClub]: 'Admin Club',
};

// Extend User interface to include roleId
interface ExtendedUser extends Omit<User, 'roleId'> {
  roleId?: UserRole;
}

type DataIndex = keyof ExtendedUser;

const BackList: React.FC = () => {
  const { data: rawData, isLoading, error, refetch } = useFetchAllUser();
  const { mutate: updateUser } = useUpdateUser();
  const [, setSearchText] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState<string>('');
  const searchInput = useRef<InputRef>(null);

  // Process data for charts
  const [usersByRole, setUsersByRole] = useState<any[]>([]);
  const [usersByStatus, setUsersByStatus] = useState<any[]>([]);
  const [data, setData] = useState<ExtendedUser[]>([]);

  useEffect(() => {
    if (rawData) {
      // Mock roleId for demonstration since your actual data might not have it yet
      const extendedData: ExtendedUser[] = rawData.map((user: User) => ({
        ...user,
        roleId: Math.floor(Math.random() * 7) + 1 as UserRole, // Random role for demo
      }));

      setData(extendedData);

      // Prepare chart data for roles
      const roleCountMap: Record<number, number> = {};
      extendedData.forEach((user) => {
        if (user.roleId) {
          roleCountMap[user.roleId] = (roleCountMap[user.roleId] || 0) + 1;
        }
      });
      
      const roleChartData = Object.keys(roleCountMap).map((roleId) => ({
        type: roleNames[Number(roleId)],
        value: roleCountMap[Number(roleId)],
      }));
      setUsersByRole(roleChartData);

      // Prepare chart data for status
      const activeCount = extendedData.filter((user) => user.status).length;
      const inactiveCount = extendedData.length - activeCount;
      setUsersByStatus([
        { type: 'Active', value: activeCount },
        { type: 'Inactive', value: inactiveCount },
      ]);
    }
  }, [rawData]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading users</div>;
  }

  const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<ExtendedUser> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }: FilterDropdownProps) => (
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
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button onClick={close} size="small" style={{ width: 90 }}>
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex] !== undefined
        ? record[dataIndex]!.toString()
            .toLowerCase()
            .includes((value as string).toLowerCase())
        : false,
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

  const handleSearch = (
    selectedKeys: React.Key[],
    confirm: () => void,
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0] as string);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const handleAction = (userId: number, status: boolean) => {
    updateUser(
      { id: userId, data: { status: !status } },
      {
        onSuccess: () => {
          message.success(
            `User ${status ? 'banned' : 'unbanned'} successfully`
          );
          refetch();
        },
        onError: () => {
          message.error(`Failed to ${status ? 'ban' : 'unban'} user`);
        },
      }
    );
  };

  // Configuration for Pie charts
  const pieConfig = {
    appendPadding: 10,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'element-active' }],
  };

  const columns: ColumnsType<ExtendedUser> = [
    {
      title: 'First Name',
      dataIndex: 'firstName',
      key: 'firstName',
      ...getColumnSearchProps('firstName'),
    },
    {
      title: 'Last Name',
      dataIndex: 'lastName',
      key: 'lastName',
      ...getColumnSearchProps('lastName'),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ...getColumnSearchProps('email'),
    },
    {
      title: 'Date of Birth',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      render: (text: string) => moment(text).format('YYYY-MM-DD'),
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
        close,
      }: FilterDropdownProps) => (
        <div style={{ padding: 8 }}>
          <DatePicker
            onChange={(date) =>
              setSelectedKeys(date ? [date.format('YYYY-MM-DD')] : [])
            }
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => handleSearch(selectedKeys, confirm, 'dateOfBirth')}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button
              onClick={() => clearFilters && handleReset(clearFilters)}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
            <Button onClick={close} size="small" style={{ width: 90 }}>
              Close
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        moment(record.dateOfBirth).format('YYYY-MM-DD') === value,
    },
    {
      title: 'Role',
      dataIndex: 'roleId',
      key: 'roleId',
      filters: Object.entries(roleNames).map(([id, name]) => ({
        text: name,
        value: Number(id),
      })),
      onFilter: (value, record) => record.roleId === value,
      render: (roleId: UserRole) => (
        <Tag color="blue">{roleNames[roleId] || 'Unknown'}</Tag>
      ),
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      filters: [
        { text: 'Male', value: 'Male' },
        { text: 'Female', value: 'Female' },
      ],
      onFilter: (value, record) => record.gender === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: boolean) => (
        <Tag color={status ? 'green' : 'red'}>
          {status ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (record: ExtendedUser) => (
        <Button
          type="primary"
          danger={record.status}
          onClick={() => handleAction(record.id, record.status)}
        >
          {record.status ? 'Ban' : 'Unban'}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h2>User Statistics</h2>
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} md={12}>
          <Card title="Users by Role" bordered={false}>
            <Pie {...pieConfig} data={usersByRole} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Users by Status" bordered={false}>
            <Pie {...pieConfig} data={usersByStatus} colorField="type" color={['#52c41a', '#f5222d']} />
          </Card>
        </Col>
      </Row>
      
      <h2>User List</h2>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        style={{ backgroundColor: '#ffffff' }}
      />
    </div>
  );
};

export default BackList;
