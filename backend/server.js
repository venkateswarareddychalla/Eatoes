import express from "express";
import Database from "better-sqlite3";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Setup app
const app = express();
app.use(express.json());
app.use(cors());

// Setup database
const dbPath = join(__dirname, "database.db");
const db = new Database(dbPath);

// Create tables
db.prepare(`
  CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK(category IN ('Appetizer', 'Main Course', 'Dessert', 'Beverage')),
    price REAL NOT NULL,
    ingredients TEXT,
    is_available INTEGER DEFAULT 1,
    preparation_time INTEGER,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled')),
    customer_name TEXT,
    table_number INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    menu_item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
  )
`).run();

// Create index for search
db.prepare(`CREATE INDEX IF NOT EXISTS idx_menu_items_name ON menu_items(name)`).run();


// MENU ITEM ROUTES


// GET /api/menu - Get all menu items with optional filters
app.get("/api/menu", (req, res) => {
  try {
    let query = "SELECT * FROM menu_items WHERE 1=1";
    const params = [];

    // Filter by category
    if (req.query.category) {
      query += " AND category = ?";
      params.push(req.query.category);
    }

    // Filter by availability
    if (req.query.availability !== undefined) {
      query += " AND is_available = ?";
      params.push(req.query.availability === "true" ? 1 : 0);
    }

    // Filter by price range
    if (req.query.minPrice) {
      query += " AND price >= ?";
      params.push(parseFloat(req.query.minPrice));
    }
    if (req.query.maxPrice) {
      query += " AND price <= ?";
      params.push(parseFloat(req.query.maxPrice));
    }

    query += " ORDER BY created_at DESC";

    const items = db.prepare(query).all(...params);
    
    // Parse ingredients JSON
    const parsedItems = items.map(item => ({
      ...item,
      ingredients: item.ingredients ? JSON.parse(item.ingredients) : [],
      is_available: Boolean(item.is_available)
    }));

    res.json(parsedItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/menu/search - Search menu items
app.get("/api/menu/search", (req, res) => {
  try {
    const searchTerm = req.query.q || "";
    
    if (!searchTerm.trim()) {
      return res.json([]);
    }

    const query = `
      SELECT * FROM menu_items 
      WHERE name LIKE ? OR ingredients LIKE ?
      ORDER BY name ASC
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const items = db.prepare(query).all(searchPattern, searchPattern);
    
    const parsedItems = items.map(item => ({
      ...item,
      ingredients: item.ingredients ? JSON.parse(item.ingredients) : [],
      is_available: Boolean(item.is_available)
    }));

    res.json(parsedItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/menu/:id - Get single menu item
app.get("/api/menu/:id", (req, res) => {
  try {
    const item = db.prepare("SELECT * FROM menu_items WHERE id = ?").get(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    res.json({
      ...item,
      ingredients: item.ingredients ? JSON.parse(item.ingredients) : [],
      is_available: Boolean(item.is_available)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/menu - Create new menu item
app.post("/api/menu", (req, res) => {
  try {
    const { name, description, category, price, ingredients, is_available, preparation_time, image_url } = req.body;

    // Validation
    if (!name || !category || price === undefined) {
      return res.status(400).json({ error: "Name, category, and price are required" });
    }

    const validCategories = ['Appetizer', 'Main Course', 'Dessert', 'Beverage'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    const stmt = db.prepare(`
      INSERT INTO menu_items (name, description, category, price, ingredients, is_available, preparation_time, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name,
      description || null,
      category,
      price,
      ingredients ? JSON.stringify(ingredients) : null,
      is_available !== false ? 1 : 0,
      preparation_time || null,
      image_url || null
    );

    const newItem = db.prepare("SELECT * FROM menu_items WHERE id = ?").get(result.lastInsertRowid);

    res.status(201).json({
      ...newItem,
      ingredients: newItem.ingredients ? JSON.parse(newItem.ingredients) : [],
      is_available: Boolean(newItem.is_available)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/menu/:id - Update menu item
app.put("/api/menu/:id", (req, res) => {
  try {
    const { name, description, category, price, ingredients, is_available, preparation_time, image_url } = req.body;

    const existing = db.prepare("SELECT * FROM menu_items WHERE id = ?").get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    const stmt = db.prepare(`
      UPDATE menu_items 
      SET name = ?, description = ?, category = ?, price = ?, ingredients = ?, 
          is_available = ?, preparation_time = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      name || existing.name,
      description !== undefined ? description : existing.description,
      category || existing.category,
      price !== undefined ? price : existing.price,
      ingredients ? JSON.stringify(ingredients) : existing.ingredients,
      is_available !== undefined ? (is_available ? 1 : 0) : existing.is_available,
      preparation_time !== undefined ? preparation_time : existing.preparation_time,
      image_url !== undefined ? image_url : existing.image_url,
      req.params.id
    );

    const updatedItem = db.prepare("SELECT * FROM menu_items WHERE id = ?").get(req.params.id);

    res.json({
      ...updatedItem,
      ingredients: updatedItem.ingredients ? JSON.parse(updatedItem.ingredients) : [],
      is_available: Boolean(updatedItem.is_available)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/menu/:id - Delete menu item
app.delete("/api/menu/:id", (req, res) => {
  try {
    const existing = db.prepare("SELECT * FROM menu_items WHERE id = ?").get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    db.prepare("DELETE FROM menu_items WHERE id = ?").run(req.params.id);
    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/menu/:id/availability - Toggle availability
app.patch("/api/menu/:id/availability", (req, res) => {
  try {
    const existing = db.prepare("SELECT * FROM menu_items WHERE id = ?").get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    const newAvailability = existing.is_available ? 0 : 1;
    
    db.prepare(`
      UPDATE menu_items 
      SET is_available = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(newAvailability, req.params.id);

    const updatedItem = db.prepare("SELECT * FROM menu_items WHERE id = ?").get(req.params.id);

    res.json({
      ...updatedItem,
      ingredients: updatedItem.ingredients ? JSON.parse(updatedItem.ingredients) : [],
      is_available: Boolean(updatedItem.is_available)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ORDER ROUTES


// Generate unique order number
function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

// GET /api/orders - Get all orders with pagination
app.get("/api/orders", (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let query = "SELECT * FROM orders WHERE 1=1";
    let countQuery = "SELECT COUNT(*) as total FROM orders WHERE 1=1";
    const params = [];
    const countParams = [];

    // Filter by status
    if (req.query.status) {
      query += " AND status = ?";
      countQuery += " AND status = ?";
      params.push(req.query.status);
      countParams.push(req.query.status);
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const orders = db.prepare(query).all(...params);
    const totalResult = db.prepare(countQuery).get(...countParams);
    const total = totalResult.total;

    // Get order items for each order
    const ordersWithItems = orders.map(order => {
      const items = db.prepare(`
        SELECT oi.*, mi.name as menu_item_name, mi.category 
        FROM order_items oi 
        JOIN menu_items mi ON oi.menu_item_id = mi.id 
        WHERE oi.order_id = ?
      `).all(order.id);

      return { ...order, items };
    });

    res.json({
      orders: ordersWithItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/orders/:id - Get single order with items
app.get("/api/orders/:id", (req, res) => {
  try {
    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const items = db.prepare(`
      SELECT oi.*, mi.name as menu_item_name, mi.category, mi.image_url
      FROM order_items oi 
      JOIN menu_items mi ON oi.menu_item_id = mi.id 
      WHERE oi.order_id = ?
    `).all(req.params.id);

    res.json({ ...order, items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/orders - Create new order
app.post("/api/orders", (req, res) => {
  try {
    const { items, customer_name, table_number } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order must contain at least one item" });
    }

    // Calculate total and validate items
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const menuItem = db.prepare("SELECT * FROM menu_items WHERE id = ?").get(item.menu_item_id);
      
      if (!menuItem) {
        return res.status(400).json({ error: `Menu item with id ${item.menu_item_id} not found` });
      }

      const quantity = item.quantity || 1;
      const price = menuItem.price;
      totalAmount += price * quantity;

      validatedItems.push({
        menu_item_id: menuItem.id,
        quantity,
        price
      });
    }

    // Create order
    const orderNumber = generateOrderNumber();
    const orderResult = db.prepare(`
      INSERT INTO orders (order_number, total_amount, customer_name, table_number)
      VALUES (?, ?, ?, ?)
    `).run(orderNumber, totalAmount, customer_name || null, table_number || null);

    const orderId = orderResult.lastInsertRowid;

    // Create order items
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, menu_item_id, quantity, price)
      VALUES (?, ?, ?, ?)
    `);

    for (const item of validatedItems) {
      insertItem.run(orderId, item.menu_item_id, item.quantity, item.price);
    }

    // Get the created order with items
    const newOrder = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
    const orderItems = db.prepare(`
      SELECT oi.*, mi.name as menu_item_name, mi.category
      FROM order_items oi 
      JOIN menu_items mi ON oi.menu_item_id = mi.id 
      WHERE oi.order_id = ?
    `).all(orderId);

    res.status(201).json({ ...newOrder, items: orderItems });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/orders/:id/status - Update order status
app.patch("/api/orders/:id/status", (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const existing = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Order not found" });
    }

    db.prepare(`
      UPDATE orders 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(status, req.params.id);

    const updatedOrder = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
    const items = db.prepare(`
      SELECT oi.*, mi.name as menu_item_name, mi.category
      FROM order_items oi 
      JOIN menu_items mi ON oi.menu_item_id = mi.id 
      WHERE oi.order_id = ?
    `).all(req.params.id);

    res.json({ ...updatedOrder, items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ANALYTICS ROUTES (BONUS)


// GET /api/analytics/top-sellers - Get top 5 selling items
app.get("/api/analytics/top-sellers", (req, res) => {
  try {
    const topSellers = db.prepare(`
      SELECT 
        mi.id,
        mi.name,
        mi.category,
        mi.price,
        mi.image_url,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.quantity * oi.price) as total_revenue
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      GROUP BY mi.id
      ORDER BY total_quantity DESC
      LIMIT 5
    `).all();

    res.json(topSellers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/stats - Get dashboard statistics
app.get("/api/analytics/stats", (req, res) => {
  try {
    const totalItems = db.prepare("SELECT COUNT(*) as count FROM menu_items").get().count;
    const availableItems = db.prepare("SELECT COUNT(*) as count FROM menu_items WHERE is_available = 1").get().count;
    const totalOrders = db.prepare("SELECT COUNT(*) as count FROM orders").get().count;
    const pendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'Pending'").get().count;
    const totalRevenue = db.prepare("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != 'Cancelled'").get().total;

    res.json({
      totalItems,
      availableItems,
      totalOrders,
      pendingOrders,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get("/", (req, res) => res.send("Restaurant Admin API is Working"));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}/`));
