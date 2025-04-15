import React, { useMemo, useRef, useState } from 'react';
import { Typography, Button, Card, Col, Input, Row, Space, Table, Form, Modal, InputNumber, Statistic, Avatar, Divider, Empty, Tag, Tooltip, message, Popconfirm } from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined, PictureOutlined, HomeFilled, TeamOutlined, EditOutlined, EnvironmentOutlined, EyeOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { useSelector } from 'react-redux';
import { useGetVenueBySponnerId } from '../../../modules/Venues/hooks/useGetVenueBySponnerId';
import { useCreateVenue } from '../../../modules/Venues/hooks/useCreateVenus';
import { useUpdateVenue } from '../../../modules/Venues/hooks/useUpdateVenue';
import { RootState } from '../../../redux/store';
import { useGetVenueAll } from '../../../modules/Venues/hooks/useGetAllVenus';

const { Title, Paragraph, Text } = Typography;
const { confirm } = Modal;

type DataIndex = string;

export const VenusPage = () => {
  const { mytheme } = useSelector((state: RootState) => state.theme);
  const user = useSelector((state: RootState) => state.authencation.user);

  const id = useMemo(() => user?.id || '', [user?.id]);

  const { data, isLoading, refetch } = useGetVenueAll();
  const { mutate: createVenue } = useCreateVenue();
  const { mutate: updateVenue } = useUpdateVenue();
  const [form] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [imageInputType, setImageInputType] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState('');
  const [searchText, setSearchText] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState<string>('');
  const searchInput = useRef<InputRef>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [currentVenue, setCurrentVenue] = useState<any>(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCloseAddModal = () => {
    setIsModalVisible(false);
    form.resetFields();
    setPreviewImage('');
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalVisible(false);
    updateForm.resetFields();
    setPreviewImage('');
  };

  const handleImageUpload = (file: any) => {
    setUploading(true);
    setProgress(0);

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadstart = () => setProgress(10);
    reader.onprogress = () => setProgress(50);

    reader.onload = () => {
      setTimeout(() => {
        setProgress(100);
        setPreviewImage(reader.result as string);
        form.setFieldsValue({ urlImage: reader.result });
        updateForm.setFieldsValue({ urlImage: reader.result });
        setUploading(false);
      }, 1000);
    };

    return false;
  };

  const handleAddVenue = (values: any) => {
    setIsSubmitting(true);
    createVenue(values, {
      onSuccess: () => {
        message.success('Venue created successfully');
        handleCloseAddModal();
        refetch();
        setIsSubmitting(false);
      },
      onError: (error) => {
        message.error('Failed to create venue: ' + (error.message || 'Unknown error'));
        setIsSubmitting(false);
      }
    });
  };

  const handleUpdateVenue = (values: any) => {
    setIsSubmitting(true);
    updateVenue(
      {
        ...values,
        id: currentVenue.id
      },
      {
        onSuccess: () => {
          message.success('Venue updated successfully');
          handleCloseUpdateModal();
          refetch();
          setIsSubmitting(false);
        },
        onError: (error) => {
          message.error('Failed to update venue: ' + (error.message || 'Unknown error'));
          setIsSubmitting(false);
        }
      }
    );
  };

  const showDeleteConfirm = (venueId: string, venueName: string) => {
    confirm({
      title: 'Are you sure you want to delete this venue?',
      icon: <ExclamationCircleOutlined />,
      content: `You are about to delete "${venueName}". This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
       
   
      }
    });
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

  return (
    <div className="venue-management">
      <div className="page-header">
        <div>
          <Title level={2}>
            <HomeFilled /> Venue Management
          </Title>
          <Paragraph className="subtitle">
            Manage all your pickleball venues, their details, and capacity information.
          </Paragraph>
        </div>
      </div>
      
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className="stat-card" hoverable>
            <Statistic 
              title="Total Venues" 
              value={Array.isArray(data) ? data.length : 0}
              prefix={<HomeFilled />}
              valueStyle={{ color: '#3f8600' }}
            />
            <div className="stat-footer">
              <Text type="secondary">Available for tournaments</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className="stat-card" hoverable>
            <Statistic 
              title="Total Capacity" 
              value={Array.isArray(data) ? 
                data.reduce((sum: number, venue: any) => sum + (venue.capacity || 0), 0) : 0
              }
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div className="stat-footer">
              <Text type="secondary">Players across all venues</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className="stat-card" hoverable>
            <Statistic 
              title="Average Capacity" 
              value={Array.isArray(data) && data.length > 0 ? 
                (data.reduce((sum: number, venue: any) => sum + (venue.capacity || 0), 0) / data.length).toFixed(1) : 0
              }
              prefix={<PictureOutlined />}
              valueStyle={{ color: '#722ed1' }}
              precision={1}
            />
            <div className="stat-footer">
              <Text type="secondary">Per venue</Text>
            </div>
          </Card>
        </Col>
      </Row>
      
      <Card 
        title={
          <Space>
            <HomeFilled />
            <span>Venue List</span>
            {Array.isArray(data) && data.length > 0 && (
              <Tag color="blue">{data.length} venues</Tag>
            )}
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
            columns={[
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
                    <TeamOutlined /> {capacity} players
                  </Tag>
                ),
              },
              {
                title: 'Created By',
                dataIndex: 'createBy',
                key: 'createBy',
                align: 'center',
                width: 150,
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
                        onClick={() => {
                          setCurrentImage(record.urlImage);
                          setIsImageModalVisible(true);
                        }}
                      />
                    </Tooltip>
                    <Tooltip title="Edit Venue">
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        shape="circle"
                        onClick={() => {
                          setCurrentVenue(record);
                          updateForm.setFieldsValue(record);
                          setIsUpdateModalVisible(true);
                        }}
                      />
                    </Tooltip>
                  </Space>
                ),
              },
            ]}
            dataSource={data}
            loading={isLoading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
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
            >
              Add First Venue
            </Button>
          </Empty>
        ) : null}
      </Card>
      
      <Modal
        title={
          <div>
            <HomeFilled style={{ marginRight: 8 }} />
            Add New Venue
          </div>
        }
        open={isModalVisible}
        onCancel={handleCloseAddModal}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form 
          form={form}
          layout="vertical" 
          onFinish={handleAddVenue}
          initialValues={{
            name: `Pickleball [Location] [Name]`,
            address: `[Location]`,
            capacity: 4,
            createBy: id
          }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Venue Name"
                rules={[{ required: true, message: 'Please input the venue name!' }]}
              >
                <Input prefix={<HomeFilled />} placeholder="e.g., Pickleball Miami Central" />
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
                <Input prefix={<EnvironmentOutlined />} placeholder="e.g., 123 Main St, Miami, FL" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="capacity"
                label="Capacity"
                rules={[{ required: true, message: 'Please input the capacity!' }]}
              >
                <InputNumber 
                  min={1} 
                  style={{ width: '100%' }} 
                  prefix={<TeamOutlined />} 
                  placeholder="Number of players"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Image Source">
                <Space>
                  <Button 
                    type={imageInputType === 'url' ? 'primary' : 'default'}
                    onClick={() => setImageInputType('url')}
                  >
                    URL
                  </Button>
                  <Button
                    type={imageInputType === 'upload' ? 'primary' : 'default'}
                    onClick={() => setImageInputType('upload')}
                  >
                    Upload
                  </Button>
                </Space>
              </Form.Item>
            </Col>
            <Col span={24}>
              {imageInputType === 'url' ? (
                <Form.Item
                  name="urlImage"
                  label="Image URL"
                  rules={[{ required: true, message: 'Please input the image URL!' }]}
                >
                  <Input 
                    prefix={<PictureOutlined />} 
                    placeholder="https://example.com/image.jpg" 
                    onChange={(e) => setPreviewImage(e.target.value)}
                  />
                </Form.Item>
              ) : (
                <Form.Item
                  name="urlImage"
                  label="Upload Image"
                  rules={[{ required: true, message: 'Please upload an image!' }]}
                >
                  <Input type="file" accept="image/*" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageUpload(e.target.files[0]);
                    }
                  }} />
                </Form.Item>
              )}
              
              {previewImage && (
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <img 
                    src={previewImage} 
                    alt="Venue Preview" 
                    style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                  />
                </div>
              )}
            </Col>
          </Row>
          <Form.Item name="createBy" initialValue={id} hidden>
            <InputNumber />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={isSubmitting}>
              Save Venue
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      
      <Modal
        title={
          <div>
            <EditOutlined style={{ marginRight: 8 }} />
            Update Venue
          </div>
        }
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
          initialValues={currentVenue}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Venue Name"
                rules={[{ required: true, message: 'Please input the venue name!' }]}
              >
                <Input prefix={<HomeFilled />} placeholder="e.g., Pickleball Miami Central" />
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
                <Input prefix={<EnvironmentOutlined />} placeholder="e.g., 123 Main St, Miami, FL" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="capacity"
                label="Capacity"
                rules={[{ required: true, message: 'Please input the capacity!' }]}
              >
                <InputNumber 
                  min={1} 
                  style={{ width: '100%' }} 
                  prefix={<TeamOutlined />} 
                  placeholder="Number of players"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Image Source">
                <Space>
                  <Button 
                    type={imageInputType === 'url' ? 'primary' : 'default'}
                    onClick={() => setImageInputType('url')}
                  >
                    URL
                  </Button>
                  <Button
                    type={imageInputType === 'upload' ? 'primary' : 'default'}
                    onClick={() => setImageInputType('upload')}
                  >
                    Upload
                  </Button>
                </Space>
              </Form.Item>
            </Col>
            <Col span={24}>
              {imageInputType === 'url' ? (
                <Form.Item
                  name="urlImage"
                  label="Image URL"
                  rules={[{ required: true, message: 'Please input the image URL!' }]}
                >
                  <Input 
                    prefix={<PictureOutlined />} 
                    placeholder="https://example.com/image.jpg" 
                    onChange={(e) => setPreviewImage(e.target.value)}
                  />
                </Form.Item>
              ) : (
                <Form.Item
                  name="urlImage"
                  label="Upload Image"
                  rules={[{ required: true, message: 'Please upload an image!' }]}
                >
                  <Input type="file" accept="image/*" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageUpload(e.target.files[0]);
                    }
                  }} />
                </Form.Item>
              )}
              
              {(previewImage || currentVenue?.urlImage) && (
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <img 
                    src={previewImage || currentVenue?.urlImage} 
                    alt="Venue Preview" 
                    style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                  />
                </div>
              )}
            </Col>
          </Row>
          <Form.Item name="createBy" hidden>
            <InputNumber />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={isSubmitting}>
              Update Venue
            </Button>
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
            style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
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
        `}
      </style>
    </div>
  );
};

export default VenusPage;
