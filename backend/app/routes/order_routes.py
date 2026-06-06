from flask import Blueprint, request, jsonify
from app.models.order import Order
from app.models.order_item import OrderItem
from app.schemas.order import OrderSchema
from app.services.order_service import create_order
from app.extensions import db
from marshmallow import ValidationError
from sqlalchemy.orm import joinedload

order_bp = Blueprint('orders', __name__)
order_schema = OrderSchema()
orders_schema = OrderSchema(many=True)

@order_bp.route('/orders', methods=['POST'])
def create_new_order():
    try:
        data = request.get_json() or {}
        # Pre-validate inputs (customer_id, items, etc.)
        validated_data = order_schema.load(data)
        
        customer_id = validated_data['customer_id']
        items = validated_data['items']
        status = validated_data.get('status', 'completed')

        
        # Invoke transactional order service
        order = create_order(customer_id, items, status)
        
        # Eagerly load customer and nested order items product details to avoid N+1 queries
        order = Order.query.options(
            joinedload(Order.customer),
            joinedload(Order.order_items).joinedload(OrderItem.product)
        ).get(order.id)
        
        return jsonify(order_schema.dump(order)), 201
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400
    except Exception as err:
        return jsonify({"error": str(err)}), 500

@order_bp.route('/orders', methods=['GET'])
def get_orders():
    orders = Order.query.options(
        joinedload(Order.customer),
        joinedload(Order.order_items).joinedload(OrderItem.product)
    ).order_by(Order.id.desc()).all()
    return jsonify(orders_schema.dump(orders)), 200

@order_bp.route('/orders/<int:id>', methods=['GET'])
def get_order(id):
    order = Order.query.options(
        joinedload(Order.customer),
        joinedload(Order.order_items).joinedload(OrderItem.product)
    ).get(id)
    if not order:
        return jsonify({"error": "Order not found"}), 404
    return jsonify(order_schema.dump(order)), 200

@order_bp.route('/orders/<int:id>', methods=['DELETE'])
def delete_order(id):
    order = Order.query.get(id)
    if not order:
        return jsonify({"error": "Order not found"}), 404
        
    try:
        db.session.delete(order)
        db.session.commit()
        return jsonify({"message": "Order deleted successfully."}), 200
    except Exception as err:
        db.session.rollback()
        return jsonify({"error": str(err)}), 500
