import React, { ReactNode, useEffect } from 'react';
import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom';

import {
  AccountDeactivePage,
  BiddingDashboardPage,
  DefaultDashboardPage,
  EcommerceDashboardPage,
  Error400Page,
  Error403Page,
  Error404Page,
  Error500Page,
  Error503Page,
  ErrorPage,
  LearningDashboardPage,
  LogisticsDashboardPage,
  MarketingDashboardPage,
  PasswordResetPage,
  ProjectsDashboardPage,
  SignInPage,
  SignUpPage,
  SitemapPage,
  SocialDashboardPage,
  VerifyEmailPage,
  WelcomePage
} from '../pages';
// layouts
import { DashboardLayout } from '../layouts';
import { AuthenticationLayout } from '../layouts/authentication/index.tsx';
import { BlogLayout } from '../layouts/blog/index.tsx';
import { TournamentLayout } from '../layouts/tournament/index.tsx';
import { TournamentAdminLayout } from '../layouts/tournament/index.admin.tsx';
// pages
import { AboutPage } from '../pages/About.tsx';
import BackList from '../pages/authentication/BackList.tsx';
import PlayerPage from '../pages/authentication/PlayerPage.tsx';
import RefereesPage from '../pages/authentication/RefereesPage.tsx';
import SponnerPage from '../pages/authentication/SponnerPage.tsx';
import ListBlog from '../pages/blog/ListBlog.tsx';
import TournamentDetail from '../pages/tournament/Detail.tsx';
import OverviewPage from '../pages/tournament/OverviewPage.tsx';
import OverviewAdminPage from '../pages/tournament/Admin/OverviewPage.tsx';
import DetailAdminPage from '../pages/tournament/Admin/Detail.tsx';
import VenusAdminPage from '../pages/tournament/Admin/VenusPage.tsx';
import RefereesAdminPage from '../pages/tournament/Admin/RefereesPage.tsx';
import { VenusPage } from '../pages/tournament/VenusPage.tsx';

import TournamentAdminDetail from '../pages/tournament/Admin/Detail.tsx';
import { PaymentAdminLayout } from '../layouts/payment/index.admin.tsx';
import PaymentAdmin from '../pages/payment/All/index.tsx';
import PaymentSponner from '../pages/payment/Sponner/index.tsx';
import { RefeerLayout } from '../layouts/refee/index.tsx';
import { ReFeerPage } from '../pages/refee/OverviewPage.tsx';
import ReefeerDetail from '../pages/refee/Detail.tsx';

// Custom scroll restoration function
export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    }); // Scroll to the top when the location changes
  }, [pathname]);

  return null; // This component doesn't render anything
};

type PageProps = {
  children: ReactNode;
};

// Create an HOC to wrap your route components with ScrollToTop
const PageWrapper = ({ children }: PageProps) => {
  return (
    <>
      <ScrollToTop />
      {children}
    </>
  );
};

// Create the router
const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/auth/signin" replace />,
  },
  {
    path: '/dashboards',
    element: <PageWrapper children={<DashboardLayout />} />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        path: 'default',
        element: <DefaultDashboardPage />,
      },
      {
        path: 'projects',
        element: <ProjectsDashboardPage />,
      },
      {
        path: 'ecommerce',
        element: <EcommerceDashboardPage />,
      },
      {
        path: 'marketing',
        element: <MarketingDashboardPage />,
      },
      {
        path: 'social',
        element: <SocialDashboardPage />,
      },
      {
        path: 'bidding',
        element: <BiddingDashboardPage />,
      },
      {
        path: 'learning',
        element: <LearningDashboardPage />,
      },
      {
        path: 'logistics',
        element: <LogisticsDashboardPage />,
      },
    ],
  },
  {
    path: '/sitemap',
    element: <PageWrapper children={<DashboardLayout />} />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        path: '',
        element: <SitemapPage />,
      },
    ],
  },
  {
    path: '/tournament',
    element: <PageWrapper children={<TournamentLayout />} />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        path: 'overview',
        element: <OverviewPage />,
      },
      {
        path: 'vennues',
        element: <VenusPage />,
      },
      {
        path: 'referees',
        element: <RefereesPage />,
      },
      {
        path: ':id',
        element: <TournamentDetail />,
      },
    ],
  },
  {
    path: 'tournament/admin',
    element: <PageWrapper children={<TournamentAdminLayout />} />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        path: 'overview',
        element: <OverviewAdminPage />,
      },
      {
        path: 'overview',
        element: <OverviewAdminPage />,
      },
      {
        path: 'vennues',
        element: <VenusAdminPage />,
      },
      {
        path: 'referees',
        element: <RefereesAdminPage />,
      },
      {
        path: ':id',
        element: <DetailAdminPage />,
      },
    ],
  },
  {
    path: '/authencation',
    element: <PageWrapper children={<AuthenticationLayout />} />, // Use AuthenticationLayout if it exists
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        path: 'manager-sponsor',
        element: <SponnerPage />,
      },
      {
        path: 'block-user',
        element: <BackList />,
      },
      {
        path: 'manager-player',
        element: <PlayerPage />,
      },
    ],
  },
  {
    path: '/blog',
    element: <PageWrapper children={<BlogLayout />} />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <ListBlog />,
      },
    ],
  },
  {
    path: '/admin/payment',
    element: <PageWrapper children={<PaymentAdminLayout />} />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <PaymentAdmin />,
      },
      {
        path: ':id',
        element: <DetailAdminPage />,
      },
    ],
  },
  {
    path: '/payment',
    element: <PageWrapper children={<PaymentAdminLayout />} />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <PaymentSponner />,
      },
    ],
  },
  {
    path: '/refeer',
    element: <PageWrapper children={<RefeerLayout />} />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <ReFeerPage />,
      },
      {
        path: ':id',
        element: <ReefeerDetail />,
      },

    ],
  },
  {
    path: '/auth',
    errorElement: <ErrorPage />,
    children: [
      {
        path: 'signup',
        element: <SignUpPage />,
      },
      {
        path: 'signin',
        element: <SignInPage />,
      },
      {
        path: 'welcome',
        element: <WelcomePage />,
      },
      {
        path: 'verify-email',
        element: <VerifyEmailPage />,
      },
      {
        path: 'password-reset',
        element: <PasswordResetPage />,
      },
      {
        path: 'account-delete',
        element: <AccountDeactivePage />,
      },
    ],
  },
  {
    path: 'errors',
    errorElement: <ErrorPage />,
    children: [
      {
        path: '400',
        element: <Error400Page />,
      },
      {
        path: '403',
        element: <Error403Page />,
      },
      {
        path: '404',
        element: <Error404Page />,
      },
      {
        path: '500',
        element: <Error500Page />,
      },
      {
        path: '503',
        element: <Error503Page />,
      },
    ],
  },
  {
    path: '/about',
    element: <PageWrapper children={<DashboardLayout />} />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        path: '',
        element: <AboutPage />,
      },
    ],
  },
]);

export default router;
