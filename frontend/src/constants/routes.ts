export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
  },
  USER: {
    PROFILE: '/user/profile',
    ADDRESS: '/user/shipping-address',
    ORDERS: '/user/orders',
  },
  ABOUT: {
    FAQ: '/about/faq',
    SHIPPING: '/about/shipping',
    TERM: '/about/term',
    RETURN_POLICY: '/about/return-policy',
  },
  CHECKOUT: '/checkout',
  CHECKOUT_TEST: '/checkout/test',
  CHECKOUT_SUCCESS: '/checkout/success',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/6',
  PAYMENT: '/payment',
  PAYMENT_RESULT: '/payment/result',
  STORES: '/stores',
} as const;