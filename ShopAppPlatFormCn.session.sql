CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(12, 2) NOT NULL
);

INSERT INTO products (name, price)
VALUES
    ('iPhone 15', 20000000),
    ('Samsung Galaxy S24', 18000000);