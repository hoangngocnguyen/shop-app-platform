from pydantic import BaseModel, ConfigDict, Field


# 1. BASE SCHEMA (Chứa các thuộc tính dùng chung)
class ShippingAddressBase(BaseModel):
    recipient_name: str = Field(
        ...,
        min_length=2,
        max_length=255,
        description="Tên người nhận hàng",
        examples=["Nguyễn Văn A"],
    )
    phone: str = Field(
        ...,
        pattern=r"^(0[3|5|7|8|9])+([0-9]{8})$",
        description="Số điện thoại người nhận (Định dạng SĐT Việt Nam: 10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09)",
        examples=["0912345678"],
    )
    province_code: str = Field(
        ...,
        max_length=20,
        description="Mã tỉnh/thành phố (Khóa ngoại tham chiếu bảng provinces)",
        examples=["46"],
    )
    ward_code: str = Field(
        ...,
        max_length=20,
        description="Mã phường/xã (Khóa ngoại tham chiếu bảng wards)",
        examples=["19753"],
    )
    address_line: str = Field(
        ...,
        min_length=5,
        max_length=255,
        description="Địa chỉ chi tiết (Số nhà, tên đường, tòa nhà...)",
        examples=["123 Đường Hoàng Nguyễn"],
    )
    is_default: bool = Field(
        default=False,
        description="Đặt làm địa chỉ mặc định khi đặt hàng",
    )


# 2. REQUEST SCHEMAS
class ShippingAddressCreate(ShippingAddressBase):
    """Schema cho Request Body khi THÊM MỚI địa chỉ (POST /shipping-addresses)."""


class ShippingAddressUpdate(ShippingAddressBase):
    """Payload cho PUT /shipping-addresses/{id} - Yêu cầu truyền đủ thông tin"""


# 3. RESPONSE SCHEMAS
class ShippingAddressResponse(ShippingAddressBase):
    """Schema trả về cho Client khi xem Danh sách hoặc Chi tiết địa chỉ."""

    id: int = Field(..., description="Mã định danh địa chỉ")
    province_name: str | None = Field(
        None,
        description="Tên tỉnh/thành phố (Join từ bảng Province)",
        examples=["Thừa Thiên Huế"],
    )
    ward_name: str | None = Field(
        None,
        description="Tên phường/xã (Join từ bảng Ward)",
        examples=["Phường Phong Điền"],
    )

    # Cho phép Pydantic đọc dữ liệu trực tiếp từ SQLAlchemy ORM Model
    model_config = ConfigDict(from_attributes=True)


class DeleteShippingAddressResponse(BaseModel):
    """Schema trả về khi XÓA địa chỉ thành công (DELETE /shipping-addresses/{id})."""

    message: str = Field(
        default="Xóa địa chỉ giao hàng thành công", description="Thông báo kết quả"
    )
    id: int = Field(..., description="ID địa chỉ đã xóa")
