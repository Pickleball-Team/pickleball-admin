import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { Spin } from 'antd';

interface RefereeDashboardProps {
  user: any;
}

const RefereeDashboard: React.FC<RefereeDashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const loggedInUser = useSelector((state: RootState) => state.authencation.user);
  
  useEffect(() => {
    // Simple redirect to referee page
    navigate('/refeer');
  }, [navigate]);

  // Display loading while redirect happens
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spin size="large" tip="Redirecting to referee dashboard..." />
    </div>
  );
};

export default RefereeDashboard;

