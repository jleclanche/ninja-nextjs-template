from ninja import NinjaAPI

from .security import TokenAuth

api = NinjaAPI(title="Financica API v1", auth=TokenAuth())
api.add_router("", auth_router)
api.add_router("", users_router)
