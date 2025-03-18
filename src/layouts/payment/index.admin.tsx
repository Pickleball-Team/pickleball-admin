import {
  HomeOutlined,
  DollarOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { PageHeader } from '../../components/index.ts';
import { PAYMENT_ADMIN_ITEMS, PAYMENT_ITEMS } from '../../constants/index.ts';
import { AppLayout } from '../index.ts';

export const PaymentAdminLayout = () => {
  const { pathname } = useLocation();
  return (
    <>
      <AppLayout>
        <PageHeader
          title="Payments"
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
                  <DollarOutlined />
                  <span>Payment Admin Management</span>
                </>
              ),
              menu: {
                items: PAYMENT_ADMIN_ITEMS.map((item) => ({
                  key: item.title,
                  title: <Link to={item.path}>{item.title}</Link>,
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
