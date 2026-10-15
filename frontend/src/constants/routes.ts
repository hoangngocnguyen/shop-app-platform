export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
  },
  USER: {
    PROFILE: '/user/profile',
    ADDRESS: '/user/shipping-address',
  },
  ABOUT: {
    FAQ: '/about/faq',
    SHIPPING: '/about/shipping',
    TERM: '/about/term',
    RETURN_POLICY: '/about/return-policy',
  },
  PAYMENT: '/payment',
  PAYMENT_RESULT: '/payment/result',
  STORES: '/stores',
} as const;