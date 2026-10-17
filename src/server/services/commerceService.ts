import { databaseService as db } from "../models/queryModel";
import { validateRequiredFields } from "./validationService";
import { publishEvent as broadcast } from "./eventService";

export const getProducts = async (req, res) => {
    const products = await db.prepare("SELECT * FROM products ORDER BY created_at DESC").all();
    res.json(products);
  };

export const getProductsById = async (req, res) => {
    const product = await db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  };

export const postProducts = async (req, res) => {
    const { name, category, description, price, image_url, selling_options, stock } = req.body;
    const info = await db.prepare(`
      INSERT INTO products (name, category, description, price, image_url, selling_options, stock)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, category, description, price, image_url, selling_options, stock || 0);
    res.json({ id: info.lastInsertRowid });
  };

export const putProductsById = async (req, res) => {
    const { name, category, description, price, image_url, selling_options, stock } = req.body;
    await db.prepare(`
      UPDATE products 
      SET name = ?, category = ?, description = ?, price = ?, image_url = ?, selling_options = ?, stock = ?
      WHERE id = ?
    `).run(name, category, description, price, image_url, selling_options, stock, req.params.id);
    res.json({ success: true });
  };

export const deleteProductsById = async (req, res) => {
    await db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  };

export const getOrders = async (req, res) => {
    const orders = await db.prepare(`
      SELECT o.*, p.name as product_name 
      FROM orders o
      JOIN products p ON o.product_id = p.id
      ORDER BY o.created_at DESC
    `).all();
    res.json(orders);
  };

export const getOrdersById = async (req, res) => {
    const order = await db.prepare(`
      SELECT o.*, p.name as product_name, p.image_url as product_image
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE o.id = ?
    `).get(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  };

export const postOrders = async (req, res) => {
    const validationError = validateRequiredFields(req.body, ["product_id", "customer_name", "customer_email", "customer_mobile", "customer_address", "quantity", "total_price"]);
    if (validationError) return res.status(400).json({ error: validationError });
    const { product_id, customer_name, customer_email, customer_mobile, customer_address, quantity, total_price, payment_method, payment_details } = req.body;
    const info = await db.prepare(`
      INSERT INTO orders (product_id, customer_name, customer_email, customer_mobile, customer_address, quantity, total_price, payment_method, payment_details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(product_id, customer_name, customer_email, customer_mobile, customer_address, quantity, total_price, payment_method, payment_details);
    res.json({ id: info.lastInsertRowid });
  };

export const putOrdersByIdStatus = async (req, res) => {
    const { status } = req.body;
    await db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  };

export const getGrounds = async (req, res) => {
    const grounds = await db.prepare("SELECT * FROM grounds ORDER BY created_at DESC").all();
    res.json(grounds);
  };

export const getGroundsById = async (req, res) => {
    const ground = await db.prepare("SELECT * FROM grounds WHERE id = ?").get(req.params.id);
    res.json(ground);
  };

export const postGrounds = async (req, res) => {
    const { name, location, description, price_per_hour, image_url, amenities } = req.body;
    const info = await db.prepare(`
      INSERT INTO grounds (name, location, description, price_per_hour, image_url, amenities)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, location, description, price_per_hour, image_url, amenities);
    res.json({ id: info.lastInsertRowid });
  };

export const putGroundsById = async (req, res) => {
    const { name, location, description, price_per_hour, image_url, amenities } = req.body;
    await db.prepare(`
      UPDATE grounds 
      SET name = ?, location = ?, description = ?, price_per_hour = ?, image_url = ?, amenities = ?
      WHERE id = ?
    `).run(name, location, description, price_per_hour, image_url, amenities, req.params.id);
    res.json({ success: true });
  };

export const deleteGroundsById = async (req, res) => {
    await db.prepare("DELETE FROM grounds WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  };

export const getBookings = async (req, res) => {
    const bookings = await db.prepare(`
      SELECT b.*, g.name as ground_name, g.image_url as ground_image
      FROM ground_bookings b
      JOIN grounds g ON b.ground_id = g.id
      ORDER BY b.created_at DESC
    `).all();
    res.json(bookings);
  };

export const postBookings = async (req, res) => {
    const { ground_id, customer_name, customer_email, customer_mobile, booking_date, start_time, end_time, total_price, payment_method, payment_details } = req.body;
    const info = await db.prepare(`
      INSERT INTO ground_bookings (ground_id, customer_name, customer_email, customer_mobile, booking_date, start_time, end_time, total_price, payment_method, payment_details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(ground_id, customer_name, customer_email, customer_mobile, booking_date, start_time, end_time, total_price, payment_method, payment_details);
    res.json({ id: info.lastInsertRowid });
  };

export const putBookingsByIdStatus = async (req, res) => {
    const { status } = req.body;
    await db.prepare("UPDATE ground_bookings SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  };

export const getBookingsById = async (req, res) => {
    const booking = await db.prepare(`
      SELECT b.*, g.name as ground_name, g.location as ground_location, g.image_url as ground_image
      FROM ground_bookings b
      JOIN grounds g ON b.ground_id = g.id
      WHERE b.id = ?
    `).get(req.params.id);
    res.json(booking);
  };

