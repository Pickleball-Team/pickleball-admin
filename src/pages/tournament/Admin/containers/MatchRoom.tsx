import {
  CalendarOutlined,
  LockFilled,
  MailFilled,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { InputRef } from 'antd';
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Input,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import Title from 'antd/es/typography/Title';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetMatchByTournamentId } from '../../../../modules/Tournaments/hooks/useGetMatchByTournamentId';
import { useGetVenueBySponnerId } from '../../../../modules/Venues/hooks/useGetVenueBySponnerId';
import { useGetAllReferees } from '../../../../modules/User/hooks/useGetAllReferees';
import { Match, Member } from '../../../../modules/Tournaments/models';
import { RootState } from '../../../../redux/store';
import { User } from '../../../../modules/User/models';
import { fetchUserById } from '../../../../modules/User/hooks/useGetUserById';
import { useGetVenueAll } from '../../../../modules/Venues/hooks/useGetAllVenus';

const { Text } = Typography;
const { Option } = Select;
const { Meta } = Card;

type DataIndex = string;

type MatchRoomProps = {
  id: number;
};

const MatchRoom = ({ id }: MatchRoomProps) => {
  const user = useSelector((state: RootState) => state.authencation.user);
  const {
    data: matchData,
    isLoading: isLoadingMatches,
    error: errorMatches,
    refetch,
  } = useGetMatchByTournamentId(Number(id));
  const { data: venues } = useGetVenueAll()
  const { data: referees } = useGetAllReferees();
  const [userDetails, setUserDetails] = useState<any[]>([]);
  const [filteredDetails, setFilteredDetails] = useState<Match[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchText, setSearchText] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState<string>('');
  const searchInput = useRef<InputRef>(null);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!matchData || !matchData.length) {
      return {
        totalMatches: 0,
        scheduled: 0,
        ongoing: 0,
        completed: 0,
      };
    }

    return {
      totalMatches: matchData.length,
      scheduled: matchData.filter(match => match.status === 1).length,
      ongoing: matchData.filter(match => match.status === 3).length,
      completed: matchData.filter(match => match.status === 2).length,
    };
  }, [matchData]);

  // matchData member của team có sự lặp lại cache lại data hạn chế request đến DB
  const userCache = useRef<Map<number, User>>(new Map());

  useEffect(() => {
    if (Array.isArray(matchData)) {
      const userIds = matchData.flatMap(
        (match) =>
          match?.teamResponse?.flatMap((team) =>
            team.members.map((member) => member.playerId)
          )
      );

      const fetchUsers = async () => {
        const uniqueUserIds = Array.from(new Set(userIds));
        const userPromises = uniqueUserIds.map(async (id) => {
          if (userCache.current.has(id)) {
            return userCache.current.get(id);
          } else {
            const user = await fetchUserById(id);
            userCache.current.set(id, user);
            return user;
          }
        });

        const users = await Promise.all(userPromises);
        setUserDetails(users);
      };

      fetchUsers();
    }
  }, [matchData]);

  useEffect(() => {
    if (filterStatus === 'All') {
      setFilteredDetails(matchData || []);
    } else {
      const filteredMatches =
        matchData?.filter((match) => match.status === Number(filterStatus)) || [];
      setFilteredDetails(filteredMatches);
    }
  }, [filterStatus, matchData]);

  const getUserById = (id: number) =>
    userDetails.find((user: User) => user?.id === id);

  const getVenueById = (id: number) => venues?.find((venue) => venue.id === id);

  const getRefereeById = (id: number) =>
    referees?.find((referee) => referee.id === id);

  const getResultTagColor = (status: number) => {
    switch (status) {
      case 1:
        return 'blue';
      case 2:
        return 'green';
      case 3:
        return 'orange';
      default:
        return 'gray';
    }
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

  const columns: ColumnsType<any> = [
    {
      title: 'Match Title',
      dataIndex: 'title',
      key: 'title',
      ...getColumnSearchProps('title'),
      render: (text: string) => (
        <Text strong>{text}</Text>
      ),
    },
    {
      title: 'Match Date',
      dataIndex: 'matchDate',
      key: 'matchDate',
      render: (text: string) => (
        <Space>
          <CalendarOutlined />
          <Text>{new Date(text).toLocaleString()}</Text>
        </Space>
      ),
      sorter: (a, b) =>
        new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime(),
      sortDirections: ['ascend', 'descend'],
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => {
        const color = getResultTagColor(status);
        const text = status === 1 ? 'Scheduled' : status === 2 ? 'Completed' : 'Ongoing';
        const icon = status === 1 ? <CalendarOutlined /> : 
                    status === 2 ? <TrophyOutlined /> : <TeamOutlined />;
        
        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      },
      filters: [
        { text: 'Scheduled', value: 1 },
        { text: 'Completed', value: 2 },
        { text: 'Ongoing', value: 3 },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Venue & Referee',
      dataIndex: 'venueId',
      key: 'venueId',
      render: (venueId: number, record: Match) => {
        const venue = getVenueById(venueId);
        const referee = getRefereeById(record?.refereeId || 0);
        return venue ? (
          <Card
            hoverable
            style={{ width: 280, boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
            cover={
              <img
                height={120}
                alt="venue"
                style={{ objectFit: 'cover' }}
                src={venue.urlImage}
              />
            }
          >
            <Meta title={venue.name} description={venue.address} />
            {referee && (
              <div style={{ marginTop: 12 }}>
                <Title level={5} style={{ marginBottom: 8 }}>Referee</Title>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  background: '#f5f5f5',
                  padding: '8px', 
                  borderRadius: '4px' 
                }}>
                  <Avatar size="large" src={referee.avatarUrl} />
                  <div style={{ marginLeft: 12 }}>
                    <Text strong>{referee.firstName} {referee.lastName}</Text>
                    <div>
                      <Text type="secondary">
                        <MailFilled /> {referee.email}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ) : (
          <Tag color="warning" style={{ padding: '4px 8px' }}>No venue assigned</Tag>
        );
      },
    },
    {
      title: 'Teams',
      key: 'team',
      render: (text: any, record: Match) => {
        const team1 = record.teamResponse?.[0];
        const team2 = record?.teamResponse?.[1];
        
        return (
          <div style={{ width: '100%' }}>
            {/* Team 1 */}
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <TeamOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  <span>Team 1</span>
                </div>
              }
              bordered
              style={{ marginBottom: 16, background: '#f0f8ff', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}
              size="small"
            >
              {team1 && Array.isArray(team1.members) ? (
                <div>
                  {team1.members.map((member: Member, index) => {
                    const user = getUserById(member.playerId);
                    return user ? (
                      <div
                        key={`team1-${member.playerId}-${index}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: 6,
                          backgroundColor: '#fff',
                          marginBottom: 8,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar src={user.avatarUrl} />
                          <Text strong style={{ marginLeft: 12 }}>
                            {user.firstName} {user.lastName}
                          </Text>
                        </div>
                        <div>
                          <Tooltip title={user.email}>
                            <Text type="secondary">
                              <MailFilled /> {user.email}
                            </Text>
                          </Tooltip>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              ) : (
                <Empty description="No team members" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>

            {/* Team 2 */}
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <TeamOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                  <span>Team 2</span>
                </div>
              }
              bordered
              style={{ background: '#fffbe6', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}
              size="small"
            >
              {team2 && Array.isArray(team2.members) ? (
                <div>
                  {team2.members.map((member: Member, index) => {
                    const user = getUserById(member.playerId);
                    return user ? (
                      <div
                        key={`team2-${member.playerId}-${index}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: 6,
                          backgroundColor: '#fff',
                          marginBottom: 8,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar src={user.avatarUrl} />
                          <Text strong style={{ marginLeft: 12 }}>
                            {user.firstName} {user.lastName}
                          </Text>
                        </div>
                        <div>
                          <Tooltip title={user.email}>
                            <Text type="secondary">
                              <MailFilled /> {user.email}
                            </Text>
                          </Tooltip>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              ) : (
                <Empty description="No team members" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>
          </div>
        );
      },
    },
  ];

  if (isLoadingMatches) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Space direction="vertical" size="large" align="center">
          <div className="ant-spin ant-spin-lg ant-spin-spinning">
            <span className="ant-spin-dot ant-spin-dot-spin">
              <i className="ant-spin-dot-item"></i>
              <i className="ant-spin-dot-item"></i>
              <i className="ant-spin-dot-item"></i>
              <i className="ant-spin-dot-item"></i>
            </span>
          </div>
          <Text>Loading match data...</Text>
        </Space>
      </div>
    );
  }

  if (errorMatches) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Space direction="vertical" size="large" align="center">
          <div style={{ fontSize: '48px', color: '#ff4d4f' }}>
            <i className="anticon anticon-warning" />
          </div>
          <Text type="danger">Error loading matches: {(errorMatches as Error).message}</Text>
          <Button type="primary" onClick={() => refetch()}>Try Again</Button>
        </Space>
      </div>
    );
  }

  return (
    <div className="match-room-container">
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)', borderRadius: 8 }}>
            <Statistic
              title={<Text strong>Total Matches</Text>}
              value={statistics.totalMatches}
              valueStyle={{ color: '#1890ff' }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)', borderRadius: 8 }}>
            <Statistic
              title={<Text strong>Scheduled</Text>}
              value={statistics.scheduled}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CalendarOutlined />}
              suffix={<Text type="secondary" style={{ fontSize: '14px' }}>{`(${Math.round((statistics.scheduled / statistics.totalMatches || 0) * 100)}%)`}</Text>}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)', borderRadius: 8 }}>
            <Statistic
              title={<Text strong>Ongoing</Text>}
              value={statistics.ongoing}
              valueStyle={{ color: '#faad14' }}
              prefix={<TeamOutlined />}
              suffix={<Text type="secondary" style={{ fontSize: '14px' }}>{`(${Math.round((statistics.ongoing / statistics.totalMatches || 0) * 100)}%)`}</Text>}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)', borderRadius: 8 }}>
            <Statistic
              title={<Text strong>Completed</Text>}
              value={statistics.completed}
              valueStyle={{ color: '#eb2f96' }}
              prefix={<TrophyOutlined />}
              suffix={<Text type="secondary" style={{ fontSize: '14px' }}>{`(${Math.round((statistics.completed / statistics.totalMatches || 0) * 100)}%)`}</Text>}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter Controls */}
      <Row style={{ marginBottom: 16 }} align="middle">
        <Col span={16}>
          <Space size="large">
            <Text strong>Filter by Status:</Text>
            <Select
              defaultValue="All"
              style={{ width: 150 }}
              onChange={(value) => setFilterStatus(value)}
            >
              <Option value="All">All Matches</Option>
              <Option value="1">
                <Space>
                  <CalendarOutlined />
                  <span>Scheduled</span>
                </Space>
              </Option>
              <Option value="3">
                <Space>
                  <TeamOutlined />
                  <span>Ongoing</span>
                </Space>
              </Option>
              <Option value="2">
                <Space>
                  <TrophyOutlined />
                  <span>Completed</span>
                </Space>
              </Option>
            </Select>
            <Input.Search 
              placeholder="Search match title" 
              style={{ width: 250 }}
              onSearch={(value) => {
                const filtered = matchData?.filter(match => 
                  match.title.toLowerCase().includes(value.toLowerCase())
                ) || [];
                setFilteredDetails(filtered);
              }}
              allowClear
            />
          </Space>
        </Col>
        <Col span={8} style={{ textAlign: 'right' }}>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
          >
            Refresh Matches
          </Button>
        </Col>
      </Row>

      <Divider orientation="left">Match List</Divider>

      {/* Matches Table */}
      <Table 
        columns={columns} 
        dataSource={filteredDetails || []} 
        rowKey="id"
        pagination={{ 
          showTotal: (total) => `Total ${total} matches`,
          showQuickJumper: true,
        }}
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ padding: '20px' }}>
              <Row gutter={24}>
                <Col span={12}>
                  <Card title="Match Details" bordered={false} style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <p><strong>Match ID:</strong> {record.id}</p>
                    <p><strong>Title:</strong> {record.title}</p>
                    <p><strong>Date:</strong> {new Date(record.matchDate).toLocaleString()}</p>
                    <p><strong>Status:</strong> {
                      record.status === 1 ? 'Scheduled' : 
                      record.status === 2 ? 'Completed' : 'Ongoing'
                    }</p>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="Additional Information" bordered={false} style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <p><strong>Created:</strong> {record.createdDate ? new Date(record.createdDate).toLocaleString() : 'N/A'}</p>
                    <p><strong>Last Updated:</strong> {record.updatedDate ? new Date(record.updatedDate).toLocaleString() : 'N/A'}</p>
                    <p><strong>Notes:</strong> {record.note || 'No notes available'}</p>
                  </Card>
                </Col>
              </Row>
            </div>
          ),
        }}
        bordered
        style={{ 
          backgroundColor: '#ffffff',
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
        }}
      />
    </div>
  );
};

export default MatchRoom;
