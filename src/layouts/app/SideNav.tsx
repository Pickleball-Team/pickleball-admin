import {
  AppstoreAddOutlined,
  BugOutlined,
  PieChartOutlined,
  SnippetsOutlined,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ConfigProvider, Layout, Menu, MenuProps, SiderProps } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { COLOR } from '../../App.tsx';
import { Logo } from '../../components';
import {
  PATH_DASHBOARD,
  PATH_DOCS,
  PATH_ERROR,
  PATH_LANDING,
} from '../../constants';
import { PATH_AUTHENTICATION, PATH_TOURNAMENT } from '../../constants/routes.ts';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

const getItem = (
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group'
): MenuItem => {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
};

const items: MenuProps['items'] = [
  getItem('Authentication', 'authentication', <UserOutlined />, [
    getItem(
      <Link to={PATH_AUTHENTICATION.managerSponsor}>Manager Sponsor</Link>,
      'managerSponsor',
      null
    ),
    getItem(
      <Link to={PATH_AUTHENTICATION.blockUser}>Block User</Link>,
      'blockUser',
      null
    ),
    getItem(
      <Link to={PATH_AUTHENTICATION.managerPlayer}>Manager Player</Link>,
      'managerPlayer',
      null
    ),
  ]),

  getItem('Dashboards', 'dashboards', <PieChartOutlined />, [
    getItem(<Link to={PATH_DASHBOARD.default}>Default</Link>, 'default', null),
    getItem(
      <Link to={PATH_DASHBOARD.projects}>Projects</Link>,
      'projects',
      null
    ),
  ]),

  getItem('Errors', 'errors', <BugOutlined />, [
    getItem(<Link to={PATH_ERROR.error400}>400</Link>, '400', null),
    getItem(<Link to={PATH_ERROR.error403}>403</Link>, '403', null),
    getItem(<Link to={PATH_ERROR.error404}>404</Link>, '404', null),
    getItem(<Link to={PATH_ERROR.error500}>500</Link>, '500', null),
    getItem(<Link to={PATH_ERROR.error503}>503</Link>, '503', null),
  ]),
  // todo: review
  getItem('Tournament', 'tournament', <TrophyOutlined />, [
    getItem(
      <Link to={PATH_TOURNAMENT.overview}>Overview</Link>,
      'overview',
      null
    ),
    getItem(
      <Link to={PATH_TOURNAMENT.schedule}>Schedule</Link>,
      'schedule',
      null
    ),
    getItem(<Link to={PATH_TOURNAMENT.teams}>Teams</Link>, 'teams', null),
    getItem(<Link to={PATH_TOURNAMENT.results}>Results</Link>, 'results', null),
    getItem(
      <Link to={PATH_TOURNAMENT.standings}>Standings</Link>,
      'standings',
      null
    ),
  ]),

  getItem(
    <Link to={PATH_DOCS.components} target="_blank">
      Components
    </Link>,
    'components',
    <AppstoreAddOutlined />
  ),
  getItem(
    <Link to={PATH_DOCS.help} target="_blank">
      Documentation
    </Link>,
    'documentation',
    <SnippetsOutlined />
  ),
];

const rootSubmenuKeys = [
  'dashboards',
  'corporate',
  'user-profile',
  'tournament',
];

type SideNavProps = SiderProps;

const SideNav = ({ ...others }: SideNavProps) => {
  const nodeRef = useRef(null);
  const { pathname } = useLocation();
  const [openKeys, setOpenKeys] = useState(['']);
  const [current, setCurrent] = useState('');

  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e);
  };

  const onOpenChange: MenuProps['onOpenChange'] = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (latestOpenKey && rootSubmenuKeys.indexOf(latestOpenKey!) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

  useEffect(() => {
    const paths = pathname.split('/');
    setOpenKeys(paths);
    setCurrent(paths[paths.length - 1]);
  }, [pathname]);

  return (
    <Sider ref={nodeRef} breakpoint="lg" collapsedWidth="0" {...others}>
      <Logo
        color="blue"
        asLink
        href={PATH_LANDING.root}
        justify="center"
        gap="small"
        imgSize={{ h: 28, w: 28 }}
        style={{ padding: '1rem 0' }}
      />
      <ConfigProvider
        theme={{
          components: {
            Menu: {
              itemBg: 'none',
              itemSelectedBg: COLOR['100'],
              itemHoverBg: COLOR['50'],
              itemSelectedColor: COLOR['600'],
            },
          },
        }}
      >
        <Menu
          mode="inline"
          items={items}
          onClick={onClick}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          selectedKeys={[current]}
          style={{ border: 'none' }}
        />
      </ConfigProvider>
    </Sider>
  );
};

export default SideNav;
