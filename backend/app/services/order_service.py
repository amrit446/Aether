from app.extensions import db
from app.models.customer import Customer
from app.models.product import Product
from app.models.order import Order
from app.models.order_item import OrderItem
from marshmallow import ValidationError
from decimal import Decimal

def create_order(customer_id, items_data, status='completed'):
    """
    Business Logic:
    1. Verifies customer exists.
    2. Runs transactional updates with row-locking (with_for_update) to prevent race conditions on stock.
    3. Verifies stock is sufficient.
    4. Computes subtotals and overall order total on backend.
    5. Deducts inventory.
    6. Persists order and items atomically, or rolls back.
    """
    # Check if customer exists
    customer = Customer.query.get(customer_id)
    if not customer:
        raise ValidationError({"customer_id": ["Customer not found."]})

    # Ensure status is valid
    if status not in ['pending', 'completed', 'cancelled']:
        status = 'completed'

    try:
        # Create the Order shell
        order = Order(
            customer_id=customer_id,
            status=status,
            total_amount=Decimal('0.00')
        )
        db.session.add(order)
        # Flush to obtain order.id for relations
        db.session.flush()

        total_amount = Decimal('0.00')
        processed_items = []

        for item in items_data:
            product_id = item['product_id']
            qty_requested = int(item['quantity'])

            # Row lock product to prevent double-sell race conditions (PostgreSQL only)
            # SQLite (used in testing) does not support FOR UPDATE locking
            if db.engine.dialect.name == 'sqlite':
                product = Product.query.get(product_id)
            else:
                product = Product.query.with_for_update().get(product_id)

            if not product:
                raise ValidationError({"items": [f"Product with ID {product_id} not found."]})

            # Stock check
            if product.quantity_in_stock < qty_requested:
                raise ValidationError({
                    "items": [f"Insufficient stock for product '{product.name}' (SKU: {product.sku}). Requested: {qty_requested}, Available: {product.quantity_in_stock}."]
                })

            # Reduce stock (guaranteed non-negative by checking above)
            product.quantity_in_stock -= qty_requested

            # Calculations
            unit_price = Decimal(str(product.price))
            subtotal = unit_price * qty_requested
            total_amount += subtotal

            # Create line item
            order_item = OrderItem(
                order_id=order.id,
                product_id=product_id,
                quantity=qty_requested,
                unit_price=unit_price,
                subtotal=subtotal
            )
            db.session.add(order_item)
            processed_items.append(order_item)

        # Update order total
        order.total_amount = total_amount
        db.session.commit()
        return order

    except Exception as e:
        db.session.rollback()
        if isinstance(e, ValidationError):
            raise e
        # Reraise database errors as schema validation errors for user visibility
        raise ValidationError({"error": [str(e)]})
