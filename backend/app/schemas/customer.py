from app.extensions import ma
from app.models.customer import Customer
from marshmallow import fields

class CustomerSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Customer
        load_instance = True

    # Override fields to apply validation
    full_name = fields.String(required=True)
    email = fields.Email(required=True, error_messages={"invalid": "Not a valid email address."})
    phone_number = fields.String(required=False, allow_none=True)
