import { SearchOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import { Button, Card, Col, Input, Row, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetAllTournaments } from '../../modules/Tournaments/hooks/useGetAllTournaments';
import { Tournament } from '../../modules/Tournaments/models';

type DataIndex = string;

export const OverviewPage = () => {
  const { data, isLoading, error, refetch } = useGetAllTournaments();
  const [searchText, setSearchText] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState<string>('');
  const searchInput = useRef<InputRef>(null);

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

  const handleAccept = (id: number) => {
    // Implement accept logic here
    console.log(`Accepted tournament with id: ${id}`);
  };

  const handleReject = (id: number) => {
    // Implement reject logic here
    console.log(`Rejected tournament with id: ${id}`);
  };

  const columns: ColumnsType<any> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name'),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      ...getColumnSearchProps('location'),
    },
    {
      title: 'Max Players',
      dataIndex: 'maxPlayer',
      key: 'maxPlayer',
    },
    {
      title: 'Total Prize',
      dataIndex: 'totalPrize',
      key: 'totalPrize',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      filters: [
        { text: 'Singles', value: 'Singles' },
        { text: 'Doubles', value: 'Doubles' },
      ],
      onFilter: (value, record) => record.type.indexOf(value as string) === 0,
      render: (type: string) => (
        <Tag color={type === 'Singles' ? 'blue' : 'purple'}>{type}</Tag>
      ),
    },
    {
      title: 'Is Accepted',
      dataIndex: 'isAccept',
      key: 'isAccept',
      filters: [
        { text: 'Accepted', value: true },
        { text: 'Not Accepted', value: false },
      ],
      onFilter: (value, record) => record.isAccept === value,
      render: (isAccept: boolean, record) => (
        isAccept ? (
          <Tag color="green">Accepted</Tag>
        ) : (
          <Space>
            <Button type="primary" onClick={() => handleAccept(record.id)}>Accept</Button>
            <Button danger onClick={() => handleReject(record.id)}>Reject</Button>
          </Space>
        )
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Link to={`/tournament/${record.id}`}>Detail</Link>
      ),
    },
  ];

  const totalTournaments = data?.length || 0;
  const activeTournaments = data?.filter(t => t.status === 'Active').length || 0;
  const singlesTournaments = data?.filter(t => t.type === 'Singles').length || 0;
  const doublesTournaments = data?.filter(t => t.type === 'Doubles').length || 0;

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card title="Total Tournaments" bordered={false}>
            {totalTournaments}
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Active Tournaments" bordered={false}>
            {activeTournaments}
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Singles Tournaments" bordered={false}>
            {singlesTournaments}
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Doubles Tournaments" bordered={false}>
            {doublesTournaments}
          </Card>
        </Col>
      </Row>
      <Button type="primary" onClick={() => refetch()} style={{ marginBottom: 16 }}>
        Refetch
      </Button>
      <Table
        columns={columns}
        dataSource={data}
        loading={isLoading}
        rowKey="id"
      />
    </div>
  );
};
