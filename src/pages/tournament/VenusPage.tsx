import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Typography, Button, Card, Col, Input, Row, Space, Table, Form, Modal, InputNumber, Radio, Spin, message, Progress, Tag, Statistic, Divider, Tooltip, Avatar, Empty } from 'antd';
import { SearchOutlined, UploadOutlined, LinkOutlined, EyeOutlined, DeleteOutlined, EditOutlined, PlusOutlined, HomeOutlined, TeamOutlined, UserOutlined, ExclamationCircleOutlined, ReloadOutlined, EnvironmentOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useGetVenueBySponnerId } from '../../modules/Venues/hooks/useGetVenueBySponnerId';
import { useCreateVenue } from '../../modules/Venues/hooks/useCreateVenus';
import { useUpdateVenue } from '../../modules/Venues/hooks/useUpdateVenue';
import { Upload } from 'antd';
import useCloudinaryUpload from '../../modules/Cloudinary/Macths/hooks/useCloudinaryUpload';
import { User } from '../../modules/User/models';
import { fetchUserById } from '../../modules/User/hooks/useGetUserById';

const { Title, Paragraph, Text } = Typography;
const { confirm } = Modal;

type DataIndex = string;

export const VenusPage = () => {
  const { mytheme } = useSelector((state: RootState) => state.theme);
  const user = useSelector((state: RootState) => state.authencation.user);

  const id = useMemo(() => user?.id || '', [user?.id]);

  const { data, isLoading, refetch } = useGetVenueBySponnerId(Number(id));
  const { mutate: createVenue } = useCreateVenue();
  const { mutate: updateVenue } = useUpdateVenue();
  const searchInput = useRef<InputRef>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [currentVenue, setCurrentVenue] = useState<any>(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>('');
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteVenueId, setDeleteVenueId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');

  const [imageInputType, setImageInputType] = useState<'url' | 'upload'>('url');
  const [updateImageInputType, setUpdateImageInputType] = useState<'url' | 'upload'>('url');
  const { uploadToCloudinary, uploading, progress } = useCloudinaryUpload();
  const [form] = Form.useForm();
  const [updateForm] = Form.useForm();

  const [previewImage, setPreviewImage] = useState<string>('');
  const [updatePreviewImage, setUpdatePreviewImage] = useState<string>('');

  const [userDetails, setUserDetails] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const userCache = useRef(new Map<string, User>());

  const formUrlImage = Form.useWatch('urlImage', form);
  const updateFormUrlImage = Form.useWatch('urlImage', updateForm);

  useEffect(() => {
    if (formUrlImage) {
      setPreviewImage(formUrlImage);
    }
  }, [formUrlImage]);

  useEffect(() => {
    if (updateFormUrlImage) {
      setUpdatePreviewImage(updateFormUrlImage);
    }
  }, [updateFormUrlImage]);

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      const userIds = data.map(venue => venue.createBy?.toString()).filter(id => id);
      fetchUsers(userIds);
    }
  }, [data]);

  const fetchUsers = async (userIds: string[]) => {
    setLoadingUsers(true);
    try {
      const uniqueUserIds = Array.from(new Set(userIds));
      const userPromises = uniqueUserIds.map(async (id) => {
        if (userCache.current.has(id)) {
          return userCache.current.get(id);
        } else {
          try {
            const user = await fetchUserById(Number(id));
            if (user) {
              userCache.current.set(id, user);
            }
            return user;
          } catch (error) {
            console.error(`Error fetching user with ID ${id}:`, error);
            return null;
          }
        }
      });

      const users = await Promise.all(userPromises);
      setUserDetails(users.filter(user => user !== null) as User[]);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const getUserById = (userId: string): User | undefined => {
    return userDetails.find(user => user.id === Number(userId));
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
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
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
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes((value as string).toLowerCase())
        : '',
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <span style={{ backgroundColor: '#ffc069', padding: 0 }}>
          {text ? text.toString() : ''}
        </span>
      ) : (
        text
      ),
  });

  const handleAddVenue = (values: any) => {
    setIsSubmitting(true);
    const venueData = {
      ...values,
      createBy: id,
    };
    createVenue(venueData, {
      onSuccess: () => {
        refetch();
        setIsModalVisible(false);
        form.resetFields();
        setImageInputType('url');
        setPreviewImage('');
        message.success('Venue added successfully');
        setIsSubmitting(false);
      },
      onError: (error) => {
        console.error('Error creating venue:', error);
        message.error('Failed to create venue');
        setIsSubmitting(false);
      },
    });
  };

  const handleUpdateVenue = (values: any) => {
    setIsSubmitting(true);
    const venueData = {
      ...values,
      id: currentVenue.id,
    };
    updateVenue({ id: currentVenue.id, venue: venueData }, {
      onSuccess: () => {
        refetch();
        setIsUpdateModalVisible(false);
        setUpdateImageInputType('url');
        setUpdatePreviewImage('');
        message.success('Venue updated successfully');
        setIsSubmitting(false);
      },
      onError: (error) => {
        console.error('Error updating venue:', error);
        message.error('Failed to update venue');
        setIsSubmitting(false);
      },
    });
  };

  const handleDeleteVenue = () => {
    setIsSubmitting(true);
    if (deleteVenueId) {
      setTimeout(() => {
        message.success('Venue deleted successfully');
        setIsDeleteModalVisible(false);
        setDeleteVenueId(null);
        refetch();
        setIsSubmitting(false);
      }, 1000);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const result = await uploadToCloudinary(file);
      if (result && result.secure_url) {
        form.setFieldsValue({ urlImage: result.secure_url });
        setPreviewImage(result.secure_url);
        message.success('Image uploaded successfully');
        return false;
      }
    } catch (err) {
      message.error('Failed to upload image');
    }
    return false;
  };

  const handleUpdateImageUpload = async (file: File) => {
    try {
      const result = await uploadToCloudinary(file);
      if (result && result.secure_url) {
        updateForm.setFieldsValue({ urlImage: result.secure_url });
        setUpdatePreviewImage(result.secure_url);
        message.success('Image uploaded successfully');
        return false;
      }
    } catch (err) {
      message.error('Failed to upload image');
    }
    return false;
  };

  const handleCloseAddModal = () => {
    setIsModalVisible(false);
    form.resetFields();
    setImageInputType('url');
    setPreviewImage('');
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalVisible(false);
    setUpdateImageInputType('url');
    setUpdatePreviewImage('');
  };

  const handleEditVenue = (record: any) => {
    setCurrentVenue(record);
    updateForm.setFieldsValue(record);
    setUpdatePreviewImage(record.urlImage || '');
    setIsUpdateModalVisible(true);
  };

  const handleViewImage = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setIsImageModalVisible(true);
  };

  const showDeleteConfirm = (venueId: number, venueName: string) => {
    confirm({
      title: 'Are you sure you want to delete this venue?',
      icon: <ExclamationCircleOutlined />,
      content: <div>
        <p>Venue: <strong>{venueName}</strong></p>
        <p>This action cannot be undone.</p>
      </div>,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        setDeleteVenueId(venueId);
        handleDeleteVenue();
      },
    });
  };

  const venueSummary = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return {
        totalVenues: 0,
        totalCapacity: 0,
        averageCapacity: 0
      };
    }

    const totalVenues = data.length;
    const totalCapacity = data.reduce((sum, venue) => sum + (venue.capacity || 0), 0);
    const averageCapacity = totalVenues > 0 ? totalCapacity / totalVenues : 0;

    return {
      totalVenues,
      totalCapacity,
      averageCapacity
    };
  }, [data]);

  const columns: ColumnsType<any> = [
    {
      title: 'Venue',
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name'),
      render: (text, record) => (
        <Space size="middle" align="start">
          <Avatar 
            size={64} 
            shape="square" 
            src={record.urlImage} 
            style={{ minWidth: 64 }}
            onClick={() => {
              setCurrentImage(record.urlImage);
              setIsImageModalVisible(true);
            }}
            className="venue-avatar"
          />
          <div>
            <Text strong style={{ fontSize: 16 }}>{text}</Text>
            <div style={{ marginTop: 4 }}>
              <Tag icon={<EnvironmentOutlined />} color="green">
                {record.address}
              </Tag>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
      align: 'center',
      width: 120,
      sorter: (a, b) => a.capacity - b.capacity,
      render: (capacity) => (
        <Tag color="blue" style={{ fontSize: 14, padding: '4px 8px' }}>
          <TeamOutlined /> {capacity} {capacity <= 1 ? 'court' : 'courts'}
        </Tag>
      ),
    },
    {
      title: 'Created By',
      dataIndex: 'createBy',
      key: 'createBy',
      align: 'center',
      width: 150,
      render: (createBy) => {
        const creator = getUserById(createBy);
        return (
          <Space direction="vertical" size="small" style={{ textAlign: 'center' }}>
            <Avatar 
              src={creator?.avatarUrl} 
              icon={!creator?.avatarUrl && <UserOutlined />}
              style={{ backgroundColor: !creator?.avatarUrl ? '#1890ff' : undefined }}
            />
            <Text>{creator?.firstName} {creator?.lastName}</Text>
          </Space>
        );
      }
    },
    {
      title: 'Actions',
      key: 'action',
      align: 'center',
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Image">
            <Button 
              icon={<EyeOutlined />} 
              shape="circle"
              onClick={() => handleViewImage(record.urlImage)}
              disabled={!record.urlImage}
            />
          </Tooltip>
          <Tooltip title="Edit Venue">
            <Button
              type="primary"
              icon={<EditOutlined />}
              shape="circle"
              onClick={() => handleEditVenue(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Venue">
            <Button
              danger
              icon={<DeleteOutlined />}
              shape="circle"
              onClick={() => showDeleteConfirm(record.id, record.name)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="venue-management">
      <div className="page-header">
        <div>
          <Title level={2}>
            <HomeOutlined /> Venue Management
          </Title>
          <Paragraph className="subtitle">
            Manage all your pickleball venues, their details, and capacity information.
          </Paragraph>
        </div>
        <div className="header-actions">
          <Space size="middle">
            <Button icon={<ReloadOutlined />} onClick={() => {
              refetch();
              message.success('Venue data refreshed');
            }}>
              Refresh
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setIsModalVisible(true)}
              size="large"
            >
              Add New Venue
            </Button>
          </Space>
        </div>
      </div>
      
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="stat-card" hoverable>
            <Statistic 
              title="Total Venues" 
              value={venueSummary.totalVenues} 
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
            <div className="stat-footer">
              <Text type="secondary">Available for tournaments</Text>
              <Progress 
                percent={venueSummary.totalVenues > 0 ? 100 : 0} 
                status={venueSummary.totalVenues > 0 ? "active" : "exception"} 
                size="small" 
                style={{ marginTop: 8 }}
              />
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={8}>
          <Card bordered={false} className="stat-card" hoverable>
            <Statistic 
              title="Total Court Capacity" 
              value={venueSummary.totalCapacity} 
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix="courts"
            />
            
          </Card>
        </Col>
        
        <Col xs={24} sm={8}>
          <Card bordered={false} className="stat-card" hoverable>
            <Statistic 
              title="Average Courts Per Venue" 
              value={venueSummary.averageCapacity} 
              precision={1}
              valueStyle={{ color: '#722ed1' }}
            />
            <div className="stat-footer">
              <Text type="secondary">Per venue</Text>
              <Progress 
                percent={Math.min(100, venueSummary.averageCapacity * 25)} 
                status="active" 
                size="small" 
                style={{ marginTop: 8 }}
              />
            </div>
          </Card>
        </Col>
      </Row>
      
      <Card 
        title={
          <Space>
            <HomeOutlined />
            <span>Venue List</span>
            {Array.isArray(data) && data.length > 0 && (
              <Tag color="blue">{data.length} venues</Tag>
            )}
            {(isLoading || loadingUsers) && <Spin size="small" />}
          </Space>
        }
        bordered={false}
        className="table-card"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setIsModalVisible(true)}
          >
            Add Venue
          </Button>
        }
      >
        {Array.isArray(data) && data.length > 0 ? (
          <Table
            columns={columns}
            dataSource={data}
            loading={isLoading || loadingUsers}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['5', '10', '20', '50'],
              showTotal: (total) => `Total ${total} venues`,
            }}
          />
        ) : !isLoading ? (
          <Empty 
            description="No venues found" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
              style={{ marginTop: 16 }}
            >
              Add First Venue
            </Button>
          </Empty>
        ) : null}
      </Card>
      
      <Modal
        title={<><PlusOutlined /> Add New Venue</>}
        open={isModalVisible}
        onCancel={handleCloseAddModal}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAddVenue}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Venue Name"
                initialValue={`Pickleball [Location] [Name]`}
                rules={[{ required: true, message: 'Please input the venue name!' }]}
              >
                <Input placeholder="Enter the venue name" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="address"
                label="Address"
                initialValue={`[Location]`}
                rules={[{ required: true, message: 'Please input the address!' }]}
              >
                <Input placeholder="Enter the full address" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="capacity"
                label="Number of Courts"
                initialValue={4}
                rules={[{ required: true, message: 'Please input the number of courts!' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider orientation="left">Venue Image</Divider>
          
          <Form.Item label="Image Source">
            <Radio.Group 
              value={imageInputType} 
              onChange={e => setImageInputType(e.target.value)}
              style={{ marginBottom: 16 }}
            >
              <Radio.Button value="url"><LinkOutlined /> URL</Radio.Button>
              <Radio.Button value="upload"><UploadOutlined /> Upload</Radio.Button>
            </Radio.Group>
          </Form.Item>
          
          {imageInputType === 'url' ? (
            <Form.Item
              name="urlImage"
              label="Image URL"
              rules={[{ required: true, message: 'Please input the image URL!' }]}
            >
              <Input placeholder="https://example.com/image.jpg" />
            </Form.Item>
          ) : (
            <Form.Item
              name="urlImage"
              label="Upload Image"
              rules={[{ required: true, message: 'Please upload an image!' }]}
            >
              <div>
                <Upload.Dragger
                  name="file"
                  multiple={false}
                  showUploadList={false}
                  beforeUpload={handleImageUpload}
                  accept="image/*"
                >
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p className="ant-upload-text">Click or drag image to upload</p>
                </Upload.Dragger>
                {uploading && <Progress percent={progress} size="small" style={{ marginTop: 8 }} />}
              </div>
            </Form.Item>
          )}
          
          {previewImage && (
            <div style={{ marginTop: 16, textAlign: 'center', marginBottom: 16 }}>
              <img 
                src={previewImage} 
                alt="Preview" 
                style={{ maxWidth: '100%', maxHeight: 200, borderRadius: '8px' }} 
              />
            </div>
          )}
          
          <Form.Item name="createBy" initialValue={id} hidden>
            <InputNumber />
          </Form.Item>
          
          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Button 
                  onClick={handleCloseAddModal}
                  style={{ width: '100%' }}
                >
                  Cancel
                </Button>
              </Col>
              <Col span={12}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  style={{ width: '100%' }}
                  disabled={uploading || isSubmitting}
                  loading={uploading || isSubmitting}
                >
                  {uploading ? 'Uploading...' : isSubmitting ? 'Creating...' : 'Create Venue'}
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Modal>
      
      <Modal
        title={<><EditOutlined /> Edit Venue</>}
        open={isUpdateModalVisible}
        onCancel={handleCloseUpdateModal}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={updateForm}
          layout="vertical"
          onFinish={handleUpdateVenue}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Venue Name"
                rules={[{ required: true, message: 'Please input the venue name!' }]}
              >
                <Input placeholder="Enter the venue name" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="address"
                label="Address"
                rules={[{ required: true, message: 'Please input the address!' }]}
              >
                <Input placeholder="Enter the full address" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="capacity"
                label="Number of Courts"
                rules={[{ required: true, message: 'Please input the number of courts!' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider orientation="left">Venue Image</Divider>
          
          <Form.Item label="Image Source">
            <Radio.Group 
              value={updateImageInputType} 
              onChange={e => setUpdateImageInputType(e.target.value)}
              style={{ marginBottom: 16 }}
            >
              <Radio.Button value="url"><LinkOutlined /> URL</Radio.Button>
              <Radio.Button value="upload"><UploadOutlined /> Upload New</Radio.Button>
            </Radio.Group>
          </Form.Item>
          
          {updateImageInputType === 'url' ? (
            <Form.Item
              name="urlImage"
              label="Image URL"
              rules={[{ required: true, message: 'Please input the image URL!' }]}
            >
              <Input placeholder="https://example.com/image.jpg" />
            </Form.Item>
          ) : (
            <Form.Item
              name="urlImage"
              label="Upload Image"
              rules={[{ required: true, message: 'Please upload an image!' }]}
            >
              <div>
                <Upload.Dragger
                  name="file"
                  multiple={false}
                  showUploadList={false}
                  beforeUpload={handleUpdateImageUpload}
                  accept="image/*"
                >
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p className="ant-upload-text">Click or drag image to upload</p>
                </Upload.Dragger>
                {uploading && <Progress percent={progress} size="small" style={{ marginTop: 8 }} />}
              </div>
            </Form.Item>
          )}
          
          {updatePreviewImage && (
            <div style={{ marginTop: 16, textAlign: 'center', marginBottom: 16 }}>
              <img 
                src={updatePreviewImage} 
                alt="Preview" 
                style={{ maxWidth: '100%', maxHeight: 200, borderRadius: '8px' }} 
              />
            </div>
          )}
          
          <Form.Item name="createBy" initialValue={id} hidden>
            <InputNumber />
          </Form.Item>
          
          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Button 
                  onClick={handleCloseUpdateModal}
                  style={{ width: '100%' }}
                >
                  Cancel
                </Button>
              </Col>
              <Col span={12}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  style={{ width: '100%' }}
                  disabled={uploading || isSubmitting}
                  loading={uploading || isSubmitting}
                >
                  {uploading ? 'Uploading...' : isSubmitting ? 'Updating...' : 'Update Venue'}
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Modal>
      
      <Modal
        title="Venue Image"
        open={isImageModalVisible}
        onCancel={() => setIsImageModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsImageModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        <div style={{ textAlign: 'center' }}>
          <img
            src={currentImage}
            alt="Venue"
            style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px' }}
          />
        </div>
      </Modal>
      
      <style>
        {`
        .venue-management {
          padding: 24px;
        }
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        
        .subtitle {
          opacity: 0.7;
          margin-top: 0 !important;
        }
        
        .header-actions {
          margin-top: 8px;
        }
        
        .stat-card {
          height: 100%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
          border-radius: 8px;
          transition: all 0.3s;
        }
        
        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }
        
        .stat-footer {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #f0f0f0;
        }
        
        .table-card {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
          border-radius: 8px;
        }
        
        .venue-avatar {
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .venue-avatar:hover {
          opacity: 0.8;
          transform: scale(1.05);
        }
        
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
          }
          
          .header-actions {
            margin-top: 16px;
            align-self: flex-start;
          }
        }
        
        .creator-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        `}
      </style>
    </div>
  );
};

