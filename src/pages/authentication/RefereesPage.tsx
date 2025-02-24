import React, { useState, useRef } from 'react';
import {
  Button,
  Input,
  Space,
  Table,
  Tag,
  Typography,
  Row,
  Col,
  Card,
  Form,
  DatePicker,
  Select,
  message,
  Modal,
} from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { useGetAllReferees } from '../../modules/User/hooks/useGetAllReferees';
import { RegisterUserRequest } from '../../modules/User/models';
import { useQueryClient } from '@tanstack/react-query';
import { useRegisterRefereesUser } from '../../modules/User/hooks/useRegisterUser';

const { Text } = Typography;
const { Option } = Select;

type DataIndex = string;

const RefereesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: referees, isLoading, error } = useGetAllReferees();
  const [, setSearchText] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState<string>('');
  const searchInput = useRef<InputRef>(null);
  const { mutate: registerUser } = useRegisterRefereesUser();
  const [isModalVisible, setIsModalVisible] = useState(false);

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
      title: 'Avatar',
      dataIndex: 'avatarUrl',
      key: 'avatarUrl',
      render: (avatarUrl: string) => (
        <img
          src={avatarUrl}
          alt="avatar"
          style={{ width: 50, height: 50, borderRadius: '50%' }}
        />
      ),
    },
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
      render: (dateOfBirth: string) => new Date(dateOfBirth).toLocaleDateString(),
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
      render: (status: boolean) =>
        status ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>,
    },
  ];

  const onFinish = (values: RegisterUserRequest) => {
    registerUser(values, {
      onSuccess: () => {
        message.success('Referee registered successfully');
        setIsModalVisible(false);
        queryClient.invalidateQueries({ queryKey: ['fetchReferees'] });
      },
      onError: () => {
        message.error('Failed to register referee');
      },
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading referees</div>;
  }

  return (
    <div>
      <Row gutter={8} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card title="Total Referees" bordered={false} style={{ height: 150 }}>
            <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            <Text style={{ fontSize: 24, marginLeft: 8 }}>{referees?.length}</Text>
          </Card>
        </Col>
        <Col span={6}>
          <Button type="primary" onClick={() => setIsModalVisible(true)}>
            Register Referee
          </Button>
        </Col>
      </Row>
      <Modal
        title="Register Referee"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="FirstName"
                label="First Name"
                rules={[{ required: true, message: 'Please input the first name!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="LastName"
                label="Last Name"
                rules={[{ required: true, message: 'Please input the last name!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="SecondName"
                label="Second Name"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="Email"
                label="Email"
                rules={[{ required: true, message: 'Please input the email!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="PasswordHash"
                label="Password"
                rules={[{ required: true, message: 'Please input the password!' }]}
              >
                <Input.Password />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="DateOfBirth"
                label="Date of Birth"
                rules={[{ required: true, message: 'Please input the date of birth!' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="Gender"
                label="Gender"
                rules={[{ required: true, message: 'Please select the gender!' }]}
              >
                <Select>
                  <Option value="Male">Male</Option>
                  <Option value="Female">Female</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Register Referee
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Table columns={columns} dataSource={referees} rowKey="id" />
    </div>
  );
};

export default RefereesPage;
