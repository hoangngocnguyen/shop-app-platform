// 1. Base interface chứa các thuộc tính dùng chung
export interface CartItemBase {
    product_id: number;
    quantity: number;
}

// 2. Request Schemas
export interface AddToCartRequest extends CartItemBase {
    current_url?: string | null;
}

export interface UpdateCartItemRequest {
    quantity: number;
}

export interface DeleteMultipleCartItemsRequest {
    cart_item_ids: number[];
}

export interface SyncCartRequest {
    items: CartItemBase[];
}

// 3. Response Schemas
export type CartMoney = number | string;

export interface CartItemResponse {
    cart_item_id: number;
    product_id: number;
    product_name: string;
    product_image?: string | null;
    price: CartMoney;
    discount_percent?: number | null;
    unit_price: CartMoney;
    quantity: number;
    subtotal: CartMoney;
    stock_quantity: number;
}

export interface CartResponse {
    cart_id: number;
    items: CartItemResponse[];
    total_quantity: number;
    total_price: CartMoney;
}