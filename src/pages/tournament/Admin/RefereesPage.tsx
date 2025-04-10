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
  Avatar,
  Tooltip,
  Divider,
  Badge,
} from 'antd';
import { SearchOutlined, UserOutlined, PlusOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { useGetRefereeBySponnerId } from '../../../modules/Refee/hooks/useGetRefereeBySponnerId';
import { useRegisterRefereesUser } from '../../../modules/User/hooks/useRegisterUser';
import { useUpdateReferee } from '../../../modules/Refee/hooks/useUpdateRefee';
import { RegisterUserRequest } from '../../../modules/User/models';
import { useGetAllReferees } from '../../../modules/User/hooks/useGetAllReferees';

const { Text, Title } = Typography;
const { Option } = Select;

type DataIndex = string;

const RefereesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.authencation.user);
  const { data: referees, isLoading, error } = useGetAllReferees();
  const [, setSearchText] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState<string>('');
  const searchInput = useRef<InputRef>(null);
  const { mutate: registerUser } = useRegisterRefereesUser();
  const { mutate: updateReferee } = useUpdateReferee();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

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
      title: 'Referee',
      key: 'referee',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
          <Avatar 
            size={48} 
            src={record.user?.avatarUrl} 
            icon={<UserOutlined />}
            style={{ marginRight: 16 }}
          />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
              {record.user?.firstName} {record.user?.lastName}
            </div>
            <div style={{ color: '#888', fontSize: '12px' }}>
              Code: {record.refreeCode}
            </div>
          </div>
        </div>
      ),
      width: 220,
    },
    {
      title: 'Contact Information',
      key: 'contactInfo',
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column', padding: '6px 0' }}>
          <div>
            <MailOutlined style={{ marginRight: 8, color: '#1890ff' }} /> 
            {record.user?.email}
          </div>
          <div style={{ marginTop: 4 }}>
            <PhoneOutlined style={{ marginRight: 8, color: '#52c41a' }} /> 
            {record.user?.phoneNumber || 'N/A'}
          </div>
        </div>
      ),
      width: 220,
    },
    {
      title: 'Personal Details',
      key: 'personalDetails',
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column', padding: '6px 0' }}>
          <div>
            <span style={{ fontWeight: 500 }}>DoB:</span> {' '}
            {record.user?.dateOfBirth ? new Date(record.user.dateOfBirth).toLocaleDateString() : 'N/A'}
          </div>
          <div style={{ marginTop: 4 }}>
            <span style={{ fontWeight: 500 }}>Gender:</span> {' '}
            <Tag color="blue">{record.user?.gender}</Tag>
          </div>
        </div>
      ),
      width: 180,
        },
        {
      title: 'Status',
      key: 'status',
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.isAccept === value,
      render: (_, record) => (
        <div style={{ padding: '6px 0' }}>
          {record.isAccept ? (
        <Badge status="success" text={<Text strong style={{ color: '#52c41a' }}>Active</Text>} />
          ) : (
        <Badge status="error" text={<Text strong style={{ color: '#f5222d' }}>Inactive</Text>} />
          )}
        </div>
      ),
      width: 120,
        },
        {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div style={{ padding: '6px 0' }}>
          <Space>
            {record.isAccept ? (
              <Button 
                danger 
                size="small" 
                onClick={() => handleBan(record)}
              >
                Ban
              </Button>
            ) : (
              <Button 
                type="primary" 
                size="small" 
                onClick={() => handleAccept(record)}
              >
                Accept
              </Button>
            )}
          </Space>
        </div>
      ),
      width: 120,
    },
  ];

  const handleAccept = (record: any) => {
    updateReferee(
      { id: record.refreeId, data: { isAccept: true } },
      {
        onSuccess: () => {
          message.success('Referee accepted successfully');
          queryClient.invalidateQueries({ queryKey: ['GET_REFEREE_BY_SPONNER_ID', user?.id.toString()] });
        },
        onError: () => {
          message.error('Failed to accept referee');
        },
      }
    );
  };

  const handleBan = (record: any) => {
    updateReferee(
      { id: record.refreeId, data: { isAccept: false } },
      {
        onSuccess: () => {
          message.success('Referee banned successfully');
          queryClient.invalidateQueries({ queryKey: ['GET_REFEREE_BY_SPONNER_ID', user?.id.toString()] });
        },
        onError: () => {
          message.error('Failed to ban referee');
        },
      }
    );
  };

  const onFinish = (values: RegisterUserRequest) => {
    registerUser({ ...values, refereeCode: `${user?.id}` }, {
      onSuccess: () => {
        message.success('Referee registered successfully');
        setIsModalVisible(false);
        form.resetFields();
        queryClient.invalidateQueries({ queryKey: ['GET_REFEREE_BY_SPONNER_ID', user?.id.toString()] });
      },
      onError: () => {
        message.error('Failed to register referee');
      },
    });
  };

  if (isLoading) {
    return (
      <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
        <Typography.Title level={4}>Loading referees data...</Typography.Title>
      </div>
    );
  }

  if (error) {
    console.log(error);
    
    return (
      <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
        <Typography.Title level={4} type="danger">Error loading referees data</Typography.Title>
      </div>
    );
  }

  const activeReferees = referees?.filter(ref => ref.user?.status === true)?.length || 0;
  const inactiveReferees = (referees?.length || 0) - activeReferees;

  return (
    <div style={{ padding: '24px', backgroundColor: '#f0f2f5' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Referees Management</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          size="large"
        >
          Register New Referee
        </Button>
      </div>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card bordered={false} style={{ height: 120, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Text type="secondary">Total Referees</Text>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                <UserOutlined style={{ fontSize: 32, color: '#1890ff', marginRight: 16 }} />
                <Text style={{ fontSize: 32, fontWeight: 'bold' }}>
                  {referees?.length || 0}
                </Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ height: 120, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Text type="secondary">Active Referees</Text>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                <UserOutlined style={{ fontSize: 32, color: '#52c41a', marginRight: 16 }} />
                <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#52c41a' }}>
                  {activeReferees}
                </Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ height: 120, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Text type="secondary">Inactive Referees</Text>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                <UserOutlined style={{ fontSize: 32, color: '#f5222d', marginRight: 16 }} />
                <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#f5222d' }}>
                  {inactiveReferees}
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button
            type="primary"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['GET_ALL_REFEREES'] })}
            icon={<SearchOutlined />}
          >
            Refresh Data
          </Button>
        </Space>
        
        <Typography.Text type="secondary">
          Showing {referees?.length || 0} referees
        </Typography.Text>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={Array.isArray(referees) ? referees : []} 
        rowKey="refreeId" 
        style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '8px',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
        }}
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} referees`
        }}
        size="middle"
      />
      
      <Modal
        title="Register New Referee"
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ refereeCode: user?.id }}>
          <Divider orientation="left">Personal Information</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="FirstName"
                label="First Name"
                rules={[
                  { required: true, message: 'Please input the first name!' },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="LastName"
                label="Last Name"
                rules={[
                  { required: true, message: 'Please input the last name!' },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="SecondName" label="Second Name">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="Gender"
                label="Gender"
                rules={[
                  { required: true, message: 'Please select the gender!' },
                ]}
              >
                <Select>
                  <Option value="Male">Male</Option>
                  <Option value="Female">Female</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="DateOfBirth"
                label="Date of Birth"
                rules={[
                  {
                    required: true,
                    message: 'Please input the date of birth!',
                  },
                ]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="PhoneNumber"
                label="Phone Number"
                rules={[
                  { required: true, message: 'Please input the phone number!' },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider orientation="left">Account Information</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="Email"
                label="Email"
                rules={[{ required: true, message: 'Please input the email!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="Password"
                label="Password"
                rules={[
                  { required: true, message: 'Please input the password!' },
                ]}
              >
                <Input.Password />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="refereeCode" label="Referee Code">
            <Input value={user?.id} disabled />
          </Form.Item>
          
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Space>
                <Button onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  Register Referee
                </Button>
              </Space>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RefereesPage;
