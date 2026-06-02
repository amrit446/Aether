from app.extensions import ma
from app.models.order import Order
from app.models.order_item import OrderItem
from app.schemas.customer import CustomerSchema
from marshmallow import fields, validates, ValidationError

class OrderItemSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = OrderItem
        load_instance = True
        include_fk = True

    quantity = fields.Integer(required=True)
    unit_price = fields.Float(dump_only=True)
    subtotal = fields.Float(dump_only=True)
    
    # Nested product schema to display SKU and name in order logs
    product = fields.Nested('ProductSchema', only=('id', 'name', 'sku'), dump_only=True)

    @validates('quantity')
    def validate_quantity(self, value):
        if value <= 0:
            raise ValidationError("Quantity must be greater than zero.")

class OrderSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Order
        load_instance = False
        include_fk = True

    total_amount = fields.Float(dump_only=True)
    status = fields.String(required=False, default='completed') # pending, completed, cancelled
    created_at = fields.DateTime(dump_only=True)
    
    # Deserialization payload (input fields)
    items = fields.List(fields.Dict(), required=True, load_only=True)

    # Serialized outputs (dump fields)
    customer = fields.Nested(CustomerSchema, dump_only=True)
    order_items = fields.Nested(OrderItemSchema, many=True, dump_only=True)
    
    @validates('items')
    def validate_items(self, value):
        if not value or len(value) == 0:
            raise ValidationError("An order must contain at least one item.")
        for item in value:
            if 'product_id' not in item or 'quantity' not in item:
                raise ValidationError("Each item must contain 'product_id' and 'quantity'.")
            try:
                qty = int(item['quantity'])
                if qty <= 0:
                    raise ValidationError("Quantity must be greater than zero.")
            except (ValueError, TypeError):
                raise ValidationError("Quantity must be a valid integer.")
