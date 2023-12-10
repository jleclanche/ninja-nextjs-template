from django.http import HttpRequest

from ..users.models import User


# Used in typings
class Request(HttpRequest):
    auth: User
