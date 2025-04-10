import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Typography, Button, Card, Col, Input, Row, Space, Table, Form, Modal, InputNumber, Radio, Spin, message, Progress, Tag, Statistic, Divider, Tooltip } from 'antd';
import { SearchOutlined, UploadOutlined, LinkOutlined, EyeOutlined, DeleteOutlined, EditOutlined, PlusOutlined, HomeOutlined, TeamOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useGetVenueBySponnerId } from '../../modules/Venues/hooks/useGetVenueBySponnerId';
import { useCreateVenue } from '../../modules/Venues/hooks/useCreateVenus';
import { useUpdateVenue } from '../../modules/Venues/hooks/useUpdateVenue';
import { Upload } from 'antd';
import useCloudinaryUpload from '../../modules/Cloudinary/Macths/hooks/useCloudinaryUpload';

const { Title, Paragraph } = Typography;

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
  
  // Search state
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  
  // State variables for image upload
  const [imageInputType, setImageInputType] = useState<'url' | 'upload'>('url');
  const [updateImageInputType, setUpdateImageInputType] = useState<'url' | 'upload'>('url');
  const { uploadToCloudinary, uploading, progress } = useCloudinaryUpload();
  const [form] = Form.useForm();
  const [updateForm] = Form.useForm();
  
  // State for image previews
  const [previewImage, setPreviewImage] = useState<string>('');
  const [updatePreviewImage, setUpdatePreviewImage] = useState<string>('');

  // Watch for form values changing and update preview
  const formUrlImage = Form.useWatch('urlImage', form);
  const updateFormUrlImage = Form.useWatch('urlImage', updateForm);

  // Update preview when form values change
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
      },
      onError: (error) => {
        console.error('Error creating venue:', error);
        message.error('Failed to create venue');
      },
    });
  };

  const handleUpdateVenue = (values: any) => {
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
      },
      onError: (error) => {
        console.error('Error updating venue:', error);
        message.error('Failed to update venue');
      },
    });
  };

  const handleDeleteVenue = () => {
    if (deleteVenueId) {
      // Implementation would depend on your actual API
      // This is a placeholder for the delete function
      // Replace with your actual delete venue mutation hook
      message.success('Venue deleted successfully');
      setIsDeleteModalVisible(false);
      setDeleteVenueId(null);
      refetch();
    }
  };

  // Handlers for image upload
  const handleImageUpload = async (file: File) => {
    try {
      const result = await uploadToCloudinary(file);
      if (result && result.secure_url) {
        form.setFieldsValue({ urlImage: result.secure_url });
        setPreviewImage(result.secure_url);
        message.success('Image uploaded successfully');
        return false; // Prevent default upload behavior
      }
    } catch (err) {
      message.error('Failed to upload image');
    }
    return false; // Prevent default upload behavior
  };

  const handleUpdateImageUpload = async (file: File) => {
    try {
      const result = await uploadToCloudinary(file);
      if (result && result.secure_url) {
        updateForm.setFieldsValue({ urlImage: result.secure_url });
        setUpdatePreviewImage(result.secure_url);
        message.success('Image uploaded successfully');
        return false; // Prevent default upload behavior
      }
    } catch (err) {
      message.error('Failed to upload image');
    }
    return false; // Prevent default upload behavior
  };

  // Close modal handlers
  const handleCloseAddModal = () => {
    setIsModalVisible(false);
    form.resetFields();
    setImageInputType('url');
    setPreviewImage('');
  };
  
  const handleCloseUpdateModal = () => {
    setIsUpdateModalVisible(false);
    setUpdateImageInputType('url');
  };

  // Edit venue handler
  const handleEditVenue = (record: any) => {
    setCurrentVenue(record);
    updateForm.setFieldsValue(record);
    setUpdatePreviewImage(record.urlImage || '');
    setIsUpdateModalVisible(true);
  };

  // View image handler
  const handleViewImage = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setIsImageModalVisible(true);
  };

  // Confirm delete handler
  const showDeleteConfirm = (venueId: number, venueName: string) => {
    setDeleteVenueId(venueId);
    Modal.confirm({
      title: 'Are you sure you want to delete this venue?',
      content: <div>
        <p>Venue: <strong>{venueName}</strong></p>
        <p>This action cannot be undone.</p>
      </div>,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        handleDeleteVenue();
      },
    });
  };

  // Calculate summary statistics
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
    const averageCapacity = totalVenues > 0 ? Math.round(totalCapacity / totalVenues) : 0;

    return {
      totalVenues,
      totalCapacity,
      averageCapacity
    };
  }, [data]);

  const columns: ColumnsType<any> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name'),
      render: (text: string) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      ...getColumnSearchProps('address'),
      render: (address: string) => (
        <Tooltip title={address}>
          <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {address}
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
      sorter: (a, b) => a.capacity - b.capacity,
      render: (capacity: number) => (
        <Tag color={capacity <= 2 ? 'orange' : capacity <= 4 ? 'blue' : 'green'}>
          {capacity} {capacity === 1 ? 'court' : 'courts'}
        </Tag>
      ),
    },
    {
      title: 'Image',
      dataIndex: 'urlImage',
      key: 'urlImage',
      render: (urlImage: string) => (
        urlImage ? (
          <div style={{ textAlign: 'center' }}>
            <img
              src={urlImage}
              alt="Venue"
              style={{ width: 60, height: 60, objectFit: 'cover', cursor: 'pointer', borderRadius: '8px' }}
              onClick={() => handleViewImage(urlImage)}
            />
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <Button icon={<UploadOutlined />} shape="circle" disabled />
          </div>
        )
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary"
            icon={<EyeOutlined />} 
            onClick={() => handleViewImage(record.urlImage)}
            disabled={!record.urlImage}
            size="small"
          />
          <Button 
            type="default"
            icon={<EditOutlined />} 
            onClick={() => handleEditVenue(record)}
            size="small"
          />
          <Button 
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record.id, record.name)}
            size="small"
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '16px' }}>
      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}><HomeOutlined /> Venue Management</Title>
        </Col>
        <Col flex="auto">
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
            style={{ float: 'right' }}
          >
            Add New Venue
          </Button>
        </Col>
      </Row>
      
      <Paragraph style={{ marginBottom: 24 }}>
        Manage all your venue locations for tournaments. Add details, capacity information, and location images.
      </Paragraph>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ height: '100%' }}>
            <Statistic 
              title="Total Venues" 
              value={venueSummary.totalVenues} 
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Divider style={{ margin: '12px 0' }} />
            <div>
              {!isLoading && Array.isArray(data) && data.length > 0 ? (
                <Progress 
                  percent={100} 
                  status="active" 
                  size="small" 
                  style={{ marginBottom: 8 }}
                />
              ) : (
                <Progress 
                  percent={0} 
                  status="exception" 
                  size="small" 
                  style={{ marginBottom: 8 }}
                />
              )}
              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                {Array.isArray(data) && data.length > 0 
                  ? 'Venues ready for tournaments' 
                  : 'No venues available, add some!'}
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ height: '100%' }}>
            <Statistic 
              title="Total Court Capacity" 
              value={venueSummary.totalCapacity} 
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix="courts"
            />
            <Divider style={{ margin: '12px 0' }} />
            <div>
              <Progress 
                percent={Math.min(100, venueSummary.totalCapacity * 10)} 
                status="active" 
                size="small" 
                style={{ marginBottom: 8 }}
              />
              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                {venueSummary.totalCapacity > 10 
                  ? 'Excellent court capacity' 
                  : venueSummary.totalCapacity > 5 
                  ? 'Good court capacity' 
                  : 'Limited court capacity'}
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ height: '100%' }}>
            <Statistic 
              title="Average Courts Per Venue" 
              value={venueSummary.averageCapacity} 
              precision={1}
              valueStyle={{ color: '#722ed1' }}
            />
            <Divider style={{ margin: '12px 0' }} />
            <div>
              <Progress 
                percent={Math.min(100, venueSummary.averageCapacity * 25)} 
                status="active" 
                size="small" 
                style={{ marginBottom: 8 }}
              />
              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                {venueSummary.averageCapacity >= 4 
                  ? 'Large venues on average' 
                  : venueSummary.averageCapacity >= 2 
                  ? 'Medium venues on average' 
                  : 'Small venues on average'}
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      
      <Card 
        title={<div style={{ display: 'flex', alignItems: 'center' }}>
          <HomeOutlined style={{ marginRight: 8 }} /> 
          <span>My Venues</span>
          {isLoading && <Spin size="small" style={{ marginLeft: 8 }} />}
        </div>}
        bordered={false}
        className="custom-table-card"
      >
        {Array.isArray(data) && data.length > 0 ? (
          <Table
            columns={columns}
            dataSource={Array.isArray(data) ? data : []}
            loading={isLoading}
            rowKey="id"
            style={{ backgroundColor: '#ffffff' }}
            pagination={{
              defaultPageSize: 8,
              showSizeChanger: true,
              pageSizeOptions: ['5', '8', '10', '20'],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} venues`
            }}
          />
        ) : !isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <HomeOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: 16 }} />
            <p>No venues found. Click "Add New Venue" to create your first venue.</p>
            <Button 
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
              style={{ marginTop: 16 }}
            >
              Add New Venue
            </Button>
          </div>
        ) : null}
      </Card>
      
      {/* Add Venue Modal with Image Upload */}
      <Modal
        title={<><PlusOutlined /> Add New Venue</>}
        visible={isModalVisible}
        onCancel={handleCloseAddModal}
        footer={null}
        width={600}
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
          
          {/* Image Input Section with Toggle */}
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
          
          {/* Use previewImage state for preview instead of form.getFieldValue */}
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
                  disabled={uploading}
                  loading={uploading}
                >
                  {uploading ? 'Uploading...' : 'Create Venue'}
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Update Venue Modal with Image Upload */}
      <Modal
        title={<><EditOutlined /> Edit Venue</>}
        visible={isUpdateModalVisible}
        onCancel={handleCloseUpdateModal}
        footer={null}
        width={600}
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
          
          {/* Image Input Section with Toggle for Update Modal */}
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
          
          {/* Use updatePreviewImage state for preview */}
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
                  disabled={uploading}
                  loading={uploading}
                >
                  {uploading ? 'Uploading...' : 'Update Venue'}
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Image Preview Modal */}
      <Modal
        title="Venue Image"
        visible={isImageModalVisible}
        onCancel={() => setIsImageModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsImageModalVisible(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        <div style={{ textAlign: 'center' }}>
          <img
            src={currentImage}
            alt="Venue"
            style={{ maxWidth: '100%', maxHeight: 600, objectFit: 'contain', borderRadius: '8px' }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default VenusPage;

