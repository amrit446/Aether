import json
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order
from app.extensions import db

# ----------------- PRODUCT TESTS -----------------

def test_create_product(client):
    # Test valid creation
    res = client.post('/products', json={
        "name": "Super Laptop Pro",
        "sku": "LAPTOP-PRO-01",
        "price": 1299.99,
        "quantity_in_stock": 25
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data["id"] is not None
    assert data["sku"] == "LAPTOP-PRO-01"

    # Test SKU uniqueness conflict (409)
    res2 = client.post('/products', json={
        "name": "Another Laptop",
        "sku": "LAPTOP-PRO-01",
        "price": 999.00,
        "quantity_in_stock": 5
    })
    assert res2.status_code == 409

    # Test price positive constraint validation (400)
    res3 = client.post('/products', json={
        "name": "Free Tablet",
        "sku": "TABLET-01",
        "price": -10.00,
        "quantity_in_stock": 10
    })
    assert res3.status_code == 400
    assert "price" in res3.get_json()["errors"]

    # Test quantity non-negative constraint validation (400)
    res4 = client.post('/products', json={
        "name": "Tablet",
        "sku": "TABLET-02",
        "price": 150.00,
        "quantity_in_stock": -5
    })
    assert res4.status_code == 400
    assert "quantity_in_stock" in res4.get_json()["errors"]


def test_get_and_update_product(client):
    # Setup product
    client.post('/products', json={
        "name": "Mobile Phone X",
        "sku": "PHONE-X",
        "price": 799.00,
        "quantity_in_stock": 50
    })

    # Fetch product list
    res = client.get('/products')
    assert res.status_code == 200
    products = res.get_json()
    assert len(products) == 1
    prod_id = products[0]["id"]

    # Update product
    res2 = client.put(f'/products/{prod_id}', json={
        "name": "Mobile Phone X Updated",
        "price": 849.00
    })
    assert res2.status_code == 200
    data = res2.get_json()
    assert data["name"] == "Mobile Phone X Updated"
    assert float(data["price"]) == 849.00


# ----------------- CUSTOMER TESTS -----------------

def test_create_customer(client):
    # Test valid customer
    res = client.post('/customers', json={
        "full_name": "Alice Smith",
        "email": "alice@gmail.com",
        "phone_number": "+12345678"
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data["id"] is not None

    # Test unique email conflict (409)
    res2 = client.post('/customers', json={
        "full_name": "Alice Cooper",
        "email": "alice@gmail.com"
    })
    assert res2.status_code == 409

    # Test email format validation (400)
    res3 = client.post('/customers', json={
        "full_name": "Bob",
        "email": "invalid-email-format"
    })
    assert res3.status_code == 400
    assert "email" in res3.get_json()["errors"]


# ----------------- ORDER & BUSINESS RULE TESTS -----------------

def test_transactional_order_processing(client):
    # 1. Setup Customer
    cust_res = client.post('/customers', json={
        "full_name": "Charlie Brown",
        "email": "charlie@peanuts.com"
    })
    cust_id = cust_res.get_json()["id"]

    # 2. Setup Product
    prod_res = client.post('/products', json={
        "name": "Premium Keyboard",
        "sku": "KEY-PREM-99",
        "price": 150.00,
        "quantity_in_stock": 10
    })
    prod_id = prod_res.get_json()["id"]

    # 3. Success Case: Place Order (reducing inventory)
    order_res = client.post('/orders', json={
        "customer_id": cust_id,
        "items": [
            {"product_id": prod_id, "quantity": 3}
        ]
    })
    assert order_res.status_code == 201
    order_data = order_res.get_json()
    
    # Assert total_amount calculated on backend (3 * 150.00 = 450.00)
    assert float(order_data["total_amount"]) == 450.00
    assert order_data["status"] == "completed"

    # Assert stock was decremented (10 - 3 = 7)
    prod_check = client.get(f'/products/{prod_id}')
    assert prod_check.get_json()["quantity_in_stock"] == 7


def test_insufficient_stock_error(client):
    # Setup Customer
    cust_res = client.post('/customers', json={
        "full_name": "Charlie Brown",
        "email": "charlie@peanuts.com"
    })
    cust_id = cust_res.get_json()["id"]

    # Setup Product with stock = 2
    prod_res = client.post('/products', json={
        "name": "Limited Art Book",
        "sku": "ART-BOOK-01",
        "price": 50.00,
        "quantity_in_stock": 2
    })
    prod_id = prod_res.get_json()["id"]

    # Try to purchase 5 (insufficient stock)
    order_res = client.post('/orders', json={
        "customer_id": cust_id,
        "items": [
            {"product_id": prod_id, "quantity": 5}
        ]
    })
    
    # Verify rejection (400 Bad Request)
    assert order_res.status_code == 400
    assert "items" in order_res.get_json()["errors"]

    # Verify database stock was NOT reduced (remains 2) due to rollback
    prod_check = client.get(f'/products/{prod_id}')
    assert prod_check.get_json()["quantity_in_stock"] == 2


# ----------------- DASHBOARD TESTS -----------------

def test_dashboard_metrics(client):
    # Setup some base data
    cust_res = client.post('/customers', json={"full_name": "Joe", "email": "joe@test.com"})
    prod_res = client.post('/products', json={"name": "P1", "sku": "P1-SKU", "price": 10.00, "quantity_in_stock": 5}) # stock < 10
    
    # Fetch dashboard
    dash_res = client.get('/dashboard')
    assert dash_res.status_code == 200
    data = dash_res.get_json()
    
    assert data["total_products"] == 1
    assert data["total_customers"] == 1
    assert len(data["low_stock_products"]) == 1
    assert data["low_stock_products"][0]["sku"] == "P1-SKU"
