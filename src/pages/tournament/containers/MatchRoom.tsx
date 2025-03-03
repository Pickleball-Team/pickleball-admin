import { LockFilled, MailOutlined, SearchOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import {
  Avatar,
  Button,
  Card,
  Input,
  Select,
  Space,
  Table,
  Tag,
  TimePicker,
  Typography,
} from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { useEffect, useRef, useState } from 'react';
import { IMatch } from '../../../modules/Macths/models';
import { useGetMatchByTournamentId } from '../../../modules/Tournaments/hooks/useGetMatchByTournamentId';
import { Match, Member } from '../../../modules/Tournaments/models';
import { fetchUserById } from '../../../modules/User/hooks/useGetUserById';
import { User } from '../../../modules/User/models';
import AddMatchModal from './AddMatchModal';
import UpdateMatchModal from './UpdateMatchModal';
import { useGetAllReferees } from '../../../modules/User/hooks/useGetAllReferees';
import { useGetVenueBySponnerId } from '../../../modules/Venues/hooks/useGetVenueBySponnerId';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';

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
  const { data: venues } = useGetVenueBySponnerId(user?.id || 0);
  const { data: referees } = useGetAllReferees();
  const [userDetails, setUserDetails] = useState<any[]>([]);
  const [filteredDetails, setFilteredDetails] = useState<Match[]>([]);
  const [filter] = useState<string>('All');
  const [searchText, setSearchText] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState<string>('');
  const searchInput = useRef<InputRef>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<IMatch | null>(null);

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
      title: 'Venue',
      dataIndex: 'venueId',
      key: 'venueId',
      render: (venueId: number) => {
        const venue = getVenueById(venueId);
        return venue ? (
          <Card
            hoverable
            style={{ width: 240 }}
            cover={
              <img width={100} height={100} alt="venue" src={venue.urlImage} />
            }
          >
            <Meta title={venue.name} description={venue.address} />
          </Card>
        ) : (
          <Tag color="warning">No venue</Tag>
        );
      },
    },
    {
      title: 'Referee',
      dataIndex: 'refereeId',
      key: 'refereeId',
      render: (refereeId: number) => {
        const referee = getRefereeById(refereeId);
        return referee ? (
          <Card hoverable style={{ width: 240 }}>
            <Avatar src={referee.avatarUrl} size={40} />
            <Meta
              title={`${referee.firstName} ${referee.lastName}`}
              description={`Email: ${referee.email}`}
            />
          </Card>
        ) : (
          <Tag color="warning">No referee</Tag>
        );
      },
    },
    {
      title: 'Team 1',
      key: 'team1',
      render: (text: any, record: Match) => {
        const team1 = record.teamResponse?.[0];
        return (
          <Card bordered={true} style={{ backgroundColor: '#f6ffed' }}>
            {team1 && Array.isArray(team1.members) ? (
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
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={user.avatarUrl} />
                        
                        <Text style={{ marginLeft: 8, marginTop:8 }}>
                          {user.firstName} {user.lastName}
                        </Text>
                      </div>
                      <Text>
                        <MailOutlined /> {user.email}
                      </Text>
                      <br />
                      <Text>
                        <LockFilled />{' '}
                        {new Date(user.userDetails?.joinedAt).toLocaleString()}
                      </Text>
                    </div>
                  </div>
                ) : null;
              })
            ) : (
              <Tag color="warning">No members</Tag>
            )}
          </Card>
        );
      },
    },
    {
      title: 'Team 2',
      key: 'team2',
      render: (text: any, record: any) => {
        const team2 = record?.teamResponse?.[1];
        return (
          <Card bordered={true} style={{ backgroundColor: '#fffbe6' }}>
            {team2 && Array.isArray(team2.members) ? (
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
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={user.avatarUrl} />
                        <Text style={{ marginLeft: 8 }}>
                          {user.firstName} {user.lastName}
                        </Text>
                      </div>
                      <Text>Email: {user.email}</Text>
                      <br />
                      <Text>
                        Joined At:{' '}
                        {new Date(user.userDetails?.joinedAt).toLocaleString()}
                      </Text>
                    </div>
                  </div>
                ) : null;
              })
            ) : (
              <Tag color="warning">No members</Tag>
            )}
          </Card>
        );
      },
    },
    {
      title: 'Update',
      key: 'update',
      render: (text: any, record: any) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedMatch(record);
            setIsUpdateModalVisible(true);
          }}
        >
          Update
        </Button>
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
        tournamentId={id}
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        refetch={refetch}
      />
      {selectedMatch && (
        <UpdateMatchModal
          visible={isUpdateModalVisible}
          onClose={() => setIsUpdateModalVisible(false)}
          match={selectedMatch}
          refetch={refetch}
        />
      )}
    </div>
  );
};

export default MatchRoom;
