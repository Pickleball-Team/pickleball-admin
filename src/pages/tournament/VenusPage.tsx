import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Typography, Button, Card, Col, Input, Row, Space, Table, Form, Modal, InputNumber, Radio, Spin, message, Progress } from 'antd';
import { SearchOutlined, UploadOutlined, LinkOutlined, EyeOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
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
        ? record[dataIndex].toString().toLowerCase().includes((value as string).toLowerCase())
        : '',
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
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
      },
      onError: (error) => {
        console.error('Error creating venue:', error);
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
      },
      onError: (error) => {
        console.error('Error updating venue:', error);
      },
    });
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
    setUpdatePreviewImage(record.urlImage || '');
    setIsUpdateModalVisible(true);
  };

  // View image handler
  const handleViewImage = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setIsImageModalVisible(true);
  };

  const columns: ColumnsType<any> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name'),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      ...getColumnSearchProps('address'),
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
    },
    {
      title: 'Image',
      dataIndex: 'urlImage',
      key: 'urlImage',
      render: (urlImage: string) => (
        urlImage ? (
          <img
            src={urlImage}
            alt="Venue"
            style={{ width: 60, height: 60, objectFit: 'cover', cursor: 'pointer' }}
            onClick={() => handleViewImage(urlImage)}
          />
        ) : (
          <span>No image</span>
        )
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => handleViewImage(record.urlImage)}
            disabled={!record.urlImage}
          />
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEditVenue(record)}
          />
          <Button 
            danger
            icon={<DeleteOutlined />}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Venue Management</Title>
      <Paragraph>
        This page allows you to manage venues. You can view, search, and add new venues.
      </Paragraph>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card title="Total Venues" bordered={false}>
            {Array.isArray(data) ? data.length : 0}
          </Card>
        </Col>
      </Row>
      <Button
        type="primary"
        onClick={() => setIsModalVisible(true)}
        style={{ marginBottom: 16 }}
      >
        Add Venue
      </Button>
      <Table
        columns={columns}
        dataSource={Array.isArray(data) ? data : []}
        loading={isLoading}
        rowKey="id"
        style={{ backgroundColor: '#ffffff' }}
      />
      
      {/* Add Venue Modal with Image Upload */}
      <Modal
        title="Add Venue"
        visible={isModalVisible}
        onCancel={handleCloseAddModal}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddVenue}>
          <Form.Item
            name="name"
            label="Name"
            initialValue={`Pickleball [Location] [Name]`}
            rules={[{ required: true, message: 'Please input the name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="address"
            label="Address"
            initialValue={`[Location]`}
            rules={[{ required: true, message: 'Please input the address!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="capacity"
            label="Capacity"
            initialValue={4}
            rules={[{ required: true, message: 'Please input the capacity!' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          
          {/* Image Input Section with Toggle */}
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
                style={{ maxWidth: '100%', maxHeight: 200 }} 
              />
            </div>
          )}
          
          <Form.Item name="createBy" initialValue={id} hidden>
            <InputNumber />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              style={{ width: '100%' }}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Save'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Update Venue Modal with Image Upload */}
      <Modal
        title="Update Venue"
        visible={isUpdateModalVisible}
        onCancel={handleCloseUpdateModal}
        footer={null}
      >
        <Form
          form={updateForm}
          layout="vertical"
          initialValues={currentVenue}
          onFinish={handleUpdateVenue}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input the name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: 'Please input the address!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="capacity"
            label="Capacity"
            rules={[{ required: true, message: 'Please input the capacity!' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          
          {/* Image Input Section with Toggle for Update Modal */}
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
              <Input />
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
                style={{ maxWidth: '100%', maxHeight: 200 }} 
              />
            </div>
          )}
          
          <Form.Item name="createBy" initialValue={id} hidden>
            <InputNumber />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              style={{ width: '100%' }}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Save'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Image Preview Modal */}
      <Modal
        title="Venue Image"
        visible={isImageModalVisible}
        onCancel={() => setIsImageModalVisible(false)}
        footer={null}
        width={700}
      >
        <div style={{ textAlign: 'center' }}>
          <img
            src={currentImage}
            alt="Venue"
            style={{ maxWidth: '100%', maxHeight: 600, objectFit: 'contain' }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default VenusPage;
function setSearchText(arg0: string) {
  throw new Error('Function not implemented.');
}

function setSearchedColumn(dataIndex: string) {
  throw new Error('Function not implemented.');
}

