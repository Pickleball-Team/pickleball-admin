import React, { useMemo, useRef, useState } from 'react';
import { Typography, Button, Card, Col, Input, Row, Space, Table, Form, Modal, InputNumber } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useGetVenueBySponnerId } from '../../modules/Venues/hooks/useGetVenueBySponnerId';
import { useCreateVenue } from '../../modules/Venues/hooks/useCreateVenus';
import { useUpdateVenue } from '../../modules/Venues/hooks/useUpdateVenue';

const { Title, Paragraph } = Typography;

type DataIndex = string;

export const VenusPage = () => {
  const { mytheme } = useSelector((state: RootState) => state.theme);
  const user = useSelector((state: RootState) => state.authencation.user);

  const id = useMemo(() => user?.id || '', [user?.id]);

  const { data, isLoading, refetch } = useGetVenueBySponnerId(Number(id));
  const { mutate: createVenue } = useCreateVenue();
  const { mutate: updateVenue } = useUpdateVenue();
  const [searchText, setSearchText] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState<string>('');
  const searchInput = useRef<InputRef>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [currentVenue, setCurrentVenue] = useState<any>(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>('');

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
        <img
          src={urlImage}
          alt="Venue"
          style={{ width: 100, height: 100, cursor: 'pointer' }}
          onClick={() => {
            setCurrentImage(urlImage);
            setIsImageModalVisible(true);
          }}
        />
      ),
    },
    {
      title: 'Created By',
      dataIndex: 'createBy',
      key: 'createBy',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Button
          type="primary"
          onClick={() => {
            setCurrentVenue(record);
            setIsUpdateModalVisible(true);
          }}
        >
          Update
        </Button>
      ),
    },
  ];

  const handleAddVenue = (values: any) => {
    const venueData = {
      ...values,
      createBy: id,
    };
    createVenue(venueData, {
      onSuccess: () => {
        refetch();
        setIsModalVisible(false);
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
      },
      onError: (error) => {
        console.error('Error updating venue:', error);
      },
    });
  };

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
      />
      <Modal
        title="Add Venue"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleAddVenue}>
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
            initialValue={100}
            rules={[{ required: true, message: 'Please input the capacity!' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="urlImage"
            label="Image URL"
            rules={[{ required: true, message: 'Please input the image URL!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="createBy" initialValue={id} hidden>
            <InputNumber />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Update Venue"
        visible={isUpdateModalVisible}
        onCancel={() => setIsUpdateModalVisible(false)}
        footer={null}
      >
        <Form
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
          <Form.Item
            name="urlImage"
            label="Image URL"
            rules={[{ required: true, message: 'Please input the image URL!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="createBy" initialValue={id} hidden>
            <InputNumber />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Venue Image"
        visible={isImageModalVisible}
        onCancel={() => setIsImageModalVisible(false)}
        footer={null}
      >
        <img
          src={currentImage}
          alt="Venue"
          style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
        />
      </Modal>
    </div>
  );
};

export default VenusPage;
