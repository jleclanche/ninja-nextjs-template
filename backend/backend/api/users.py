from typing import Literal

from django.core.exceptions import PermissionDenied
from django.db import transaction
from ninja import Router, Schema
from ninja.errors import AuthenticationError
from ninja.pagination import paginate

from ..users.models import User
from .schemas import TokenSchema, UserSchema
from .security import BasicAuth, TokenAuth
from .utils import Request

users_router = Router()


@users_router.get("/v1/users", response=list[UserSchema], tags=["users"])
@paginate
def list_users(request: Request):
    if not request.auth.is_staff:
        raise PermissionDenied("This endpoint is reserved to admins")

    return User.objects.all()


class UserCreateRequest(Schema):
    email: str
    full_name: str
    password: str


ErrorResponse = dict[Literal["detail"], str]


@users_router.post(
    "/v1/users",
    response={200: TokenSchema, 409: ErrorResponse},
    auth=None,
    tags=["users"],
)
def create_user(request: Request, payload: UserCreateRequest):
    email = payload.email.lower()
    with transaction.atomic():
        if User.objects.filter(email=email).exists():
            return 409, {"detail": "A user with this email already exists."}

        create_user = User.objects.create_user  # type: ignore
        user: User = create_user(
            username=email,
            email=email,
            full_name=payload.full_name,
        )
        user.set_password(payload.password)
        user.save()

        # Refresh user object
        user = User.objects.get(pk=user.pk)

    token = user.get_or_create_token()

    return TokenSchema(token=token.secret, user=user)


@users_router.get("/v1/user", response=UserSchema, tags=["users"])
def get_logged_user(request: Request):
    return request.auth


class UpdateUserRequest(Schema):
    email: str | None
    full_name: str | None
    locale: Literal["en", "fr"] | None
    password: str | None


# NOTE: Order of the auth classes matters. If BasicAuth is first, exceptions
# will be logged (invalid Authorization header).
@users_router.patch(
    "/v1/user",
    response=UserSchema,
    auth=(TokenAuth(), BasicAuth()),
    tags=["users"],
)
def update_logged_user(request: Request, payload: UpdateUserRequest):
    if payload.password:
        # If a password is present in the payload, the user HAS to be
        # authenticated using basic auth.
        # This ensures the user's old password is checked in the request.
        if not BasicAuth()(request):
            raise AuthenticationError(
                "Unauthorized. "
                "In order to change the password, you must use "
                "HTTP Basic authentication (username and current password)."
            )

        request.auth.set_password(payload.password)

    if payload.email:
        request.auth.email = payload.email
        request.auth.username = payload.email

    if payload.full_name:
        request.auth.full_name = payload.full_name

    if payload.locale:
        request.auth.locale = payload.locale

    request.auth.save()
    return request.auth
