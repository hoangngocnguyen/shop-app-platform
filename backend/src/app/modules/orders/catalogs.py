from collections.abc import Iterable

from src.app.modules.orders.enums.order_enums import (
    CANCEL_REASON_TEXT,
    AdminCancelReason,
    CustomerCancelReason,
)
from src.app.modules.orders.schemas.order_responses import (
    CancellationReasonCatalogResponse,
    CancellationReasonOption,
)


def build_cancellation_reason_catalog(
    reasons: Iterable[CustomerCancelReason | AdminCancelReason],
) -> CancellationReasonCatalogResponse:
    """Build a role-scoped catalog from an enum and the shared Vietnamese labels."""
    return CancellationReasonCatalogResponse(
        items=[
            CancellationReasonOption(
                value=reason.value,
                label=CANCEL_REASON_TEXT[reason.value],
                requires_custom_reason=reason.value == "OTHER",
            )
            for reason in reasons
        ]
    )
