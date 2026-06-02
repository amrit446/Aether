from flask import Blueprint, request, jsonify
from app.models.customer import Customer
from app.schemas.customer import CustomerSchema
from app.extensions import db
from marshmallow import ValidationError

customer_bp = Blueprint('customers', __name__)
customer_schema = CustomerSchema()
customers_schema = CustomerSchema(many=True)

@customer_bp.route('/customers', methods=['POST'])
def create_customer():
    try:
        data = request.get_json() or {}
        # Pre-validate structure
        customer = customer_schema.load(data)
        
        # Check Email uniqueness
        existing = Customer.query.filter_by(email=customer.email).first()
        if existing:
            return jsonify({"errors": {"email": ["Email address already exists."]}}), 409
            
        db.session.add(customer)
        db.session.commit()
        return jsonify(customer_schema.dump(customer)), 201
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400
    except Exception as err:
        db.session.rollback()
        return jsonify({"error": str(err)}), 500

@customer_bp.route('/customers', methods=['GET'])
def get_customers():
    customers = Customer.query.order_by(Customer.id.desc()).all()
    return jsonify(customers_schema.dump(customers)), 200

@customer_bp.route('/customers/<int:id>', methods=['GET'])
def get_customer(id):
    customer = Customer.query.get(id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404
    return jsonify(customer_schema.dump(customer)), 200

@customer_bp.route('/customers/<int:id>', methods=['DELETE'])
def delete_customer(id):
    customer = Customer.query.get(id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404
        
    try:
        db.session.delete(customer)
        db.session.commit()
        return jsonify({"message": "Customer and all associated orders deleted successfully."}), 200
    except Exception as err:
        db.session.rollback()
        return jsonify({"error": str(err)}), 500
