# 🍽️ Eatoes - Restaurant Admin Dashboard

A modern, full-stack restaurant admin dashboard built with React and better-sqlite3. Manage your menu, track orders, and view analytics with a beautiful, responsive interface.

![Dashboard Preview](https://via.placeholder.com/1200x600/1a1f2e/ff6e1e?text=Restaurant+Admin+Dashboard)

## ✨ Features

### 📊 Analytics Dashboard
- Real-time statistics (menu items, orders, revenue)
- Top 5 selling items with visual rankings
- Revenue insights and performance metrics
- Beautiful stat cards with icons

### 🍔 Menu Management
- **Search with Debouncing**: Real-time search with 300ms delay to minimize API calls
- **Advanced Filtering**: Filter by category and availability status
- **CRUD Operations**: Create, read, update, and delete menu items
- **Optimistic UI Updates**: Instant feedback with automatic rollback on errors
- **Rich Menu Cards**: Images, pricing, prep time, ingredients
- **Modal Forms**: Clean, validated forms for adding/editing items

### 📦 Order Management
- **Expandable Order Cards**: View detailed order information
- **Status Management**: Update order status with visual feedback
- **Pagination**: Navigate through orders efficiently
- **Status Filtering**: Filter orders by their current status
- **Order Details**: View items, quantities, and pricing

### 🎨 UI/UX Highlights
- **Glassmorphism Effects**: Modern frosted glass aesthetics
- **Dark Theme**: Eye-friendly dark mode design
- **Smooth Animations**: Polished transitions and hover effects
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Toast Notifications**: Clear feedback for all actions
- **Loading States**: Visual indicators for async operations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd eatoes
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

### Running the Application

1. **Start the backend server** (Terminal 1)
```bash
cd backend
npm run server
```
Server runs at: http://localhost:3000

2. **Seed the database** (First time only)
```bash
cd backend
node seed.js
```

3. **Start the frontend dev server** (Terminal 2)
```bash
cd frontend
npm run dev
```
Frontend runs at: http://localhost:5173

4. **Open your browser**
```
http://localhost:5173
```

## 📁 Project Structure

```
eatoes/
├── backend/
│   ├── server.js          # Express server with all API routes
│   ├── seed.js            # Database seeding script
│   ├── database.db        # SQLite database
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx          # Main layout with sidebar
    │   │   └── Layout.css
    │   ├── pages/
    │   │   ├── Analytics.jsx       # Analytics dashboard
    │   │   ├── MenuManagement.jsx  # Menu CRUD page
    │   │   ├── OrdersDashboard.jsx # Orders page
    │   │   └── *.css               # Component styles
    │   ├── hooks/
    │   │   ├── useDebounce.js      # Debouncing hook
    │   │   └── useFetch.js         # Data fetching hook
    │   ├── Context/
    │   │   └── Context.jsx         # Global state
    │   ├── App.jsx                 # Main app
    │   ├── index.css               # Global styles
    │   └── main.jsx                # Entry point
    └── package.json
```

## 🛠️ Technology Stack

### Frontend
- **React 19.2** - UI library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications
- **Vite** - Build tool and dev server

### Backend
- **Node.js** - Runtime environment
- **Express 5.2** - Web framework
- **better-sqlite3** - SQLite database driver
- **CORS** - Cross-origin resource sharing

### Database
- **SQLite** - Lightweight SQL database
- Tables: `menu_items`, `orders`, `order_items`

## 📡 API Endpoints

### Menu Items
```http
GET    /api/menu                      # Get all menu items (with filters)
GET    /api/menu/search?q={term}      # Search menu items
GET    /api/menu/:id                  # Get single menu item
POST   /api/menu                      # Create menu item
PUT    /api/menu/:id                  # Update menu item
DELETE /api/menu/:id                  # Delete menu item
PATCH  /api/menu/:id/availability     # Toggle availability
```

### Orders
```http
GET    /api/orders?page={p}&limit={l}&status={s}  # Get orders with pagination
GET    /api/orders/:id                            # Get single order
POST   /api/orders                                # Create order
PATCH  /api/orders/:id/status                     # Update order status
```

### Analytics
```http
GET    /api/analytics/stats           # Get dashboard statistics
GET    /api/analytics/top-sellers     # Get top 5 selling items
```

## 🎯 Key Technical Features

### 1. Search with Debouncing
Custom hook that delays search API calls by 300ms after user stops typing:
```javascript
const debouncedSearchTerm = useDebounce(searchTerm, 300);
```

### 2. Optimistic UI Updates
Instant UI feedback for availability toggle with automatic rollback on errors:
```javascript
// Update UI immediately
setMenuItems(updatedItems);

try {
  await axios.patch(`/api/menu/${id}/availability`);
} catch (error) {
  // Rollback on error
  setMenuItems(previousState);
  toast.error('Changes reverted');
}
```

### 3. Colocated Component Architecture
Components are defined in the same file as their parent page for better organization:
```
MenuManagement.jsx
  ├── SearchBar (component)
  ├── FilterBar (component)
  ├── MenuCard (component)
  ├── MenuForm (component)
  └── MenuManagement (page component)
```

### 4. Database Aggregation
SQL query for calculating top sellers:
```sql
SELECT 
  mi.id, mi.name, SUM(oi.quantity) as total_quantity
FROM order_items oi
JOIN menu_items mi ON oi.menu_item_id = mi.id
GROUP BY mi.id
ORDER BY total_quantity DESC
LIMIT 5
```

## 🎨 Design System

### Color Palette
- **Primary**: Orange `hsl(25, 95%, 53%)`
- **Success**: Green `hsl(142, 71%, 45%)`
- **Warning**: Yellow `hsl(45, 93%, 47%)`
- **Danger**: Red `hsl(0, 84%, 60%)`
- **Info**: Blue `hsl(195, 100%, 50%)`
- **Background**: Dark `hsl(220, 20%, 10%)`

### Typography
- Font: Inter (Google Fonts)
- Weights: 300, 400, 500, 600, 700

### Effects
- Glassmorphism with backdrop blur
- Smooth cubic-bezier transitions
- Gradient buttons
- Hover scale transforms
- Custom scrollbars

## 📱 Responsive Breakpoints

- **Desktop**: > 968px - Full sidebar visible
- **Tablet**: 768px - 968px - Collapsible sidebar
- **Mobile**: < 768px - Drawer sidebar with overlay

## 🧪 Testing

### Manual Testing Checklist

**Analytics Page**
- [ ] Stats display correctly
- [ ] Top sellers show with images
- [ ] Revenue calculation is accurate

**Menu Management**
- [ ] Search works with debouncing
- [ ] Create new menu item
- [ ] Edit existing item
- [ ] Delete item with confirmation
- [ ] Toggle availability instantly
- [ ] Filters work correctly

**Orders Dashboard**
- [ ] Orders display with pagination
- [ ] Expand/collapse details
- [ ] Update order status
- [ ] Filter by status

**Navigation**
- [ ] Sidebar navigation works
- [ ] Active route highlighting
- [ ] Mobile menu toggles

## 🚢 Deployment

### Environment Variables

Create `.env` files for production:

**Backend `.env`**
```env
PORT=3000
NODE_ENV=production
```

**Frontend `.env`**
```env
VITE_API_URL=https://your-backend-url.com/api
```

### Build Commands

**Backend**
```bash
npm install
node server.js
```

**Frontend**
```bash
npm install
npm run build
```

### Deployment Platforms

**Recommended:**
- **Frontend**: Netlify, Vercel, Cloudflare Pages
- **Backend**: Render, Railway, Fly.io
- **Database**: SQLite with persistent volume

## 📝 Sample Data

The seed script populates the database with:
- 17 menu items (4 Appetizers, 6 Main Courses, 3 Desserts, 4 Beverages)
- 12 sample orders with various statuses
- 10 different customer names

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC License

## 👨‍💻 Author

**Venkateswara Reddy Challa**

---

## 🎯 Assessment Requirements Completed

✅ RESTful API design and implementation  
✅ SQLite querying, aggregation, and indexing  
✅ React state management and component architecture  
✅ Performance optimization (debouncing, lazy loading)  
✅ Error handling and validation  
✅ Search with 300ms debouncing  
✅ Optimistic UI updates with rollback  
✅ MongoDB-style aggregation (adapted for SQLite)  
✅ Colocated component architecture  
✅ Responsive design  
✅ Modern UI/UX with animations  

---

**Built with ❤️ using React and SQLite**
