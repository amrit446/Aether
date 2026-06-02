from flask import Blueprint, jsonify
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order
from app.schemas.product import ProductSchema

dashboard_bp = Blueprint('dashboard', __name__)
product_schema = ProductSchema(many=True)

@dashboard_bp.route('/dashboard', methods=['GET'])
def get_dashboard_metrics():
    try:
        total_products = Product.query.count()
        total_customers = Customer.query.count()
        total_orders = Order.query.count()
        
        # Products with quantity < 10 are considered low stock
        low_stock_products = Product.query.filter(Product.quantity_in_stock < 10).order_by(Product.quantity_in_stock.asc()).all()
        
        return jsonify({
            "total_products": total_products,
            "total_customers": total_customers,
            "total_orders": total_orders,
            "low_stock_products": product_schema.dump(low_stock_products)
        }), 200
    except Exception as err:
        return jsonify({"error": str(err)}), 500
