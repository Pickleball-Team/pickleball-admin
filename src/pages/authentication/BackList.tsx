import { SearchOutlined } from '@ant-design/icons';
import { Button, DatePicker, Input, InputRef, Space, Table, Tag } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import moment from 'moment';
import React, { useRef, useState } from 'react';
import { useFetchAllUser } from '../../modules/User/hooks/useFetchAllUser';
import { User } from '../../modules/User/models';

type DataIndex = keyof User;

const BackList: React.FC = () => {
  const { data, isLoading, error } = useFetchAllUser();
  const [searchText, setSearchText] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState<string>('');
  const searchInput = useRef<InputRef>(null);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading users</div>;
  }

  const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<User> => ({
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
      record[dataIndex]
        ? record[dataIndex]
            .toString()
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
    // Implement the action to ban or unban the user here
    console.log(`User ID: ${userId}, Status: ${status ? 'Ban' : 'Unban'}`);
  };

  const columns: ColumnsType<User> = [
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
      render: (text: string, record: User) => (
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
      <Table columns={columns} dataSource={data} rowKey="id" />
    </div>
  );
};

export default BackList;
