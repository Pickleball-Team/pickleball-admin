import React, { ReactNode, useEffect } from 'react';
import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom';
import {
  CorporateLayout,
  DashboardLayout,
  UserAccountLayout,
} from '../layouts';
import { TournamentLayout } from '../layouts/tournament/index.tsx';
import {
  AccountDeactivePage,
  BiddingDashboardPage,
  CorporateAboutPage,
  CorporateContactPage,
  CorporateFaqPage,
  CorporateLicensePage,
  CorporatePricingPage,
  CorporateTeamPage,
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
  UserProfileActionsPage,
  UserProfileActivityPage,
  UserProfileDetailsPage,
  UserProfileFeedbackPage,
  UserProfileHelpPage,
  UserProfileInformationPage,
  UserProfilePreferencesPage,
  UserProfileSecurityPage,
  VerifyEmailPage,
  WelcomePage,
} from '../pages';
import { AboutPage } from '../pages/About.tsx';
import { OverviewPage } from '../pages/tournament/OverviewPage.tsx';
import { ResultsPage } from '../pages/tournament/ResultsPage.tsx';
import { SchedulePage } from '../pages/tournament/SchedulePage.tsx';
import { TeamsPage } from '../pages/tournament/TeamsPage.tsx';
import TournamentDetail from '../pages/tournament/Detail.tsx';
import { AuthenticationLayout } from '../layouts/authentication/index.tsx';
import SponnerPage from '../pages/authentication/SponnerPage.tsx';
import BackList from '../pages/authentication/BackList.tsx';
import PlayerPage from '../pages/authentication/PlayerPage.tsx';

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
        path: 'schedule',
        element: <SchedulePage />,
      },
      {
        path: 'teams',
        element: <TeamsPage />,
      },
      {
        path: 'results',
        element: <ResultsPage />,
      },
      {
        path: ':id',
        element: <TournamentDetail />,
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
    path: '/corporate',
    element: <PageWrapper children={<CorporateLayout />} />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        path: 'about',
        element: <CorporateAboutPage />,
      },
      {
        path: 'team',
        element: <CorporateTeamPage />,
      },
      {
        path: 'faqs',
        element: <CorporateFaqPage />,
      },
      {
        path: 'contact',
        element: <CorporateContactPage />,
      },
      {
        path: 'pricing',
        element: <CorporatePricingPage />,
      },
      {
        path: 'license',
        element: <CorporateLicensePage />,
      },
    ],
  },
  {
    path: '/user-profile',
    element: <PageWrapper children={<UserAccountLayout />} />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        path: 'details',
        element: <UserProfileDetailsPage />,
      },
      {
        path: 'preferences',
        element: <UserProfilePreferencesPage />,
      },
      {
        path: 'information',
        element: <UserProfileInformationPage />,
      },
      {
        path: 'security',
        element: <UserProfileSecurityPage />,
      },
      {
        path: 'activity',
        element: <UserProfileActivityPage />,
      },
      {
        path: 'actions',
        element: <UserProfileActionsPage />,
      },
      {
        path: 'help',
        element: <UserProfileHelpPage />,
      },
      {
        path: 'feedback',
        element: <UserProfileFeedbackPage />,
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
