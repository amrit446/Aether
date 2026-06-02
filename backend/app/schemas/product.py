from app.extensions import ma
from app.models.product import Product
from marshmallow import fields, validates, ValidationError

class ProductSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Product
        load_instance = True

    # Override fields to apply validation
    name = fields.String(required=True)
    sku = fields.String(required=True)
    price = fields.Float(required=True)
    quantity_in_stock = fields.Integer(required=True)

    @validates('price')
    def validate_price(self, value):
        if value <= 0:
            raise ValidationError("Price must be greater than zero.")

    @validates('quantity_in_stock')
    def validate_quantity(self, value):
        if value < 0:
            raise ValidationError("Quantity in stock cannot be negative.")
