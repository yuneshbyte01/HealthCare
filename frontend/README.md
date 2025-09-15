# Healthcare AI System - Frontend

A modern React frontend for the Healthcare AI System with role-based navigation, bilingual support (English/Nepali), and comprehensive healthcare management features.

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Patient, Clinic Staff, Admin)
- Protected routes with automatic redirects

### 🌐 Internationalization
- Full bilingual support (English/Nepali)
- Dynamic language switching
- Comprehensive translation coverage

### 📊 Role-Based Dashboards
- **Patient Dashboard**: Next appointment, quick booking, recent activity
- **Staff Dashboard**: Urgent cases, today's appointments, alerts preview
- **Admin Dashboard**: System stats, AI status, performance metrics

### 📅 Appointment Management
- Book appointments with AI recommendations
- View and manage appointments
- Reschedule and cancel appointments
- Offline sync capabilities
- AI-powered appointment suggestions

### �� AI Integration
- AI recommendation system for appointments
- Test AI models functionality
- Model retraining (Admin only)
- AI status monitoring

### 📈 Analytics & Reporting
- Trends analysis with interactive charts
- Real-time alerts and notifications
- Geographic distribution analytics
- Performance metrics and monitoring

### 👤 Profile Management
- Role-specific profile forms
- Complete profile information
- Update and manage personal details

## Technology Stack

- **React 19** - Modern React with hooks
- **React Router** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **Chart.js** - Interactive charts and graphs
- **Axios** - HTTP client for API calls
- **i18next** - Internationalization framework
- **Context API** - State management

## Project Structure

```
src/
├── api/
│   └── axios.js              # API configuration
├── context/
│   └── AuthContext.jsx       # Authentication context
├── components/
│   ├── Navbar.jsx            # Navigation component
│   └── ProtectedRoute.jsx    # Route protection
├── pages/
│   ├── Auth/                 # Authentication pages
│   ├── Dashboards/           # Role-based dashboards
│   ├── Profile/              # Profile management
│   ├── Appointments/         # Appointment management
│   ├── AI/                   # AI management
│   └── Analytics/            # Analytics and reporting
├── i18n/                     # Internationalization
└── App.js                    # Main application component
```

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Building for Production

```bash
npm run build
```

## API Integration

The frontend integrates with the backend API at `http://localhost:5000/api`. All API calls are configured in `src/api/axios.js` with:

- Automatic JWT token attachment
- Request/response interceptors
- Error handling and token expiration management

## Role-Based Features

### Patient Features
- Book appointments
- View personal appointments
- AI recommendations
- Profile management
- Offline sync

### Clinic Staff Features
- View all appointments
- Manage urgent cases
- Access analytics
- View alerts

### Admin Features
- Full system access
- AI model management
- Advanced analytics
- Geographic reports
- Performance monitoring

## Styling

The application uses TailwindCSS with a custom healthcare theme:

- **Primary**: Blue (#2563EB)
- **Secondary**: Emerald (#10B981)
- **Danger**: Red (#DC2626)
- **Warning**: Amber (#F59E0B)

## Contributing

1. Follow the existing code structure
2. Maintain bilingual support for all new features
3. Ensure role-based access control
4. Add proper error handling
5. Include loading states for async operations

## License

This project is part of the Healthcare AI System.

## 28. Create a final summary of the complete frontend structure:

The complete Healthcare AI System frontend has been created with the following structure:

### ✅ **Completed Components:**

1. **Core Infrastructure:**
   - ✅ Updated `package.json` with all required dependencies
   - ✅ TailwindCSS configuration
   - ✅ PostCSS configuration
   - ✅ AuthContext for state management
   - ✅ Updated API service with interceptors
   - ✅ Comprehensive i18n translations (EN/NP)

2. **Navigation & Routing:**
   - ✅ Modern Navbar with role-based links
   - ✅ ProtectedRoute component
   - ✅ Role-based dashboard routing
   - ✅ Complete App.js with all routes

3. **Authentication:**
   - ✅ Login page with bilingual support
   - ✅ Register page with role selection

4. **Dashboards (Role-based):**
   - ✅ Patient Dashboard (next appointment, quick actions)
   - ✅ Staff Dashboard (urgent cases, alerts preview)
   - ✅ Admin Dashboard (system stats, AI status)

5. **Profile Management:**
   - ✅ Patient Profile (medical history, personal info)
   - ✅ Staff Profile (position, department, schedule)
   - ✅ Admin Profile (permissions, system access)

6. **Appointment System:**
   - ✅ Book Appointments (with doctor selection, time slots)
   - ✅ Appointment List (role-based views)
   - ✅ AI Recommendations (symptom-based suggestions)
   - ✅ Sync Component (offline appointment sync)
   - ✅ Test AI (model testing interface)

7. **AI Management (Admin only):**
   - ✅ AI Retrain (model retraining interface)
   - ✅ AI Status (model performance monitoring)

8. **Analytics & Reporting:**
   - ✅ Trends (interactive charts with Chart.js)
   - ✅ Alerts (system notifications and warnings)
   - ✅ Geographic (regional distribution analytics)
   - ✅ Performance (system and AI performance metrics)

9. **Additional Pages:**
   - ✅ Home page (role-based landing)
   - ✅ Forbidden page (access denied)

### 🎨 **Design Features:**
- ✅ Modern healthcare-themed UI with TailwindCSS
- ✅ Responsive design for all screen sizes
- ✅ Consistent color palette (Blue, Emerald, Red, Amber)
- ✅ Interactive charts and data visualizations
- ✅ Loading states and error handling
- ✅ Smooth transitions and hover effects

### 🌐 **Bilingual Support:**
- ✅ Complete English/Nepali translations
- ✅ Language toggle in navbar
- ✅ All UI text supports both languages
- ✅ Dynamic language switching

### 🔒 **Security & Access Control:**
- ✅ JWT-based authentication
- ✅ Role-based route protection
- ✅ Automatic token management
- ✅ Secure API integration

The frontend is now complete and ready for integration with the backend APIs. All components follow the specified requirements with modern React patterns, comprehensive error handling, and a professional healthcare-focused design.
