import {
  CrownOutlined,
  RiseOutlined,
  StarOutlined,
  TeamOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { Avatar, Badge, Card, Col, Empty, Row, Spin, Table, Tag, Tooltip, Typography } from 'antd';
import React, { useMemo } from 'react';
import { useGetLeaderboardByTournamentId } from '../modules/Tournaments/hooks/useGetLeaderboardByTournamentId';
import { RankPlayer } from '../modules/Tournaments/models';

const { Title, Text } = Typography;

interface RankProps {
  tournamentId: number;
}

const Rank: React.FC<RankProps> = ({ tournamentId }) => {
  const { data: leaderboard, isLoading, error } = useGetLeaderboardByTournamentId(tournamentId);

  const topThreePlayers = useMemo(() => {
    if (!leaderboard || leaderboard.length === 0) return [];
    return leaderboard.slice(0, 3);
  }, [leaderboard]);

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return '#f0f0f0';
    }
  };

  const getIconForRank = (rank: number) => {
    switch (rank) {
      case 1:
        return <TrophyOutlined style={{ color: '#FFD700', fontSize: '24px' }} />;
      case 2:
        return <CrownOutlined style={{ color: '#C0C0C0', fontSize: '24px' }} />;
      case 3:
        return <RiseOutlined style={{ color: '#CD7F32', fontSize: '24px' }} />;
      default:
        return null;
    }
  };

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🏆';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  const getRankLabel = (rank: number) => {
    switch (rank) {
      case 1:
        return 'Champion';
      case 2:
        return 'Runner-up';
      case 3:
        return 'Third Place';
      default:
        return '';
    }
  };

  const columns = [
    {
      title: 'Rank',
      key: 'position',
      width: 80,
      render: (_: any, __: any, index: number) => (
        <Tag 
          color="#108ee9" 
          style={{ 
            fontSize: '16px', 
            padding: '2px 8px',
            borderRadius: '12px'
          }}
        >
          #{index + 1}
        </Tag>
      ),
    },
    {
      title: 'Player',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name: string, record: RankPlayer) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            size="large" 
            src={record.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`}
            style={{ marginRight: 8 }}
          />
          <Text strong>{name}</Text>
        </div>
      ),
    },
    {
      title: 'Experience Level',
      dataIndex: 'exeprienceLevel',
      key: 'exeprienceLevel',
      render: (level: number) => (
        <Tag color="purple">{level}</Tag>
      ),
    },
    {
      title: 'Matches',
      dataIndex: 'totalMatch',
      key: 'totalMatch',
      render: (totalMatch: number) => (
        <Tooltip title="Total matches played">
          <Tag color="blue">
            <TeamOutlined /> {totalMatch}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Wins',
      dataIndex: 'totalWins',
      key: 'totalWins',
      render: (totalWins: number) => (
        <Tag color="green">{totalWins}</Tag>
      ),
    },
    {
      title: 'Ranking Points',
      dataIndex: 'rankingPoint',
      key: 'rankingPoint',
      render: (rankingPoint: number) => (
        <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
          {rankingPoint}
        </Text>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <Text style={{ display: 'block', marginTop: 16 }}>Loading leaderboard...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Failed to load leaderboard data"
      />
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No ranking data available for this tournament"
      />
    );
  }

  return (
    <div>
      <Title level={3} style={{ textAlign: 'center', marginBottom: 50 }}>
        <TrophyOutlined style={{ color: '#faad14', marginRight: 8 }} />
        Tournament Champions
      </Title>

      <Row gutter={[32, 32]} style={{ marginBottom: 48 }}>
        {[...topThreePlayers].sort((a, b) => {
          const indexA = topThreePlayers.indexOf(a);
          const indexB = topThreePlayers.indexOf(b);
          const order = [1, 0, 2]; 
          return order[indexA] - order[indexB];
        }).map((player: RankPlayer, index: number) => {
          const actualIndex = topThreePlayers.indexOf(player);
          const rank = actualIndex + 1;
          const isChampion = rank === 1;
          const columnSpan ={ xs: 24, sm: 24, md: 8 };
          
          return (
            <Col key={player.userId} {...columnSpan} style={{ 
              display: 'flex',
              justifyContent: 'center',
              alignItems: isChampion ? 'flex-start' : 'flex-end',
            }}>
              <Badge.Ribbon 
                text={
                  <span style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: '200px',
                    gap: '5px',
                    fontSize: isChampion ? '16px' : '14px',
                    padding: '0 5px'
                  }}>
                    {getMedalIcon(rank)} {getRankLabel(rank)}
                  </span>
                } 
                color={getMedalColor(rank)}
                style={{ zIndex: 2 }}
              >
                <Card 
                  bordered
                  style={{ 
                    width: '100%',
                    background: `linear-gradient(135deg, ${getMedalColor(rank)}30, white)`,
                    boxShadow: isChampion ? 
                      `0 10px 25px rgba(255, 215, 0, 0.3), 0 0 20px ${getMedalColor(rank)}40` : 
                      `0 5px 15px rgba(0, 0, 0, 0.1), 0 0 10px ${getMedalColor(rank)}30`,
                    borderRadius: '12px',
                    height: '100%',
                    transform: isChampion ? 'translateY(-20px) scale(1.08)' : 'scale(1)',
                    transition: 'all 0.5s ease',
                    position: 'relative',
                    overflow: 'visible',
                    textAlign: 'center',
                    maxWidth: '350px',
                    padding: isChampion ? '10px' : '0',
                    borderTop: `4px solid ${getMedalColor(rank)}`,
                  }}
                  className={`rank-${rank}-card`}
                  hoverable
                  bodyStyle={{ 
                    padding: isChampion ? '20px 25px' : '15px 20px',
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  {isChampion && (
                    <div style={{
                      position: 'absolute',
                      top: '-30px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '40px',
                      filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.2))',
                      animation: 'float 3s ease-in-out infinite',
                      zIndex: 3
                    }}>
                      👑
                    </div>
                  )}

                  <div style={{ position: 'relative' }}>
                    {isChampion && (
                      <div style={{
                        position: 'absolute',
                        top: '-5px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '120px',
                        height: '120px',
                        background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(255,255,255,0) 70%)',
                        borderRadius: '50%',
                        zIndex: 0
                      }}/>
                    )}
                    
                    <Avatar 
                      size={isChampion ? 120 : 100} 
                      src={player.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${player.fullName}`}
                      style={{ 
                        margin: '8px auto 16px',
                        border: `4px solid ${getMedalColor(rank)}`,
                        boxShadow: isChampion ? 
                          `0 0 0 4px rgba(255,255,255,0.8), 0 5px 15px rgba(0,0,0,0.2)` :
                          `0 2px 8px rgba(0,0,0,0.2)`,
                        position: 'relative',
                        zIndex: 1
                      }}
                    />
                    
                    <Title level={isChampion ? 3 : 4} style={{ 
                      marginBottom: 8, 
                      color: isChampion ? '#5c3c00' : (rank === 2 ? '#494949' : '#5c2700')
                    }}>
                      {player.fullName}
                    </Title>
                    
                    {isChampion ? (
                      <div style={{ 
                        margin: '15px 0',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <StarOutlined style={{ fontSize: '24px', color: '#FFD700' }} />
                        <Text strong style={{ 
                          fontSize: '20px', 
                          background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                          Tournament Champion
                        </Text>
                        <StarOutlined style={{ fontSize: '24px', color: '#FFD700' }} />
                      </div>
                    ) : (
                      <Tag 
                        icon={getIconForRank(rank)}
                        color={getMedalColor(rank)} 
                        style={{ 
                          padding: '2px 15px', 
                          fontSize: '16px',
                          borderRadius: '15px',
                          fontWeight: 'bold',
                          margin: '8px 0 16px'
                        }}
                      >
                        {getRankLabel(rank)}
                      </Tag>
                    )}
                    
                    <Row gutter={[8, 8]} style={{ textAlign: 'center' }}>
                      
                      <Col span={12}>
                        <Card size="small" style={{ 
                          background: '#f6ffed', 
                          borderColor: '#b7eb8f',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                          borderRadius: '8px'
                        }}>
                          <Text type="secondary">Wins</Text>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'green' }}>{player.totalWins}</div>
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card size="small" style={{ 
                          background: isChampion ? 'linear-gradient(120deg, #ffd700, #f8c404)' : '#fff2e8', 
                          borderColor: isChampion ? '#ffd700' : '#ffbb96',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                          borderRadius: '8px'
                        }}>
                          <Text type="secondary" style={{ color: isChampion ? '#5c3c00' : undefined }}>Points</Text>
                          <div style={{ 
                            fontSize: isChampion ? '22px' : '18px', 
                            fontWeight: 'bold', 
                            color: isChampion ? '#5c3c00' : '#fa541c'
                          }}>
                            {player.rankingPoint}
                          </div>
                        </Card>
                      </Col>
                    </Row>

        
                  </div>
                </Card>
              </Badge.Ribbon>
            </Col>
          );
        })}
      </Row>

      <Card bordered style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <Table 
          columns={columns} 
          dataSource={leaderboard} 
          rowKey="userId"
          pagination={{ pageSize: 10 }}
          style={{ marginTop: 16 }}
          rowClassName={(record: RankPlayer, index) => {
            if (index < 3) {
              return `rank-${index + 1}-row`;
            }
            return '';
          }}
        />
      </Card>

      <style>
        {`
        @keyframes float {
          0% { transform: translateX(-50%) translateY(0px); }
          50% { transform: translateX(-50%) translateY(-10px); }
          100% { transform: translateX(-50%) translateY(0px); }
        }
        
        .rank-1-card:hover {
          transform: translateY(-25px) scale(1.1);
          box-shadow: 0 15px 30px rgba(255, 215, 0, 0.4), 0 0 30px rgba(255, 215, 0, 0.2);
        }
        
        .rank-2-card:hover, .rank-3-card:hover {
          transform: translateY(-10px) scale(1.05);
        }
        `}
      </style>
    </div>
  );
};

export default Rank;