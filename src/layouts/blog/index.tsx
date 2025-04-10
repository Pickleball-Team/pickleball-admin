  import { HomeOutlined, TrophyOutlined } from '@ant-design/icons';
  import { Link, Outlet, useLocation } from 'react-router-dom';
  import { PageHeader } from '../../components/index.ts';
  import { BLOG_ITEMS } from '../../constants/index.ts';
  import { AppLayout } from '../index.ts';

  // todo: review
  export const BlogLayout = () => {
    const { pathname } = useLocation();
    return (
      <>
        <AppLayout>
          <PageHeader
            title="Blog"
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
                  items: BLOG_ITEMS.map((d) => ({
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
