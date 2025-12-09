// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  faqs: '/faqs',
  minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
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
    two: `${ROOTS.DASHBOARD}/two`,
    three: `${ROOTS.DASHBOARD}/three`,
    // Publications
    publications: {
      root: `${ROOTS.DASHBOARD}/publications`,
      create: `${ROOTS.DASHBOARD}/publications/create`,
      list: `${ROOTS.DASHBOARD}/publications/list`,
      edit: (id) => `${ROOTS.DASHBOARD}/publications/${id}/edit`,
      details: (id) => `${ROOTS.DASHBOARD}/publications/${id}`,
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
      create: `${ROOTS.DASHBOARD}/authors/create`,
      list: `${ROOTS.DASHBOARD}/authors/list`,
    },
    group: {
      root: `${ROOTS.DASHBOARD}/group`,
      five: `${ROOTS.DASHBOARD}/group/five`,
      six: `${ROOTS.DASHBOARD}/group/six`,
    },
  },
};
