import {
  PATH_CALENDAR,
  PATH_INBOX,
  PATH_ACCOUNT,
  PATH_AUTH,
  PATH_BLOG,
  PATH_CAREERS,
  PATH_CHANGELOG,
  PATH_CONTACTS,
  PATH_CORPORATE,
  PATH_DASHBOARD,
  PATH_DOCS,
  PATH_ERROR,
  PATH_FILE,
  PATH_GITHUB,
  PATH_INVOICE,
  PATH_LAYOUT,
  PATH_PROJECTS,
  PATH_SOCIAL,
  PATH_START,
  PATH_SUBSCRIPTION,
  PATH_USER_MGMT,
  PATH_USER_PROFILE,
  PATH_LANDING,
  PATH_SITEMAP,
  PATH_SOCIALS,
  PATH_ABOUT,
  PATH_TOURNAMENT,
  PATH_AUTHENTICATION,
  PATH_ADMIN_TOURNAMENT,
  PATH_PAYMENT,
  PATH_REFEE, // Import PATH_TOURNAMENT
} from './routes.ts';

const DASHBOARD_ITEMS = [
  { title: 'default', path: PATH_DASHBOARD.default },
  { title: 'projects', path: PATH_DASHBOARD.projects },
  { title: 'ecommerce', path: PATH_DASHBOARD.ecommerce },
  { title: 'marketing', path: PATH_DASHBOARD.marketing },
  { title: 'social', path: PATH_DASHBOARD.social },
  { title: 'bidding', path: PATH_DASHBOARD.bidding },
  { title: 'learning', path: PATH_DASHBOARD.learning },
  { title: 'logistics', path: PATH_DASHBOARD.logistics },
];

const AUTHENTICATION_ITEMS = [
  { title: 'sign in', path: PATH_AUTH.signin },
  { title: 'sign up', path: PATH_AUTH.signup },
  { title: 'welcome', path: PATH_AUTH.welcome },
  { title: 'verify email', path: PATH_AUTH.verifyEmail },
  { title: 'password reset', path: PATH_AUTH.passwordReset },
  { title: 'account deleted', path: PATH_AUTH.accountDelete },
];

const ERROR_ITEMS = [
  { title: '400', path: PATH_ERROR.error400 },
  { title: '403', path: PATH_ERROR.error403 },
  { title: '404', path: PATH_ERROR.error404 },
  { title: '500', path: PATH_ERROR.error500 },
  { title: '503', path: PATH_ERROR.error503 },
];

const TOURNAMENT_ITEMS = [
  { title: 'overview', path: PATH_TOURNAMENT.overview },
  { title: 'venus', path: PATH_TOURNAMENT.vennues },
  { title: 'referees', path: PATH_TOURNAMENT.referees },
];

const TOURNAMENT_ADMIN_ITEMS = [
  { title: 'overview', path: PATH_ADMIN_TOURNAMENT.overview },
  { title: 'venus', path: PATH_ADMIN_TOURNAMENT.vennues },
  { title: 'referees', path: PATH_ADMIN_TOURNAMENT.referees },
];

const AUTHENTICATION_SYS_ITEMS = [
  { title: 'manager sponsor', path: PATH_AUTHENTICATION.managerSponsor },
  { title: 'block user', path: PATH_AUTHENTICATION.blockUser },
  { title: 'sponsor details', path: PATH_AUTHENTICATION.sponsorDetails },
  { title: 'player details', path: PATH_AUTHENTICATION.playerDetails },
];

const BLOG_ITEMS = [{ title: 'Blog list', path: PATH_BLOG.root }];
const PAYMENT_ITEMS = [{ title: 'Payments list', path: PATH_PAYMENT.root }];
const PAYMENT_ADMIN_ITEMS = [{ title: 'Payments list', path: PATH_PAYMENT.root }];
const REEREER_ITEMS = [
  { title: 'Referees list', path: PATH_REFEE.root },
]

export {
  PATH_CALENDAR,
  PATH_USER_MGMT,
  PATH_INBOX,
  PATH_PROJECTS,
  PATH_LAYOUT,
  PATH_CORPORATE,
  PATH_CONTACTS,
  PATH_DASHBOARD,
  PATH_CHANGELOG,
  PATH_CAREERS,
  PATH_ACCOUNT,
  PATH_GITHUB,
  PATH_AUTH,
  PATH_INVOICE,
  PATH_BLOG,
  PATH_ERROR,
  PATH_DOCS,
  PATH_SUBSCRIPTION,
  PATH_USER_PROFILE,
  PATH_FILE,
  PATH_SOCIAL,
  PATH_START,
  PATH_LANDING,
  PATH_SITEMAP,
  DASHBOARD_ITEMS,
  PATH_SOCIALS,
  AUTHENTICATION_ITEMS,
  ERROR_ITEMS,
  PATH_ABOUT,
  TOURNAMENT_ITEMS,
  TOURNAMENT_ADMIN_ITEMS,
  AUTHENTICATION_SYS_ITEMS,
  BLOG_ITEMS,
  PAYMENT_ITEMS,
  PAYMENT_ADMIN_ITEMS,
  REEREER_ITEMS
};
