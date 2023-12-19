from django.http import HttpRequest, JsonResponse
from ninja.errors import AuthenticationError
from ninja.security import HttpBasicAuth, HttpBearer

from ..users.models import Token, User
from .utils import Request


class TokenAuth(HttpBearer):
    def authenticate(self, request: Request, token: str):
        try:
            token_instance = Token.objects.get(secret=token)

        except Token.DoesNotExist:
            raise AuthenticationError("INVALID_TOKEN")

        if token_instance.is_expired:
            raise AuthenticationError("INVALID_TOKEN")

        return token_instance.user


class BasicAuth(HttpBasicAuth):
    def authenticate(self, request, username, password):
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise AuthenticationError("INVALID_CREDENTIALS")

        if not user.check_password(password):
            raise AuthenticationError("INVALID_CREDENTIALS")

        return user


def authentication_error_handler(
    request: HttpRequest,
    exc: AuthenticationError,
):
    return JsonResponse({"detail": str(exc)}, status=401)
