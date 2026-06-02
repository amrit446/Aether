import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import { NotificationProvider } from './context/NotificationContext';

// Define stunning custom Dark Theme for Aether Management System
const customDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0B0F19', // Extremely deep navy/slate
      paper: '#131924',   // Dark blue-grey card bg
    },
    primary: {
      main: '#6366F1', // Indigo
      light: '#818CF8',
      dark: '#4F46E5',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#EC4899', // Pink
      light: '#F472B6',
      dark: '#DB2777',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#10B981', // Emerald Green
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B', // Amber
      dark: '#D97706',
    },
    error: {
      main: '#EF4444', // Rose Red
      dark: '#DC2626',
    },
    text: {
      primary: '#F3F4F6',
      secondary: '#9CA3AF',
    },
    divider: 'rgba(255, 255, 255, 0.05)',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, sans-serif",
    h1: { fontFamily: "'Outfit', sans-serif", fontWeight: 800 },
    h2: { fontFamily: "'Outfit', sans-serif", fontWeight: 800 },
    h3: { fontFamily: "'Outfit', sans-serif", fontWeight: 700 },
    h4: { fontFamily: "'Outfit', sans-serif", fontWeight: 700 },
    h5: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
    h6: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
    button: { fontFamily: "'Inter', sans-serif", fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0B0F19',
          color: '#F3F4F6',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 18px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#131924',
          backgroundImage: 'none',
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& label': {
            color: '#9CA3AF',
            fontSize: '0.9rem',
          },
          '& label.Mui-focused': {
            color: '#38BDF8',
          },
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(9, 13, 22, 0.4)',
            borderRadius: '10px',
            color: '#F3F4F6',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.05)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.15)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#38BDF8',
              boxShadow: '0 0 8px rgba(56, 189, 248, 0.15)',
            },
          },
        },
      },
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={customDarkTheme}>
      <CssBaseline />
      <NotificationProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
}
