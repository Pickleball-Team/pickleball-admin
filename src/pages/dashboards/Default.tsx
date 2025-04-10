import { useState } from 'react';
import { PageHeader } from '../../components';
import { HomeOutlined } from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import AdminDashboard from './containers/Dashboard/AdminDashboard';
import SponsorDashboard from './containers/Dashboard/SponsorDashboard';
import RefereeDashboard from './containers/Dashboard/RefereeDashboard';


// Role constants
const ADMIN_ROLE = 2;
const SPONSOR_ROLE = 3;
const REFEREE_ROLE = 4;
const DEVELOPER_ROLE = 5;

export const DefaultDashboardPage = () => {
  // Get user from Redux store
  const user = useSelector((state: RootState) => state.authencation.user);
  const userRole = user?.roleId;
  
  // Function to determine dashboard title based on role
  const getDashboardTitle = () => {
    switch (userRole) {
      case ADMIN_ROLE:
        return 'Admin Dashboard';
      case SPONSOR_ROLE:
        return 'Organizer Dashboard';
      case REFEREE_ROLE:
        return 'Referee Dashboard';
      default:
        return 'Dashboard';
    }
  };

  // Render the appropriate dashboard based on user role
  const renderDashboardByRole = () => {
    switch (userRole) {
      case ADMIN_ROLE:
        return <AdminDashboard user={user} />;
      case SPONSOR_ROLE:
        return <SponsorDashboard user={user} />;
      case REFEREE_ROLE:
        return <RefereeDashboard user={user} />;
      default:
        return <div>Unknown user role. Please contact administrator.</div>;
    }
  };
  
  return (
    <div>
      <Helmet>
        <title>{getDashboardTitle()} | ScorePickle Admin</title>
      </Helmet>
      <PageHeader
        title={getDashboardTitle()}
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
            title: 'Dashboard',
          },
        ]}
      />
      
      {renderDashboardByRole()}
    </div>
  );
};
