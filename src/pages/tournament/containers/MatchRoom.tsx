import React, { useEffect, useState, useRef } from 'react';
import {
  Card,
  Typography,
  Tag,
  Spin,
  Row,
  Col,
  Select,
  Avatar,
  Table,
  Input,
  Button,
  Space,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { fetchUserById } from '../../../modules/User/hooks/useGetUserById';
import { useGetMatchByTournamentId } from '../../../modules/Tournaments/hooks/useGetMatchByTournamentId';
import { Match, Member, Team } from '../../../modules/Tournaments/models';
import { User } from '../../../modules/User/models';
import { Loading } from '../../../components/NotificationsCard/Notifications.stories';
import { Link } from 'react-router-dom';
import type { InputRef } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import AddMatchModal from './AddMatchModal';
const { Text } = Typography;
const { Option } = Select;

type DataIndex = string;

type MatchRoomProps = {
  id: number;
};

const MatchRoom = ({ id }: MatchRoomProps) => {
  const {
    data: matchData,
    isLoading: isLoadingMatches,
    error: errorMatches,
  } = useGetMatchByTournamentId(Number(id));
  const [userDetails, setUserDetails] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [filteredDetails, setFilteredDetails] = useState<Match[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [searchText, setSearchText] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState<string>('');
  const searchInput = useRef<InputRef>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // matchData member của team có sự lặp lại cache lại data hạn chế request đến DB
  const userCache = useRef<Map<number, User>>(new Map());

  useEffect(() => {
    if (Array.isArray(matchData)) {
      const userIds = matchData.flatMap((match) =>
        match.teams.flatMap((team) =>
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
    if (filter === 'All') {
      setFilteredDetails(matchData || []);
    } else {
      const filteredMatches =
        matchData?.filter((match) => match.status === Number(filter)) || [];
      setFilteredDetails(filteredMatches);
    }
  }, [filter, matchData]);

  const getUserById = (id: number) =>
    userDetails.find((user: User) => user?.id === id);

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
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ...getColumnSearchProps('description'),
    },
    {
      title: 'Match Date',
      dataIndex: 'matchDate',
      key: 'matchDate',
      render: (text: string) => new Date(text).toLocaleString(),
      sorter: (a, b) =>
        new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime(),
      sortDirections: ['ascend', 'descend'],
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <Tag color={getResultTagColor(status)}>
          {status === 1 ? 'Scheduled' : status === 2 ? 'Completed' : 'Ongoing'}
        </Tag>
      ),
      filters: [
        { text: 'Scheduled', value: 1 },
        { text: 'Completed', value: 2 },
        { text: 'Ongoing', value: 3 },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Team 1',
      key: 'team1',
      render: (text: any, record: any) => {
        const team1 = record.teams[0];
        return (
          <Card bordered={true}>
            {Array.isArray(team1?.members) ? (
              team1.members.map((member: Member) => {
                const user = getUserById(member.playerId);
                return user ? (
                  <div
                    key={member.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <Text>Email: {user.email}</Text>
                      <br />
                      <Text>
                        Joined At:{' '}
                        {new Date(user.userDetails?.joinedAt).toLocaleString()}
                      </Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar src={user.avatarUrl} />
                      <Tag color="blue" style={{ marginLeft: 8 }}>
                        {user.firstName} {user.lastName}
                      </Tag>
                    </div>
                  </div>
                ) : null;
              })
            ) : (
              <Text>No members</Text>
            )}
          </Card>
        );
      },
    },
    {
      title: 'Team 2',
      key: 'team2',
      render: (text: any, record: any) => {
        const team2 = record.teams[1];
        return (
          <Card bordered={true}>
            {Array.isArray(team2?.members) ? (
              team2.members.map((member: Member) => {
                const user = getUserById(member.playerId);
                return user ? (
                  <div
                    key={member.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <Text>Email: {user.email}</Text>
                      <br />
                      <Text>
                        Joined At:{' '}
                        {new Date(user.userDetails?.joinedAt).toLocaleString()}
                      </Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar src={user.avatarUrl} />
                      <Tag color="blue" style={{ marginLeft: 8 }}>
                        {user.firstName} {user.lastName}
                      </Tag>
                    </div>
                  </div>
                ) : null;
              })
            ) : (
              <Text>No members</Text>
            )}
          </Card>
        );
      },
    },
    {
      title: 'Update',
      key: 'update',
      render: (text: any, record: any) => (
        <Link to={`/update/${record.id}`}>Update</Link>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          Add Match
        </Button>
      </Space>
      <Table columns={columns} dataSource={filteredDetails || []} rowKey="id" />
      <AddMatchModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </div>
  );
};

export default MatchRoom;
