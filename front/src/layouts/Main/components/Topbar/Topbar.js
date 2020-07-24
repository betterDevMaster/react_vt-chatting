import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { withStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Avatar, Button, Typography, Menu, MenuItem, ListItemIcon, ListItemText, Fade } from '@material-ui/core';

import AccountBoxIcon from '@material-ui/icons/AccountBox';
import SettingsIcon from '@material-ui/icons/Settings';
import SettingsPowerIcon from '@material-ui/icons/SettingsPower';
import DashboardIcon from '@material-ui/icons/Dashboard';

const useStyles = makeStyles(theme => ({
  root: {
    boxShadow: 'none',
    width: '100%',
    // paddingLeft: 300
  },
  flexGrow: {
    flexGrow: 1,
    // paddingLeft: 300
  },
  signOutButton: {
    marginLeft: theme.spacing(1)
  },
  avatarContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: 'fit-content',
  },
  avatar: {
    width: 40,
    height: 40,
  },
  name: {
    color: '#fff',
    textTransform: 'none'
  }
}));

const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
  },
})((props) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    TransitionComponent={Fade}
    {...props}
  />
));

const StyledMenuItem = withStyles((theme) => ({
  root: {
    '&:focus': {
      backgroundColor: theme.palette.primary.main,
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: theme.palette.common.white,
      },
    },
  },
}))(MenuItem);

const Topbar = props => {
  const { className, onSidebarOpen, ...rest } = props;
  const user = {
    name: 'Shen Zhi',
    avatar: '/images/avatars/avatar_11.png',
    bio: 'Brain Director'
  };
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);  
  };

  return (
    <AppBar
      {...rest}
      className={clsx(classes.root, className)}
    >
      <Toolbar>
        <div className={classes.flexGrow} >

        </div>
        <div>
          <Button
            className={classes.avatarContainer}
            aria-controls="customized-menu"
            aria-haspopup="true"
            variant="contained"
            color="primary"
            onClick={handleClick}
          >
            <Avatar
              alt="Person"
              className={classes.avatar}
              src={user.avatar}
            />
            <Typography
              className={classes.name}
              variant="h6"
            >
              {user.name}
            </Typography>
          </Button>
          <StyledMenu
            id="customized-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <StyledMenuItem 
              component={RouterLink}
              to="/dashboard"
              onClose={handleClose}
            >
              <ListItemIcon>
                <DashboardIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </StyledMenuItem>
            
            <StyledMenuItem 
              component={RouterLink}
              to="/account"
              onClose={handleClose}
            >
              <ListItemIcon>
                <AccountBoxIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </StyledMenuItem>

            <StyledMenuItem
              component={RouterLink}
              to="/settings"
              onClose={handleClose}
            >
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Setting" />
            </StyledMenuItem>

            <StyledMenuItem
              component={RouterLink}
              to="/"
              onClose={handleClose}
            >
              <ListItemIcon>
                <SettingsPowerIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Log Out" />
            </StyledMenuItem>

          </StyledMenu>
        </div>
      </Toolbar>
    </AppBar>
  );
};

Topbar.propTypes = {
  className: PropTypes.string,
  onSidebarOpen: PropTypes.func
};

export default Topbar;
