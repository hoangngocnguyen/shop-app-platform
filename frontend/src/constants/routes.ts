export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
  },
  USER: {
    PROFILE: '/user/profile',
    ADDRESS: '/user/shipping-address'
  }
} as const;