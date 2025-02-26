import { HomeOutlined, TrophyOutlined } from '@ant-design/icons';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { PageHeader } from '../../components/index.ts';
import { AppLayout } from '../index.ts';
import { AUTHENTICATION_SYS_ITEMS } from '../../constants/index.ts';

// todo: review
export const AuthenticationLayout = () => {
  const { pathname } = useLocation();
  return (
    <>
      <AppLayout>
        <PageHeader
          title="Authentication"
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
                  <span>Authentication</span>
                </>
              ),
              menu: {
                items: AUTHENTICATION_SYS_ITEMS.map((d) => ({
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
