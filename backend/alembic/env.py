from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool

from alembic import context

# Import từ app
from src.app.core.config import settings
from src.app.core.database import Base
from src.app.modules.carts.model import Cart, CartItem  # noqa: F401
from src.app.modules.categories.model import Category  # noqa: F401
from src.app.modules.orders.model import Order, OrderDetail, OrderLog  # noqa: F401
from src.app.modules.products.model import Product  # noqa: F401
from src.app.modules.roles.model import Role  # noqa: F401
from src.app.modules.shipper.model import Shipper  # noqa: F401
from src.app.modules.shipping_addresses.model import ShippingAddress  # noqa: F401
from src.app.modules.users.model import User  # noqa: F401

# Cấu hình URL từ Pydantic
config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Gán Metadata
target_metadata = Base.metadata
print("Alembic found tables:", list(target_metadata.tables.keys()))


# Lệnh chạy Offline
def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


# Lệnh chạy Online
def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
