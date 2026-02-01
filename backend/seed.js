import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, "database.db");
const db = new Database(dbPath);

// Clear existing data
db.prepare("DELETE FROM order_items").run();
db.prepare("DELETE FROM orders").run();
db.prepare("DELETE FROM menu_items").run();

console.log("Cleared existing data");

// Sample menu items
const menuItems = [
  // Appetizers
  { name: "Crispy Spring Rolls", description: "Golden fried spring rolls stuffed with vegetables", category: "Appetizer", price: 8.99, ingredients: ["cabbage", "carrot", "glass noodles", "spring roll wrapper"], preparation_time: 15, image_url: "https://images.unsplash.com/photo-1544025162-d76694265947" },
  { name: "Garlic Bread", description: "Toasted bread with garlic butter and herbs", category: "Appetizer", price: 5.99, ingredients: ["bread", "garlic", "butter", "parsley"], preparation_time: 10, image_url: "https://images.unsplash.com/photo-1619535860434-cf9b902a0a14" },
  { name: "Chicken Wings", description: "Crispy buffalo chicken wings with blue cheese dip", category: "Appetizer", price: 12.99, ingredients: ["chicken wings", "buffalo sauce", "blue cheese"], preparation_time: 20, image_url: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f" },
  { name: "Onion Rings", description: "Beer-battered crispy onion rings", category: "Appetizer", price: 6.99, ingredients: ["onion", "flour", "beer", "breadcrumbs"], preparation_time: 12, image_url: "https://images.unsplash.com/photo-1639024471283-03518883512d" },
  
  // Main Courses
  { name: "Grilled Salmon", description: "Atlantic salmon with lemon herb butter", category: "Main Course", price: 24.99, ingredients: ["salmon", "lemon", "herbs", "butter", "asparagus"], preparation_time: 25, image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288" },
  { name: "Beef Steak", description: "Prime ribeye steak cooked to perfection", category: "Main Course", price: 32.99, ingredients: ["ribeye", "garlic", "rosemary", "butter"], preparation_time: 30, image_url: "https://images.unsplash.com/photo-1600891964092-4316c288032e" },
  { name: "Margherita Pizza", description: "Classic pizza with fresh mozzarella and basil", category: "Main Course", price: 16.99, ingredients: ["pizza dough", "tomato sauce", "mozzarella", "basil"], preparation_time: 20, image_url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002" },
  { name: "Chicken Alfredo Pasta", description: "Creamy fettuccine with grilled chicken", category: "Main Course", price: 18.99, ingredients: ["fettuccine", "chicken", "cream", "parmesan"], preparation_time: 22, image_url: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a" },
  { name: "Vegetable Stir Fry", description: "Fresh vegetables in savory sauce with rice", category: "Main Course", price: 14.99, ingredients: ["broccoli", "bell peppers", "mushrooms", "soy sauce", "rice"], preparation_time: 18, image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd" },
  { name: "Fish and Chips", description: "Beer-battered cod with crispy fries", category: "Main Course", price: 17.99, ingredients: ["cod", "potatoes", "flour", "beer"], preparation_time: 25, image_url: "https://images.unsplash.com/photo-1579208030886-b937da0925dc" },
  
  // Desserts
  { name: "Chocolate Lava Cake", description: "Warm chocolate cake with molten center", category: "Dessert", price: 9.99, ingredients: ["dark chocolate", "butter", "eggs", "sugar"], preparation_time: 15, image_url: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51" },
  { name: "Tiramisu", description: "Classic Italian coffee-flavored dessert", category: "Dessert", price: 8.99, ingredients: ["mascarpone", "espresso", "ladyfingers", "cocoa"], preparation_time: 10, image_url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9" },
  { name: "Cheesecake", description: "New York style creamy cheesecake", category: "Dessert", price: 7.99, ingredients: ["cream cheese", "graham crackers", "eggs", "vanilla"], preparation_time: 10, image_url: "https://images.unsplash.com/photo-1565958011703-44f9829ba187" },
  
  // Beverages
  { name: "Fresh Lemonade", description: "House-made lemonade with mint", category: "Beverage", price: 4.99, ingredients: ["lemon", "sugar", "mint", "water"], preparation_time: 5, image_url: "https://images.unsplash.com/photo-1621263764928-df1444c5e859" },
  { name: "Mango Smoothie", description: "Creamy tropical mango smoothie", category: "Beverage", price: 6.99, ingredients: ["mango", "yogurt", "honey", "ice"], preparation_time: 5, image_url: "https://images.unsplash.com/photo-1546173159-315724a31696" },
  { name: "Espresso", description: "Double shot Italian espresso", category: "Beverage", price: 3.99, ingredients: ["espresso beans"], preparation_time: 3, image_url: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a" },
  { name: "Iced Tea", description: "Refreshing iced tea with lemon", category: "Beverage", price: 3.49, ingredients: ["black tea", "lemon", "sugar", "ice"], preparation_time: 5, image_url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc" },
];

// Insert menu items
const insertMenuItem = db.prepare(`
  INSERT INTO menu_items (name, description, category, price, ingredients, is_available, preparation_time, image_url)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const menuItemIds = [];
for (const item of menuItems) {
  const result = insertMenuItem.run(
    item.name,
    item.description,
    item.category,
    item.price,
    JSON.stringify(item.ingredients),
    1,
    item.preparation_time,
    item.image_url
  );
  menuItemIds.push(result.lastInsertRowid);
}

console.log(`Inserted ${menuItems.length} menu items`);

// Sample orders
const customerNames = ["John Smith", "Emma Wilson", "Michael Brown", "Sarah Davis", "James Johnson", "Emily Taylor", "David Anderson", "Lisa Martinez", "Robert Garcia", "Jennifer Lee"];
const statuses = ["Pending", "Preparing", "Ready", "Delivered", "Cancelled"];

const insertOrder = db.prepare(`
  INSERT INTO orders (order_number, total_amount, status, customer_name, table_number)
  VALUES (?, ?, ?, ?, ?)
`);

const insertOrderItem = db.prepare(`
  INSERT INTO order_items (order_id, menu_item_id, quantity, price)
  VALUES (?, ?, ?, ?)
`);

for (let i = 0; i < 12; i++) {
  const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const tableNumber = Math.floor(Math.random() * 20) + 1;
  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  
  // Random 1-4 items per order
  const numItems = Math.floor(Math.random() * 4) + 1;
  const orderItems = [];
  let totalAmount = 0;
  
  const usedItemIds = new Set();
  for (let j = 0; j < numItems; j++) {
    let itemIndex;
    do {
      itemIndex = Math.floor(Math.random() * menuItemIds.length);
    } while (usedItemIds.has(itemIndex));
    usedItemIds.add(itemIndex);
    
    const menuItemId = menuItemIds[itemIndex];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const price = menuItems[itemIndex].price;
    
    orderItems.push({ menuItemId, quantity, price });
    totalAmount += price * quantity;
  }
  
  const orderResult = insertOrder.run(orderNumber, totalAmount, status, customerName, tableNumber);
  const orderId = orderResult.lastInsertRowid;
  
  for (const item of orderItems) {
    insertOrderItem.run(orderId, item.menuItemId, item.quantity, item.price);
  }
}

console.log("Inserted 12 sample orders");
console.log("Database seeded successfully!");

db.close();
