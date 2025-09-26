import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';

// Import icons for each route
import HomeIcon from '@mui/icons-material/Home';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import StoreIcon from '@mui/icons-material/Store';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';

import { useAuth } from '@/contexts/AuthContext';

const drawerWidth = 240;

interface Props {
  window?: () => Window;
  children: React.ReactNode;
  heading?: String
}

export default function ResponsiveDrawer(props: Props) {
  const { window, children, heading } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const navigate = useNavigate();
  const { logout, userData } = useAuth();

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  // Define navigation items with their icons
  const mainNavs = [
    { text: 'Home', path: '/', icon: <HomeIcon /> },
    { text: 'Scan', path: '/scan', icon: <DocumentScannerIcon /> },
  ];

  // Only show "User" to admin role
  const isAdmin = userData && (userData.role === 'ADMIN' || userData.role === 'Admin');

  const secondaryNavs = [
    { text: 'Invoice', path: '/invoices', icon: <DescriptionIcon /> },
    { text: 'Receipt', path: '/receipts', icon: <ReceiptLongIcon /> },
    { text: 'Customer', path: '/customers', icon: <PeopleIcon /> },
    { text: 'Seller', path: '/sellers', icon: <StoreIcon /> },
    ...(isAdmin ? [{ text: 'User', path: '/users', icon: <PersonIcon /> }] : []),
  ];

  // Helper to handle nav click and close drawer on mobile
  const handleNavClick = (path: string) => {
    navigate(path);
    // Only close the drawer if on mobile (xs)
    setMobileOpen(false);
  };

  // Drawer content with logout button at the bottom
  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box>
        <Divider />
        <List>
          {mainNavs.map((nav) => (
            <ListItem key={nav.text} disablePadding>
              <ListItemButton onClick={() => handleNavClick(nav.path)}>
                <ListItemIcon>
                  {nav.icon}
                </ListItemIcon>
                <ListItemText primary={nav.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          {secondaryNavs.map((nav) => (
            <ListItem key={nav.text} disablePadding>
              <ListItemButton onClick={() => handleNavClick(nav.path)}>
                <ListItemIcon>
                  {nav.icon}
                </ListItemIcon>
                <ListItemText primary={nav.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ p: 1 }}>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                logout();
              }}
            >
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex', height: '100vh', minHeight: 0 }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {heading}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          slotProps={{
            root: {
              keepMounted: true,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          height: '100vh',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar />
        <Box
          sx={{
            flexGrow: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            height: 0, // ensures flexGrow takes over
            width: '100%',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
