from ninja import ModelSchema, Schema

from ..users.models import User

DbIdentifier = str


class UserSchema(ModelSchema):
    id: DbIdentifier

    class Config:
        model = User
        model_fields = ["email", "full_name", "locale"]


class TokenSchema(Schema):
    token: str
    user: UserSchema
