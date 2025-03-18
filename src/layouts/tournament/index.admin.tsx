import { HomeOutlined, TrophyOutlined } from '@ant-design/icons';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { PageHeader } from '../../components';
import { TOURNAMENT_ADMIN_ITEMS } from '../../constants/index.ts';
import { AppLayout } from '../index.ts';

// todo: review
export const TournamentAdminLayout = () => {
    const { pathname } = useLocation();
    return (
        <>
            <AppLayout>
                <PageHeader
                    title="Tournament Admin"
                    breadcrumbs={[
                        {
                            title: (
                                <>
                                    <HomeOutlined />
                                    <span>Home</span>
                                </>
                            ),
                            path: '/',
                        },
                        {
                            title: (
                                <>
                                    <TrophyOutlined />
                                    <span>Tournament Admin</span>
                                </>
                            ),
                            menu: {
                                items: TOURNAMENT_ADMIN_ITEMS.map((d) => ({
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
