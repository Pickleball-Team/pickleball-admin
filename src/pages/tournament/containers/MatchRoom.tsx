import { LockFilled, MailFilled, SearchOutlined, UserOutlined } from '@ant-design/icons';
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
import Title from 'antd/es/typography/Title';

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
      title: 'Venue & Referee',
      dataIndex: 'venueId',
      key: 'venueId',
      render: (venueId: number, record: Match) => {
        const venue = getVenueById(venueId);
        const referee = getRefereeById(record?.refereeId || 0);
        return venue ? (
          <Card
            hoverable
            style={{ width: 280 }}
            cover={
              <img
                width={100}
                height={100}
                alt="venue"
                style={{ objectFit: 'cover' }}
                src={venue.urlImage}
              />
            }
          >
            <Meta title={venue.name} description={venue.address} />
            {referee && (
              <div>
                <Title level={5}>Referee</Title>
                <div>
                  <Avatar src={referee.avatarUrl} />
                  <Text style={{ marginLeft: 8, marginTop: 8 }}>
                    {referee.firstName} {referee.lastName}
                  </Text>
                </div>
                <div>
                  <Text>
                    <MailFilled /> {referee.email}
                  </Text>
                  <br />
                </div>
              </div>
            )}
          </Card>
        ) : (
          <Tag color="warning">No venue</Tag>
        );
      },
    },
    {
      title: 'Team',
      key: 'team',
      render: (text: any, record: Match) => {
        const team1 = record.teamResponse?.[0];
        const team2 = record?.teamResponse?.[1];
        return (
          <>
            <>
              <Title level={5}><UserOutlined /> Team 1</Title>
              <div className="">
                {team1 && Array.isArray(team1.members) ? (
                  team1.members.map((member: Member) => {
                    const user = getUserById(member.playerId);
                    return user ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '5px 10px',
                          borderRadius: 5,
                          backgroundColor: '#fff',
                        }}
                      >
                        <div>
                          <Avatar src={user.avatarUrl} />
                          <Text style={{ marginLeft: 8, marginTop: 8 }}>
                            {user.firstName} {user.lastName}
                          </Text>
                        </div>
                        <div>
                          <Text>
                            <MailFilled /> {user.email}
                          </Text>
                          <br />
                          <Text>
                            <LockFilled />{' '}
                            {new Date(
                              user.userDetails?.joinedAt
                            ).toLocaleString()}
                          </Text>
                        </div>
                      </div>
                    ) : null;
                  })
                ) : (
                  <Tag color="warning">No members</Tag>
                )}
              </div>
            </>
            <>
              <Title level={5}><UserOutlined /> Team 2</Title>
              <div className="">
                {team2 && Array.isArray(team2.members) ? (
                  team2.members.map((member: Member) => {
                    const user = getUserById(member.playerId);
                    return user ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '5px 10px',
                          borderRadius: 5,
                          backgroundColor: '#fff',
                        }}
                      >
                        <div>
                          <Avatar src={user.avatarUrl} />
                          <Text style={{ marginLeft: 8, marginTop: 8 }}>
                            {user.firstName} {user.lastName}
                          </Text>
                        </div>
                        <div>
                          <Text>
                            <MailFilled /> {user.email}
                          </Text>
                          <br />
                          <Text>
                            <LockFilled />{' '}
                            {new Date(
                              user.userDetails?.joinedAt
                            ).toLocaleString()}
                          </Text>
                        </div>
                      </div>
                    ) : null;
                  })
                ) : (
                  <Tag color="warning">No members</Tag>
                )}
              </div>
            </>
          </>
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
          onClose={() => {
            setIsUpdateModalVisible(false);
            setSelectedMatch(null); 
          }}
          match={selectedMatch}
          refetch={refetch}
        />
      )}
    </div>
  );
};

export default MatchRoom;
