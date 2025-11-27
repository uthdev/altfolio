# Altfolio - Alternative Investments Tracker

A full-stack MERN application for tracking alternative investments like startups, crypto funds, collectibles, and farmland.

## 🏗️ Architecture

- **Backend**: Express.js + TypeScript + MongoDB + Zod validation
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Authentication**: JWT with role-based access (admin/viewer)
- **Database**: MongoDB with Mongoose ODM

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- pnpm
- MongoDB (local or cloud)

### Installation

1. Clone and install dependencies:
```bash
git clone <repo-url>
cd altfolio
pnpm install
cd server && pnpm install
cd ../client && pnpm install
```

2. Environment Setup:
```bash
# Copy environment files
cp server/.env.example server/.env
cp client/.env.example client/.env

# Update server/.env with your MongoDB URI and JWT secret
```

3. Start development servers:
```bash
# From root directory - starts both server and client
pnpm run dev

# Or individually:
pnpm run server:dev  # Backend on http://localhost:5000
pnpm run client:dev  # Frontend on http://localhost:5173
```

### Health Check
Visit http://localhost:5000/api/health to verify the backend is running.

## 📁 Project Structure

```
altfolio/
├── server/                 # Express.js backend
│   ├── src/
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth & validation
│   │   ├── types/          # TypeScript types
│   │   ├── scripts/        # Seed scripts
│   │   └── index.ts        # Server entry point
│   ├── .env                # Environment variables
│   └── package.json
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utilities
│   │   └── App.tsx         # App entry point
│   ├── .env                # Environment variables
│   └── package.json
└── package.json            # Root workspace config
```

## 🔧 Development Scripts

```bash
# Development
pnpm run dev              # Start both server and client
pnpm run server:dev       # Start backend only
pnpm run client:dev       # Start frontend only

# Building
pnpm run build            # Build both applications
pnpm run server:build     # Build backend only
pnpm run client:build     # Build frontend only

# Linting
pnpm run lint             # Lint both applications
pnpm run server:lint      # Lint backend only
pnpm run client:lint      # Lint frontend only

# Database
pnpm run seed             # Seed database with sample data
```

## 🎯 Features

### Core Features
- **Authentication**: JWT-based auth with admin/viewer roles
- **Investment Management**: CRUD operations for alternative investments
- **Dashboard**: Analytics and visualizations
- **Role-based Access**: Admins can modify, viewers can only read

### Investment Fields
- `assetName`: Name of the investment
- `assetType`: Startup | Crypto Fund | Farmland | Collectible | Other
- `investedAmount`: Initial investment amount
- `investmentDate`: Date of investment (UTC stored, local display)
- `currentValue`: Manually updated current value
- `owners`: Array of user IDs (many-to-many relationship)

### API Endpoints
- `GET /api/health` - Health check
- `POST /api/auth/login` - User authentication
- `GET /api/investments` - List investments
- `POST /api/investments` - Create investment (admin only)
- `PUT /api/investments/:id` - Update investment (admin only)
- `DELETE /api/investments/:id` - Delete investment (admin only)
- `GET /api/analytics/summary` - Investment analytics

## 🔒 Security Features

- JWT token authentication
- Role-based access control
- Zod schema validation
- CORS configuration
- Input sanitization
- Date handling with timezone considerations

## 🛠️ Tech Stack

### Backend
- Express.js with TypeScript
- MongoDB with Mongoose
- JWT for authentication
- Zod for validation
- bcryptjs for password hashing
- CORS for cross-origin requests

### Frontend
- React 19 with TypeScript
- Vite for build tooling
- React Router for navigation
- Axios for HTTP requests
- Tailwind CSS for styling
- Zod for client-side validation

### Development Tools
- ESLint + Prettier
- TypeScript strict mode
- Hot reload for development
- Concurrently for running multiple processes

## 📊 Investment Date Handling

Investment dates are stored in UTC in the database but displayed in the user's local timezone. This ensures consistency across different time zones while providing a natural user experience.

## 🎨 UI Components

The application uses a component-based architecture with:
- Reusable form components
- Data tables with sorting/filtering
- Modal dialogs
- Charts and visualizations
- Responsive design with Tailwind CSS

## 🚀 Deployment

### Backend
```bash
cd server
pnpm run build
pnpm start
```

### Frontend
```bash
cd client
pnpm run build
# Serve the dist/ folder with your preferred static server
```

## 📝 Environment Variables

### Server (.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/altfolio
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

### Client (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## 🤝 Contributing

1. Follow TypeScript strict mode
2. Use Zod for all validation schemas
3. Maintain consistent code formatting with Prettier
4. Write meaningful commit messages
5. Test both admin and viewer user flows

## 📄 License

ISC