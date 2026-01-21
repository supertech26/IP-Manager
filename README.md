# IP Manager

A modern, professional inventory and sales management system built with React, designed specifically for IPTV subscriptions and digital products.

## ✨ Features

### 📦 Inventory Management
- Track products, subscriptions, and digital codes
- Real-time stock monitoring with low-stock alerts
- Category-based organization
- Supplier management

### 💰 Sales & Transactions
- Complete sales tracking with customer information
- Subscription management with expiry dates
- Activation codes and M3U URL storage
- Automated profit calculations
- Transaction notes and history

### 🔔 Smart Notifications
- Subscription expiry reminders (7-day alerts)
- Low stock notifications
- Real-time notification badge in header
- Dashboard alerts for expiring subscriptions

### 🔍 Global Search
- Search across inventory and sales
- Filter by customer name, product, phone number
- Search by activation codes and M3U URLs
- Instant results display

### 📊 Reports & Analytics
- Financial metrics (Income, Expenses, Profit)
- Sales performance tracking
- Daily sales summaries
- Operational statistics

### 🎨 Modern UI/UX
- Clean, professional light mode design
- Responsive layout
- Glassmorphism effects
- Inter font typography
- Intuitive navigation

### 🔐 Security
- User authentication with SHA-256 password hashing
- Role-based access (Admin/Staff)
- Session management with timeout
- Protected routes

### 🌍 Multi-language Support
- English
- French (Français)
- Arabic (العربية)
- RTL support for Arabic

### 💾 Data Management
- Export/Import functionality (JSON)
- Activity logs
- Backup and restore system

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ip-manager.git
cd ip-manager
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

### Default Credentials

**Admin Account:**
- Username: `admin`
- Password: `admin123`
- PIN: `1234`

**Staff Account:**
- Username: `staff`
- Password: `staff123`
- PIN: `0000`

> ⚠️ **Important:** Change these default credentials immediately after first login!

## 🏗️ Tech Stack

- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v6
- **Icons:** Phosphor Icons
- **Styling:** Vanilla CSS with CSS Variables
- **State Management:** React Context API
- **Security:** SHA-256 hashing

## 📁 Project Structure

```
ip-manager/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Layout.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/            # Application pages
│   │   ├── Dashboard.jsx
│   │   ├── Inventory.jsx
│   │   ├── Sales.jsx
│   │   ├── Reports.jsx
│   │   ├── Suppliers.jsx
│   │   ├── Users.jsx
│   │   ├── Settings.jsx
│   │   └── Login.jsx
│   ├── context/          # Global state management
│   │   └── AppContext.jsx
│   ├── styles/           # CSS stylesheets
│   │   ├── global.css
│   │   ├── layout.css
│   │   └── components.css
│   ├── utils/            # Utility functions
│   │   ├── security.js
│   │   └── translations.js
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
├── index.html
├── package.json
└── vite.config.js
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📝 Usage Guide

### Adding Products
1. Navigate to **Inventory**
2. Click **Add Product**
3. Fill in product details (name, category, price, stock, etc.)
4. Click **Save Product**

### Creating Sales Transactions
1. Navigate to **Sales**
2. Click **New Transaction**
3. Enter customer information
4. Select product and subscription details
5. Add activation code and M3U URL (optional)
6. Add notes if needed
7. Click **Complete Sale**

### Managing Subscriptions
- View expiring subscriptions on the Dashboard
- Check the notification bell for alerts
- Renew subscriptions directly from alerts

### Using Global Search
- Use the search bar in the header
- Search by customer name, product, phone, codes, or M3U URLs
- Results appear instantly on the Dashboard

### Exporting Data
1. Go to **Settings**
2. Select **Backup & Restore**
3. Click **Export JSON**
4. Save the backup file

## 🎨 Customization

### Changing Theme
The application uses CSS variables for easy theming. Edit `src/styles/global.css`:

```css
:root {
    --bg-app: #f8fafc;
    --bg-surface: #ffffff;
    --primary: #6366f1;
    /* ... more variables */
}
```

### Adding Languages
Add translations in `src/utils/translations.js`:

```javascript
export const translations = {
    en: { /* English */ },
    fr: { /* French */ },
    ar: { /* Arabic */ },
    // Add your language here
};
```

## 🔒 Security Best Practices

1. **Change default credentials** immediately
2. Use **strong passwords** (minimum 8 characters)
3. Set unique **PINs** for each user
4. Regularly **backup your data**
5. Keep dependencies **up to date**

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, please open an issue on GitHub.

---

**Built with ❤️ for efficient inventory and sales management**
