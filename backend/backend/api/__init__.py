from ninja import NinjaAPI

from .security import TokenAuth, authentication_error_handler
from .users import users_router

api = NinjaAPI(title="Financica API v1", auth=TokenAuth())
api.add_router("", users_router)


__all__ = ["api", "authentication_error_handler"]
