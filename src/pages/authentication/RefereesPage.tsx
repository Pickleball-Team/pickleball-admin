import { Pie } from '@ant-design/charts';
import {
  EditOutlined,
  ManOutlined,
  PercentageOutlined,
  PlusCircleFilled,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
  WomanOutlined
} from '@ant-design/icons';
import type { InputRef } from 'antd';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import React, { useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useRegisterRefereesUser } from '../../modules/User/hooks/useRegisterUser';
import { RegisterUserRequest } from '../../modules/User/models';

import { useSelector } from 'react-redux';
import { useGetRefereeBySponnerId } from '../../modules/Refee/hooks/useGetRefereeBySponnerId';
import { useUpdateReferee } from '../../modules/Refee/hooks/useUpdateRefee';
import { RefereeResponse } from '../../modules/Refee/models';
import { RootState } from '../../redux/store';

const { Text, Title } = Typography;
const { Option } = Select;

type DataIndex = string;

const COLORS = ['#52c41a', '#ff4d4f', '#1890ff', '#faad14', '#722ed1', '#13c2c2'];

interface EditRefereeFormData {
  refreeLevel: string | null;
  refreeNote: string | null;
}

const RefereesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.authencation.user);
  const { data: referees, isLoading, error, refetch } = useGetRefereeBySponnerId(user?.id.toString() || '');
  const [, setSearchText] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const searchInput = useRef<InputRef>(null);
  const { mutate: registerUser } = useRegisterRefereesUser();
  const { mutate: updateReferee } = useUpdateReferee();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentReferee, setCurrentReferee] = useState<RefereeResponse | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const maleCount = referees?.filter(referee => referee.user.gender === 'Male')?.length || 0;
  const femaleCount = referees?.filter(referee => referee.user.gender === 'Female')?.length || 0;
  const totalCount = referees?.length || 0;

  const acceptedCount = referees?.filter(referee => referee.isAccept)?.length || 0;
  const pendingCount = referees?.filter(referee => !referee.isAccept)?.length || 0;
  const acceptanceRate = totalCount > 0 ? Math.round((acceptedCount / totalCount) * 100) : 0;

  const acceptedMaleCount = referees?.filter(referee => referee.isAccept && referee.user.gender === 'Male')?.length || 0;
  const acceptedFemaleCount = referees?.filter(referee => referee.isAccept && referee.user.gender === 'Female')?.length || 0;
  const pendingMaleCount = referees?.filter(referee => !referee.isAccept && referee.user.gender === 'Male')?.length || 0;
  const pendingFemaleCount = referees?.filter(referee => !referee.isAccept && referee.user.gender === 'Female')?.length || 0;

  const activeInactiveData = [
    { type: 'Active', value: referees?.filter(referee => referee.user.status)?.length || 0 },
    { type: 'Inactive', value: referees?.filter(referee => !referee.user.status)?.length || 0 }
  ];

  const acceptedPendingData = [
    { type: 'Accepted', value: acceptedCount },
    { type: 'Pending', value: pendingCount }
  ];

  const genderData = [
    { type: 'Male', value: maleCount },
    { type: 'Female', value: femaleCount }
  ];

  const detailedBarData = [
    { category: 'Male', type: 'Accepted', value: acceptedMaleCount },
    { category: 'Male', type: 'Pending', value: pendingMaleCount },
    { category: 'Female', type: 'Accepted', value: acceptedFemaleCount },
    { category: 'Female', type: 'Pending', value: pendingFemaleCount },
  ];

  const statusPieConfig = {
    appendPadding: 10,
    data: acceptedPendingData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    color: (datum: any) => {
      if (datum.type === 'Accepted') return COLORS[0];
      return COLORS[1];
    },
    interactions: [{ type: 'element-active' }],
    legend: {
      position: 'bottom' as 'bottom',
    },
  };

  const approvalPieConfig = {
    appendPadding: 10,
    data: acceptedPendingData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    color: (datum: any) => {
      if (datum.type === 'Accepted') return COLORS[2];
      return COLORS[3];
    },
    interactions: [{ type: 'element-active' }],
    legend: {
      position: 'bottom' as 'bottom',
    },
  };

  const genderPieConfig = {
    appendPadding: 10,
    data: genderData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    color: (datum: any) => {
      if (datum.type === 'Male') return COLORS[4];
      return COLORS[5];
    },
    interactions: [{ type: 'element-active' }],
    legend: {
      position: 'bottom' as 'bottom',
    },
  };

  const genderApprovalConfig = {
    data: detailedBarData,
    isGroup: true,
    xField: 'category',
    yField: 'value',
    seriesField: 'type',
    color: [COLORS[2], COLORS[3]],
    label: {
      position: 'middle' as const,
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    legend: {
      position: 'top' as 'top',
    },
    xAxis: {
      title: { text: 'Gender' },
    },
    yAxis: {
      title: { text: 'Number of Referees' },
    },
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
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

  const handleEdit = (record: RefereeResponse) => {
    setCurrentReferee(record);
    editForm.setFieldsValue({
      refreeLevel: record.refreeLevel || '',
      refreeNote: record.refreeNote || '',
    });
    setIsEditModalVisible(true);
  };

  const handleEditSubmit = (values: EditRefereeFormData) => {
    if (!currentReferee) return;
    
    updateReferee(
      { 
        id: currentReferee.refreeId, 
        data: { 
          refreeLevel: values.refreeLevel || undefined,
          refreeNote: values.refreeNote || undefined,
          isAccept: currentReferee.isAccept 
        } 
      },
      {
        onSuccess: () => {
          message.success('Referee updated successfully');
          setIsEditModalVisible(false);
          queryClient.invalidateQueries({ queryKey: ['GET_REFEREE_BY_SPONNER_ID', user?.id.toString()] });
          refetch();
        },
        onError: () => {
          message.error('Failed to update referee');
        },
      }
    );
  };

  const handleAccept = (record: RefereeResponse) => {
    updateReferee(
      { id: record.refreeId, data: { isAccept: true } },
      {
        onSuccess: () => {
          message.success('Referee accepted successfully');
          queryClient.invalidateQueries({ queryKey: ['GET_REFEREE_BY_SPONNER_ID', user?.id.toString()] });
          refetch();
        },
        onError: () => {
          message.error('Failed to accept referee');
        },
      }
    );
  };

  const handleBan = (record: RefereeResponse) => {
    updateReferee(
      { id: record.refreeId, data: { isAccept: false } },
      {
        onSuccess: () => {
          message.success('Referee banned successfully');
          queryClient.invalidateQueries({ queryKey: ['GET_REFEREE_BY_SPONNER_ID', user?.id.toString()] });
          refetch();
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

  const columns: ColumnsType<RefereeResponse> = [
    {
      title: 'Avatar',
      dataIndex: ['user', 'avatarUrl'],
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
      dataIndex: ['user', 'firstName'],
      key: 'firstName',
      ...getColumnSearchProps('firstName'),
    },
    {
      title: 'Last Name',
      dataIndex: ['user', 'lastName'],
      key: 'lastName',
      ...getColumnSearchProps('lastName'),
    },
    {
      title: 'Email',
      dataIndex: ['user', 'email'],
      key: 'email',
      ...getColumnSearchProps('email'),
    },
    {
      title: 'Date of Birth',
      dataIndex: ['user', 'dateOfBirth'],
      key: 'dateOfBirth',
      render: (dateOfBirth: string) =>
        new Date(dateOfBirth).toLocaleDateString(),
    },
    {
      title: 'Gender',
      dataIndex: ['user', 'gender'],
      key: 'gender',
      filters: [
        { text: 'Male', value: 'Male' },
        { text: 'Female', value: 'Female' },
      ],
      onFilter: (value, record) => record.user.gender === value,
    },
    {
      title: 'Phone Number',
      dataIndex: ['user', 'phoneNumber'],
      key: 'phoneNumber',
      ...getColumnSearchProps('phoneNumber'),
    },
    {
      title: 'Status',
      dataIndex: 'isAccept',
      key: 'isAccept',
      filters: [
        { text: 'Accepted', value: true },
        { text: 'Banned', value: false },
      ],
      onFilter: (value, record) => record.isAccept === value,
      render: (isAccept: boolean) =>
        isAccept ? (
          <Tag color="green">Accepted</Tag>
        ) : (
          <Tag color="red">Banned</Tag>
        ),
    },
    {
      title: 'Referee Code',
      dataIndex: 'refreeCode',
      key: 'refreeCode',
    },
    {
      title: 'Level',
      dataIndex: 'refreeLevel',
      key: 'refreeLevel',
      render: (level: string | null) => level || 'Not set',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record: RefereeResponse) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            style={{ backgroundColor: '#1890ff' }}
          >
            Edit
          </Button>
          {record.isAccept ? (
            <Button type="primary" danger onClick={() => handleBan(record)}>
              Ban
            </Button>
          ) : (
            <Button 
              type="primary" 
              onClick={() => handleAccept(record)}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Accept
            </Button>
          )}
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    console.log(error);
    return <div>Error loading referees</div>;
  }

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={2}>Referee Management</Title>
        </Col>
        <Col>
          <Space>
            <Button 
              type="primary"
              icon={<ReloadOutlined spin={refreshing} />}
              onClick={handleRefresh}
              loading={refreshing}
            >
              Refresh
            </Button>
            <Button 
              type="primary" 
              icon={<PlusCircleFilled />}
              onClick={() => setIsModalVisible(true)}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              size="large"
            >
              Register New Referee
            </Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card 
            title={
              <div>
                <TeamOutlined style={{ marginRight: 8 }} />
                Total Referees
              </div>
            } 
            bordered={false} 
            style={{ height: '100%', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)' }}
          >
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <Text style={{ fontSize: 64, color: '#1890ff', fontWeight: 'bold', display: 'block' }}>
                {totalCount}
              </Text>
              <div style={{ margin: '15px 0' }}>
                <Tag color="#722ed1" style={{ margin: '5px', fontSize: '14px', padding: '4px 8px' }}>
                  <ManOutlined /> {maleCount} Male
                </Tag>
                <Tag color="#13c2c2" style={{ margin: '5px', fontSize: '14px', padding: '4px 8px' }}>
                  <WomanOutlined /> {femaleCount} Female
                </Tag>
              </div>
              <div style={{ marginTop: '10px', backgroundColor: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                <Row align="middle" justify="space-between">
                  <Col>
                    <Text type="secondary">Acceptance Rate:</Text>
                  </Col>
                  <Col>
                    <Text strong style={{ color: acceptanceRate > 50 ? '#52c41a' : '#faad14' }}>{acceptanceRate}%</Text>
                  </Col>
                </Row>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <Button type="link" icon={<SearchOutlined />}>
                View All Details
              </Button>
            </div>
          </Card>
        </Col>

        <Col span={6}>
          <Card 
            title={
              <div>
                <PercentageOutlined style={{ marginRight: 8 }} />
                Acceptance Rate
              </div>
            } 
            bordered={false} 
            style={{ height: '100%', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)' }}
          >
            <Statistic
              title="Overall Acceptance"
              value={acceptanceRate}
              suffix="%"
              valueStyle={{ color: acceptanceRate > 50 ? '#52c41a' : '#faad14' }}
            />
            <Progress percent={acceptanceRate} status={acceptanceRate > 50 ? "success" : "normal"} />
            
            <Divider style={{ margin: '12px 0' }} />
            
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Male Acceptance"
                  value={maleCount > 0 ? Math.round((acceptedMaleCount / maleCount) * 100) : 0}
                  suffix="%"
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Female Acceptance"
                  value={femaleCount > 0 ? Math.round((acceptedFemaleCount / femaleCount) * 100) : 0}
                  suffix="%"
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        
        <Col span={6}>
          <Card 
            title="Referee Status" 
            bordered={false}
            style={{ height: '100%', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)' }}
          >
            <div style={{ height: 200 }}>
              <Pie {...statusPieConfig} />
            </div>
          </Card>
        </Col>
        
        <Col span={6}>
          <Card 
            title="Gender Distribution" 
            bordered={false}
            style={{ height: '100%', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)' }}
          >
            <div style={{ height: 200 }}>
              <Pie {...genderPieConfig} />
            </div>
          </Card>
        </Col>
      </Row>

     
      <Divider />

      <Card 
        title="Referee List" 
        bordered={false}
      
      >
        <Table 
          columns={columns} 
          dataSource={Array.isArray(referees) ? referees : []} 
          rowKey="refreeId"
          pagination={{ pageSize: 10 }}
        />
      </Card>
      
      <Modal
        title={
          <div style={{ fontSize: 20, fontWeight: 'bold' }}>
            <PlusCircleFilled style={{ color: '#52c41a', marginRight: 8 }} />
            Register New Referee
          </div>
        }
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ refereeCode: user?.id }}>
          <Row gutter={16}>
            <Col span={24}>
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
            <Col span={24}>
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
            <Col span={24}>
              <Form.Item name="SecondName" label="Second Name">
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
                name="Password"
                label="Password"
                rules={[
                  { required: true, message: 'Please input the password!' },
                ]}
              >
                <Input.Password />
              </Form.Item>
            </Col>
            <Col span={24}>
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
          </Row>
          <Row gutter={16}>
            <Col span={24}>
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
            <Col span={24}>
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
          <Form.Item name="refereeCode" label="Referee Code">
            <Input value={user?.id} disabled />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
              block
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Register Referee
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <div style={{ fontSize: 20, fontWeight: 'bold' }}>
            <EditOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            Edit Referee Details
          </div>
        }
        visible={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          editForm.resetFields();
          setCurrentReferee(null);
        }}
        footer={null}
        width={600}
      >
        <Form 
          form={editForm} 
          layout="vertical" 
          onFinish={handleEditSubmit}
        >
          <Row gutter={16}>
            <Col span={24}>
              <div className="referee-info-display" style={{ marginBottom: 24, padding: 16, backgroundColor: '#f9f9f9', borderRadius: 4 }}>
                <Row gutter={[8, 8]}>
                  <Col span={6}>
                    <img 
                      src={currentReferee?.user.avatarUrl} 
                      alt="avatar" 
                      style={{ width: '100%', borderRadius: '50%' }}
                    />
                  </Col>
                  <Col span={18}>
                    <Title level={4} style={{ margin: 0 }}>
                      {currentReferee?.user.firstName} {currentReferee?.user.lastName}
                    </Title>
                    <Text type="secondary">{currentReferee?.user.email}</Text>
                    <div style={{ marginTop: 8 }}>
                      <Tag color={currentReferee?.isAccept ? "green" : "red"}>
                        {currentReferee?.isAccept ? "Accepted" : "Banned"}
                      </Tag>
                      <Tag color="blue">Code: {currentReferee?.refreeCode}</Tag>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="refreeLevel"
                label="Referee Level"
                help="e.g. Beginner, Intermediate, Advanced, Professional"
              >
                <Select allowClear>
                  <Option value="Beginner">Beginner</Option>
                  <Option value="Intermediate">Intermediate</Option>
                  <Option value="Advanced">Advanced</Option>
                  <Option value="Professional">Professional</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="refreeNote"
                label="Notes"
              >
                <Input.TextArea rows={4} placeholder="Additional notes about this referee" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item>
                <Button 
                  onClick={() => {
                    setIsEditModalVisible(false);
                    editForm.resetFields();
                    setCurrentReferee(null);
                  }}
                  block
                >
                  Cancel
                </Button>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block
                >
                  Update Referee
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default RefereesPage;
