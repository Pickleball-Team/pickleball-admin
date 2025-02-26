import { HomeOutlined, TrophyOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { PageHeader } from '../../components';
import { TOURNAMENT_ITEMS } from '../../constants/index.ts';
import { AppLayout } from '../index.ts';

// todo: review
export const TournamentLayout = () => {
  const { pathname } = useLocation();
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
        <Outlet />
      </AppLayout>
    </>
  );
};
