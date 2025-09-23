# WC Pathsala Mobile App

A Progressive Web Application (PWA) built with React, TypeScript, and Vite for attendance management.

## Features

- **Login Authentication**: Secure login with token-based authentication
- **Three Main Tabs**:
  - **Attendance**: QR code scanning for attendance marking
  - **Manual**: Manual attendance entry with student search and bulk actions
  - **Account**: User profile and app information
- **Progressive Web App**: Can be installed on mobile devices
- **Offline Support**: Basic offline functionality with service worker
- **Responsive Design**: Mobile-first responsive design
- **Modern UI**: Clean, modern interface with smooth animations

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **PWA**: Vite PWA Plugin with Workbox
- **Styling**: CSS with mobile-first approach

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
   ```bash
   cd mobileapp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
mobileapp/
├── public/
│   ├── pwa-192x192.svg      # PWA icon 192x192
│   ├── pwa-512x512.svg      # PWA icon 512x512
│   └── apple-touch-icon.svg # Apple touch icon
├── src/
│   ├── components/
│   │   ├── tabs/
│   │   │   ├── Attendance.tsx
│   │   │   ├── Manual.tsx
│   │   │   └── Account.tsx
│   │   ├── Login.tsx
│   │   └── TabLayout.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── index.html
├── vite.config.ts
├── package.json
└── README.md
```

## Features Overview

### Login Page
- Email and password authentication
- Integration with WC Pathsala backend API
- Secure token storage
- Error handling and loading states

### Attendance Tab
- QR code scanning simulation
- Real-time attendance marking
- Current time display
- Attendance statistics

### Manual Tab
- Student list with search functionality
- Individual attendance toggle
- Bulk actions (Mark All Present/Absent)
- Attendance counter

### Account Tab
- User profile information
- Settings and logout functionality
- App information and support details

## PWA Features

- **Installable**: Can be installed on mobile devices
- **Offline Support**: Basic offline functionality
- **Service Worker**: Automatic updates and caching
- **App Manifest**: Proper PWA manifest configuration
- **Mobile Optimized**: Touch-friendly interface

## API Integration

The app connects to the WC Pathsala backend API:
- Base URL: `https://wcpathshala-org-au-backend-e9h2.onrender.com/api`
- Authentication endpoint: `/auth/login`
- Token-based authentication with localStorage persistence

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run start` - Start production server with host binding

### Environment Variables

Create a `.env` file in the root directory if you need to customize:

```env
VITE_API_URL=https://wcpathshala-org-au-backend-e9h2.onrender.com/api
```

## Deployment

The app can be deployed to any static hosting service:

- **Vercel**: `vercel --prod`
- **Netlify**: Connect repository and deploy
- **GitHub Pages**: Use GitHub Actions
- **Firebase Hosting**: `firebase deploy`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the WC Pathsala system.

## Support

For support, contact: support@wcpathsala.com
