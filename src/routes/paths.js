// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  faqs: '/faqs',
  // AUTH
  auth: {
    privy: {
      signIn: `${ROOTS.AUTH}/privy/sign-in`,
    },
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    // Publications
    publications: {
      root: `${ROOTS.DASHBOARD}/publications`,
      create: `${ROOTS.DASHBOARD}/publications/create`,
      list: `${ROOTS.DASHBOARD}/publications/list`,
      edit: (id) => `${ROOTS.DASHBOARD}/publications/${id}/edit`,
      details: (id) => `${ROOTS.DASHBOARD}/publications/${id}`,
      read: (id) => `${ROOTS.DASHBOARD}/publications/${id}/read`,
    },
    // Citations
    citations: {
      root: `${ROOTS.DASHBOARD}/citations`,
      create: `${ROOTS.DASHBOARD}/citations/create`,
      list: `${ROOTS.DASHBOARD}/citations/list`,
    },
    // Authors
    authors: {
      root: `${ROOTS.DASHBOARD}/authors`,
      register: `${ROOTS.DASHBOARD}/authors/register`,
      list: `${ROOTS.DASHBOARD}/authors/list`,
    },
  },
};
