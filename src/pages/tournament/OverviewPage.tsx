import { SearchOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import {
  Button,
  Card,
  Col,
  Input,
  Row,
  Space,
  Table,
  Tag,
  Select,
  Typography,
} from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetAllTournaments } from '../../modules/Tournaments/hooks/useGetAllTournaments';
import { useUpdateTournament } from '../../modules/Tournaments/hooks/useUpdateTournamen';
import { Pie } from '@ant-design/charts';
import { useGetTournamentsBySponsorId } from '../../modules/Tournaments/hooks/useGetTournamentsBySponsorId';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const { Option } = Select;

type DataIndex = string;

export const OverviewPage = () => {
  const user = useSelector((state: RootState) => state.authencation.user);
  const { data, isLoading, refetch } = useGetTournamentsBySponsorId(user?.id ?? 0);
  const { mutate: updateTournament } = useUpdateTournament();
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
      render: (status: string) => {
        let color = '';
        let label = '';

        switch (status) {
          case 'Scheduled':
            color = 'blue';
            label = 'Scheduled';
            break;
          case 'Ongoing':
            color = 'orange';
            label = 'Ongoing';
            break;
          case 'Completed':
            color = 'green';
            label = 'Completed';
            break;
          case 'Disable':
            color = 'red';
            label = 'Disable';
            break;
          default:
            color = 'default';
            label = status;
        }

        return <Tag color={color}>{label}</Tag>;
      },
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
      render: (isAccept: boolean, record) =>
        isAccept ? (
          <Tag color="green">Accepted</Tag>
        ) : (
          <Tag color="blue-inverse">Pending</Tag>
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
  const pendingTournaments =
    data?.filter((t) => t.status === 'Pending').length || 0;
  const ongoingTournaments =
    data?.filter((t) => t.status === 'Ongoing').length || 0;
  const completedTournaments =
    data?.filter((t) => t.status === 'Completed').length || 0;
  const disabledTournaments =
    data?.filter((t) => t.status === 'Disable').length || 0;
  const singlesTournaments =
    data?.filter((t) => t.type === 'Singles').length || 0;
  const doublesTournaments =
    data?.filter((t) => t.type === 'Doubles').length || 0;

  const tournamentTypeData = [
    { type: 'Singles', value: singlesTournaments },
    { type: 'Doubles', value: doublesTournaments },
  ];

  const tournamentStatusData = [
    { status: 'Pending', value: pendingTournaments },
    { status: 'Ongoing', value: ongoingTournaments },
    { status: 'Completed', value: completedTournaments },
    { status: 'Disable', value: disabledTournaments },
  ];

  const pieConfig = (data: any[], angleField: string, colorField: string) => ({
    appendPadding: 10,
    data,
    angleField,
    colorField,
    radius: 1,
    innerRadius: 0.6,
    width: 170,
    height: 170,
    label: {
      type: 'inner',
      offset: '-50%',
      content: (data: any) => `${(data.percent * 100).toFixed(0)}%`,
      style: {
        fontSize: 14,
        textAlign: 'center',
      },
    },
    interactions: [{ type: 'element-active' }],
  });

  return (
    <div>
      <Typography.Title level={2} style={{ marginBottom: '24px' }}>
        Tournament Overview
      </Typography.Title>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Row gutter={16}>
            <Col span={12}>
              <Card
                title="Total Tournaments"
                bordered={false}
                style={{ backgroundColor: '#ffffff' }}
              >
                {totalTournaments}
              </Card>
            </Col>
            <Col span={12}>
              <Card
                title="Active Tournaments"
                bordered={false}
                style={{ backgroundColor: '#ffffff' }}
              >
                {ongoingTournaments}
              </Card>
            </Col>
          </Row>
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={12}>
              <Card
                title="Singles Tournaments"
                bordered={false}
                style={{ backgroundColor: '#ffffff' }}
              >
                {singlesTournaments}
              </Card>
            </Col>
            <Col span={12}>
              <Card
                title="Doubles Tournaments"
                bordered={false}
                style={{ backgroundColor: '#ffffff' }}
              >
                {doublesTournaments}
              </Card>
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Row gutter={16}>
            <Col span={12}>
              <Card
                title="Tournament Types"
                bordered={false}
                style={{ backgroundColor: '#ffffff' }}
              >
                <Pie {...pieConfig(tournamentTypeData, 'value', 'type')} />
              </Card>
            </Col>
            <Col span={12}>
              <Card
                title="Tournament Status"
                bordered={false}
                style={{ backgroundColor: '#ffffff' }}
              >
                <Pie {...pieConfig(tournamentStatusData, 'value', 'status')} />
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
      <Button
        type="primary"
        onClick={() => refetch()}
        style={{ marginBottom: 16 }}
      >
        Refetch
      </Button>
      <Table
        columns={columns}
        dataSource={data}
        loading={isLoading}
        rowKey="id"
        style={{ backgroundColor: '#ffffff' }}
      />
    </div>
  );
};

export default OverviewPage;
