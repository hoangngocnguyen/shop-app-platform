import logging
from uuid import UUID

import httpx
from fastapi import BackgroundTasks
from sqlalchemy.orm import Session, joinedload

from src.app.core.config import settings
from src.app.core.exceptions import (
    AppException,
    BadRequestException,
    ResourceNotFoundException,
)
from src.app.modules.auth.schema import (
    ForgotPasswordResponse,
    MeResponse,
    ResetPasswordResponse,
    SyncUserResponse,
)
from src.app.modules.emails.protocol import IEmailSender
from src.app.modules.roles.model import Role
from src.app.modules.users.model import User

logger = logging.getLogger(__name__)


class AuthService:
    """Service xử lý nghiệp vụ xác thực và đồng bộ application user."""

    @staticmethod
    def get_me(db: Session, auth_user_id: UUID) -> MeResponse:
        """
        Lấy application user hiện tại theo auth_user_id.

        Role được eager-load để phục vụ MeResponse.
        """
        user = (
            db.query(User)
            .options(joinedload(User.role))
            .filter(User.auth_user_id == auth_user_id)
            .first()
        )

        if not user:
            raise ResourceNotFoundException("Không tìm thấy thông tin người dùng")

        return MeResponse.model_validate(user)

    @staticmethod
    def sync_user(
        db: Session,
        auth_user_id: UUID,
        email: str | None = None,
        provider: str | None = "EMAIL",
    ) -> SyncUserResponse:
        """
        Đảm bảo Supabase Auth user đã có application user.

        - User đã tồn tại: trả về User hiện tại.
        - User chưa tồn tại: tạo User mới với role USER.
        """
        user = db.query(User).filter(User.auth_user_id == auth_user_id).first()

        if user:
            return SyncUserResponse(user_id=user.user_id)

        # Tìm role mặc định
        default_role = db.query(Role).filter(Role.code == "USER").first()

        if not default_role:
            raise ResourceNotFoundException(
                "Không tìm thấy vai trò mặc định (USER) trong hệ thống"
            )

        new_user = User(
            auth_user_id=auth_user_id,
            email=email,
            provider=provider or "EMAIL",
            role_id=default_role.id,
        )

        try:
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            return SyncUserResponse(user_id=new_user.user_id)

        except Exception:
            db.rollback()
            raise

    @staticmethod
    def forgot_password(
        db: Session,
        email: str,
        email_sender: IEmailSender,
        background_tasks: BackgroundTasks | None = None,
    ) -> ForgotPasswordResponse:
        """
        Khởi tạo quy trình khôi phục mật khẩu:
        1. Kiểm tra sự tồn tại của người dùng (Chống Account Enumeration Attack).
        2. Tạo link khôi phục an toàn thông qua Supabase Admin API (generate_link).
        3. Gửi email thông báo qua Gmail SMTP (IEmailSender) kèm theo đường dẫn đổi mật khẩu.
        """
        clean_email = email.strip().lower()
        user = (
            db.query(User)
            .filter(User.email.ilike(clean_email), User.is_blocked.is_(False))
            .first()
        )

        generic_response = ForgotPasswordResponse(
            message=(
                "Nếu địa chỉ email này tồn tại trên hệ thống, "
                "chúng tôi đã gửi liên kết đặt lại mật khẩu. "
                "Vui lòng kiểm tra hộp thư đến (và thư mục rác/spam)."
            )
        )

        # Nếu user không tồn tại hoặc tài khoản bị khóa, vẫn trả về thông báo chung
        if not user:
            logger.info(
                "[AUTH] Quên mật khẩu: Email '%s' không tồn tại hoặc bị khóa.",
                clean_email,
            )
            return generic_response

        supabase_url = (settings.SUPABASE_URL or "").strip()
        service_role_key = (settings.SUPABASE_SERVICE_ROLE_KEY or "").strip()

        if not supabase_url or not service_role_key:
            logger.warning(
                "[AUTH] Chưa cấu hình SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY. "
                "Không thể gọi Supabase Admin API generate_link."
            )
            raise BadRequestException(
                "Tính năng quên mật khẩu chưa được cấu hình hoàn tất trên máy chủ. "
                "Vui lòng liên hệ quản trị viên."
            )

        api_url = f"{supabase_url.rstrip('/')}/auth/v1/admin/generate_link"
        headers = {
            "Authorization": f"Bearer {service_role_key}",
            "apikey": service_role_key,
            "Content-Type": "application/json",
        }
        payload = {
            "type": "recovery",
            "email": clean_email,
        }

        try:
            with httpx.Client(timeout=10.0) as client:
                resp = client.post(api_url, headers=headers, json=payload)

            if resp.status_code != 200:
                logger.error(
                    "[AUTH] Supabase Admin generate_link thất bại (%s): %s",
                    resp.status_code,
                    resp.text,
                )
                raise BadRequestException(
                    "Không thể tạo liên kết khôi phục mật khẩu lúc này. Vui lòng thử lại sau."
                )

            data = resp.json()
            hashed_token = data.get("hashed_token") or ""
            action_link = data.get("action_link") or ""

            # Tạo URL chuyển tiếp về trang Reset Password của Frontend
            frontend_url = (settings.FRONTEND_URL or "http://localhost:3000").rstrip("/")
            if hashed_token:
                reset_link = f"{frontend_url}/reset-password?token_hash={hashed_token}&type=recovery"
            else:
                reset_link = action_link or f"{frontend_url}/reset-password"

            customer_name = user.name or clean_email.split("@")[0]
            email_sender.send_reset_password(
                to_email=clean_email,
                customer_name=customer_name,
                reset_link=reset_link,
                expire_minutes=15,
                background_tasks=background_tasks,
            )
            logger.info(
                "[AUTH] Đã lập lịch gửi email khôi phục mật khẩu tới: %s", clean_email
            )

        except AppException:
            raise
        except Exception as exc:
            logger.error(
                "[AUTH] Ngoại lệ khi tạo link khôi phục mật khẩu cho %s: %s",
                clean_email,
                exc,
                exc_info=True,
            )
            raise BadRequestException(
                "Đã xảy ra sự cố trong quá trình gửi yêu cầu khôi phục mật khẩu."
            )

        return generic_response

    @staticmethod
    def reset_password(
        token: str,
        new_password: str,
    ) -> ResetPasswordResponse:
        """
        Đổi mật khẩu mới qua Supabase Auth API:
        1. Xác thực token_hash với Supabase qua endpoint /auth/v1/verify.
        2. Cập nhật mật khẩu mới cho tài khoản người dùng tương ứng.
        """
        supabase_url = (settings.SUPABASE_URL or "").strip()
        service_role_key = (settings.SUPABASE_SERVICE_ROLE_KEY or "").strip()

        if not supabase_url:
            raise BadRequestException(
                "Chưa cấu hình SUPABASE_URL trên máy chủ."
            )

        verify_url = f"{supabase_url.rstrip('/')}/auth/v1/verify"
        headers = {
            "apikey": service_role_key or settings.SECRET_KEY,
            "Content-Type": "application/json",
        }
        verify_payload = {
            "type": "recovery",
            "token_hash": token,
        }

        try:
            with httpx.Client(timeout=10.0) as client:
                # 1. Xác thực recovery token
                verify_resp = client.post(verify_url, headers=headers, json=verify_payload)
                if verify_resp.status_code != 200:
                    logger.warning(
                        "[AUTH] Xác thực token khôi phục thất bại (%s): %s",
                        verify_resp.status_code,
                        verify_resp.text,
                    )
                    raise BadRequestException(
                        "Liên kết khôi phục không hợp lệ hoặc đã hết hạn. Vui lòng gửi lại yêu cầu."
                    )

                session_data = verify_resp.json()
                access_token = session_data.get("access_token")

                if not access_token:
                    # Trường hợp verify trả về user id trực tiếp (admin API)
                    user_id = session_data.get("id") or session_data.get("user", {}).get("id")
                    if user_id and service_role_key:
                        admin_update_url = f"{supabase_url.rstrip('/')}/auth/v1/admin/users/{user_id}"
                        admin_headers = {
                            "Authorization": f"Bearer {service_role_key}",
                            "apikey": service_role_key,
                            "Content-Type": "application/json",
                        }
                        client.put(admin_update_url, headers=admin_headers, json={"password": new_password})
                        return ResetPasswordResponse()

                    raise BadRequestException(
                        "Không tìm thấy phiên xác thực hợp lệ để đổi mật khẩu."
                    )

                # 2. Cập nhật mật khẩu mới bằng access token thu được
                update_user_url = f"{supabase_url.rstrip('/')}/auth/v1/user"
                user_headers = {
                    "Authorization": f"Bearer {access_token}",
                    "apikey": service_role_key or settings.SECRET_KEY,
                    "Content-Type": "application/json",
                }
                update_resp = client.put(
                    update_user_url,
                    headers=user_headers,
                    json={"password": new_password},
                )

                if update_resp.status_code != 200:
                    logger.error(
                        "[AUTH] Cập nhật mật khẩu thất bại (%s): %s",
                        update_resp.status_code,
                        update_resp.text,
                    )
                    raise BadRequestException(
                        "Cập nhật mật khẩu không thành công. Mật khẩu có thể không đáp ứng yêu cầu bảo mật."
                    )

            return ResetPasswordResponse()

        except AppException:
            raise
        except Exception as exc:
            logger.error("[AUTH] Ngoại lệ khi đặt lại mật khẩu: %s", exc, exc_info=True)
            raise BadRequestException(
                "Đã xảy ra lỗi trong quá trình đổi mật khẩu. Vui lòng thử lại sau."
            )
