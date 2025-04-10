import React, { useEffect, useState } from 'react';
import { Card, Typography, Divider, Tag, Spin, Row, Col, Select, Avatar } from 'antd';
import { fetchUserById } from '../../../modules/User/hooks/useGetUserById';

const { Text } = Typography;
const { Option } = Select;

type TournamentMatchDetail = {
  id: number;
  scheduledTime: string;
  score: string;
  result: string;
  playerId1: number;
  playerId2: number;
  playerId3: number;
  playerId4: number;
};

type TournamentMatchesProps = {
  details: TournamentMatchDetail[];
};

const TournamentMatches = ({ details = [] }: TournamentMatchesProps) => {
  const [userDetails, setUserDetails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredDetails, setFilteredDetails] = useState<TournamentMatchDetail[]>(details);
  const [filter, setFilter] = useState<string>('All');

  useEffect(() => {
    const fetchUsers = async () => {
      const userIds = details.map(detail => [
        detail.playerId1,
        detail.playerId2,
        detail.playerId3,
        detail.playerId4,
      ]).flat().filter(id => id !== 0);

      const userPromises = userIds.map(id => fetchUserById(id));
      const users = await Promise.all(userPromises);
      setUserDetails(users);
      setIsLoading(false);
    };

    fetchUsers();
  }, [details]);

  useEffect(() => {
    if (filter === 'All') {
      setFilteredDetails(details);
    } else {
      setFilteredDetails(details.filter(detail => detail.result === filter));
    }
  }, [filter, details]);

  const getUserById = (id: number) => userDetails.find(user => user.id === id);

  const getResultTagColor = (result: string) => {
    switch (result) {
      case 'Scheduled':
        return 'blue';
      case 'Completed':
        return 'green';
      case 'Ongoing':
        return 'orange';
      default:
        return 'gray';
    }
  };

  if (isLoading) {
    return <Spin size="large" />;
  }

  return (
    <div>
      <Select
        defaultValue="All"
        style={{ width: 200, marginBottom: 16 }}
        onChange={(value) => setFilter(value)}
      >
        <Option value="All">All</Option>
        <Option value="Scheduled">Scheduled</Option>
        <Option value="Completed">Completed</Option>
        <Option value="Ongoing">Ongoing</Option>
      </Select>
      <Row gutter={[16, 16]}>
        {filteredDetails.map((detail) => (
          <Col span={24} key={detail.id}>
            <Card bordered={false}>
              <Text strong>
                <strong>Scheduled Time:</strong>{' '}
                {new Date(detail.scheduledTime).toLocaleString()}
              </Text>
              <br />
              <Text strong>
                <strong>Score:</strong> {detail.score}
              </Text>
              <br />
              <Text strong>
                <strong>Result:</strong> <Tag color={getResultTagColor(detail.result)}>{detail.result}</Tag>
              </Text>
              <br />
              <Text strong>
                <strong>Players:</strong>
              </Text>
              <br />
              <Row gutter={[16, 16]}>
                {[detail.playerId1, detail.playerId2, detail.playerId3, detail.playerId4].map(playerId => {
                  const user = getUserById(playerId);
                  return user ? (
                    <Col span={12} key={playerId}>
                      <Card bordered={true}>
                        <Avatar src={user.avatarUrl} />
                        <Tag color="blue" style={{ marginLeft: 8 }}>
                          {user.firstName} {user.lastName}
                        </Tag>
                        <br />
                        <Text>Email: {user.email}</Text>
                        <br />
                        <Text>Gender: {user.gender}</Text>
                        <br />
                        <Text>Province: {user.userDetails?.province}</Text>
                        <br />
                        <Text>City: {user.userDetails?.city}</Text>
                        <br />
                        <Text>Joined At: {new Date(user.userDetails?.joinedAt).toLocaleString()}</Text>
                      </Card>
                    </Col>
                  ) : null;
                })}
              </Row>
              <Divider />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default React.memo(TournamentMatches);
