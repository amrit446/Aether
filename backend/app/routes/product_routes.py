from flask import Blueprint, request, jsonify
from app.models.product import Product
from app.schemas.product import ProductSchema
from app.extensions import db
from sqlalchemy.exc import IntegrityError
from marshmallow import ValidationError

product_bp = Blueprint('products', __name__)
product_schema = ProductSchema()
products_schema = ProductSchema(many=True)

@product_bp.route('/products', methods=['POST'])
def create_product():
    try:
        data = request.get_json() or {}
        # Pre-validate structure
        product = product_schema.load(data)
        
        # Check SKU uniqueness
        existing = Product.query.filter_by(sku=product.sku).first()
        if existing:
            return jsonify({"errors": {"sku": ["SKU must be unique."]}}), 409
            
        db.session.add(product)
        db.session.commit()
        return jsonify(product_schema.dump(product)), 201
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400
    except Exception as err:
        db.session.rollback()
        return jsonify({"error": str(err)}), 500

@product_bp.route('/products', methods=['GET'])
def get_products():
    products = Product.query.order_by(Product.id.desc()).all()
    return jsonify(products_schema.dump(products)), 200

@product_bp.route('/products/<int:id>', methods=['GET'])
def get_product(id):
    product = Product.query.get(id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    return jsonify(product_schema.dump(product)), 200

@product_bp.route('/products/<int:id>', methods=['PUT'])
def update_product(id):
    product = Product.query.get(id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
        
    try:
        data = request.get_json() or {}
        
        # Check SKU uniqueness if SKU changes
        if 'sku' in data and data['sku'] != product.sku:
            existing = Product.query.filter_by(sku=data['sku']).first()
            if existing:
                return jsonify({"errors": {"sku": ["SKU must be unique."]}}), 409
                
        updated_product = product_schema.load(data, instance=product, partial=True)
        db.session.commit()
        return jsonify(product_schema.dump(updated_product)), 200
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400
    except Exception as err:
        db.session.rollback()
        return jsonify({"error": str(err)}), 500

@product_bp.route('/products/<int:id>', methods=['DELETE'])
def delete_product(id):
    product = Product.query.get(id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
        
    try:
        db.session.delete(product)
        db.session.commit()
        return jsonify({"message": "Product deleted successfully."}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({
            "error": "Cannot delete product because it has associated order items. Try updating inventory stock to 0 instead."
        }), 409
    except Exception as err:
        db.session.rollback()
        return jsonify({"error": str(err)}), 500
