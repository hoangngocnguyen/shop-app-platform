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
  PRODUCTS: {
    DETAIL: (id: number | string) => `/products/${id}`,
  },
  CART: '/user/cart',
  STORES: '/stores',
  ADMIN: {
    DASHBOARD: '/admin',
    PRODUCTS: '/admin/product',
    CATEGORIES: '/admin/category',
    ORDERS: '/admin/orders',
    USERS: '/admin/users',
  },
} as const;
