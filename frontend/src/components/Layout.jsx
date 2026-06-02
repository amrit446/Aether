import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as ProductIcon,
  People as CustomerIcon,
  ShoppingBag as OrderIcon,
  Settings as SettingsIcon,
  Assessment as ChartIcon
} from '@mui/icons-material';

const drawerWidth = 260;

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Responsive design triggers
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { text: 'Products', path: '/products', icon: <ProductIcon /> },
    { text: 'Customers', path: '/customers', icon: <CustomerIcon /> },
    { text: 'Orders', path: '/orders', icon: <OrderIcon /> }
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0D1321', color: '#F3F4F6' }}>
      {/* Brand Header */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar 
          src="https://img.icons8.com/fluency/48/000000/box.png" 
          alt="Aether Logo"
          sx={{ width: 36, height: 36 }}
        />
        <Typography 
          variant="h6" 
          sx={{ 
            fontFamily: "'Outfit', sans-serif", 
            fontWeight: 800, 
            letterSpacing: '1px',
            background: 'linear-gradient(45deg, #38BDF8 30%, #818CF8 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase'
          }}
        >
          Aether
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />

      {/* Navigation List */}
      <List sx={{ px: 2, py: 3, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: '12px',
                  py: 1.5,
                  px: 2,
                  transition: 'all 0.2s ease-in-out',
                  bgcolor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid transparent',
                  '&:hover': {
                    bgcolor: isActive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: isActive ? '#38BDF8' : '#9CA3AF',
                    minWidth: 40,
                    transition: 'color 0.2s'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontSize: '0.95rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#F3F4F6' : '#9CA3AF',
                    fontFamily: "'Inter', sans-serif"
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />

      {/* Sidebar Footer User Details */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar 
          sx={{ 
            bgcolor: 'indigo.main', 
            background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
            fontWeight: 600,
            fontSize: '0.9rem',
            width: 40,
            height: 40
          }}
        >
          AD
        </Avatar>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, noWrap: true, color: '#F3F4F6' }}>
            Admin Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: '0.75rem', noWrap: true }}>
            system@aether.com
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0B0F19' }}>
      {/* Upper Navigation Header */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'rgba(11, 15, 25, 0.7)',
          backdropFilter: 'blur(12px)',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          zIndex: theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' }, color: '#9CA3AF' }}
            >
              <MenuIcon />
            </IconButton>
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              sx={{ 
                fontFamily: "'Outfit', sans-serif", 
                fontWeight: 700, 
                color: '#F3F4F6',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              {menuItems.find(item => item.path === location.pathname)?.text || 'Aether Systems'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton sx={{ color: '#9CA3AF' }}>
              <ChartIcon />
            </IconButton>
            <IconButton sx={{ color: '#9CA3AF' }}>
              <SettingsIcon />
            </IconButton>
            <Typography variant="body2" sx={{ color: '#6366F1', fontWeight: 600, display: { xs: 'none', sm: 'block' }, ml: 1 }}>
              v1.0.0 Stable
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer Components */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile View Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid rgba(255,255,255,0.05)' }
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop View Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid rgba(255,255,255,0.05)' }
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          overflowY: 'auto'
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
