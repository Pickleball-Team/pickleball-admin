import { HomeOutlined, TrophyOutlined } from '@ant-design/icons';
import { Button, Col, Row, Typography } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
    BlogsListCard,
    Card,
    PageHeader,
    SocialMediaCard,
} from '../../components';
import { TOURNAMENT_ITEMS } from '../../constants/index.ts';
import { useStylesContext } from '../../context';
import { AppLayout } from '../index.ts';

const { Text, Title } = Typography;

const BLOGS_DATA = Array.from({ length: 23 }).map((_, i) => ({
  href: 'https://ant.design',
  title: `Lorem ipsum ${i}`,
  avatar: `https://xsgames.co/randomusers/avatar.php?g=pixel&key=${i}`,
  description:
    'Ant Design, a design language for background applications, is refined by Ant UED Team.',
  content:
    'We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure), to help people create their product prototypes beautifully and efficiently.',
}));
// todo: review
export const TournamentLayout = () => {
  const { pathname } = useLocation();
  const stylesContext = useStylesContext();

  return (
    <>
      <AppLayout>
        <PageHeader
          title="tournament"
          breadcrumbs={[
            {
              title: (
                <>
                  <HomeOutlined />
                  <span>home</span>
                </>
              ),
              path: '/',
            },
            {
              title: (
                <>
                  <TrophyOutlined />
                  <span>tournament</span>
                </>
              ),
              menu: {
                items: TOURNAMENT_ITEMS.map((d) => ({
                  key: d.title,
                  title: <Link to={d.path}>{d.title}</Link>,
                })),
              },
            },
            {
              title: pathname.split('/')[pathname.split('/').length - 1] || '',
            },
          ]}
        />
        <Row {...stylesContext?.rowProps}>
          <Col xs={24} md={16} xl={18}>
            <Outlet />
          </Col>
          <Col xs={24} md={8} xl={6}>
            <Row {...stylesContext?.rowProps}>
              <Col span={24}>
                <Card title="Upcoming Matches" actions={[<Button>Explore more</Button>]}>
                  <Text>
                    Stay tuned for the upcoming matches and schedules. Make sure to follow your favorite teams and players.
                  </Text>
                  <Title level={5}>Highlights</Title>
                  <ul>
                    <li>Top Teams</li>
                    <li>Match Schedules</li>
                    <li>Live Scores</li>
                    <li>Player Stats</li>
                  </ul>
                  <Title level={5}>Achievements</Title>
                  <ul>
                    <li>Championship Titles</li>
                    <li>Top Scorers</li>
                    <li>Best Performances</li>
                  </ul>
                </Card>
              </Col>
              <Col span={24}>
                <BlogsListCard data={BLOGS_DATA} />
              </Col>
              <Col span={24}>
                <SocialMediaCard />
              </Col>
            </Row>
          </Col>
        </Row>
      </AppLayout>
    </>
  );
};
