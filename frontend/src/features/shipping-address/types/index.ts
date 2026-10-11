// 1. Base interface chứa các thuộc tính dùng chung
export interface ShippingAddressBase {
    recipient_name: string;
    phone: string;
    province_code: string;
    ward_code: string;
    address_line: string;
    is_default: boolean;
}

// 2. Request Schemas
export type ShippingAddressCreate = ShippingAddressBase;

export type ShippingAddressUpdate = ShippingAddressBase;

// 3. Response Schemas
export interface ShippingAddressResponse extends ShippingAddressBase {
    id: number;
    province_name?: string | null;
    ward_name?: string | null;
}

export interface DeleteShippingAddressResponse {
    message: string;
    id: number;
}