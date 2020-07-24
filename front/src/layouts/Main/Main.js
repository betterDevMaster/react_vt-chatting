import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/styles';
import { useMediaQuery } from '@material-ui/core';

import { Sidebar, Topbar, Footer } from './components';

const useStyles = makeStyles(theme => ({
  root: {
    
    // padding: '150px 350px 150px 350px',
    // width: '100%',
    // height: '100%',
    // overflow: 'hidden',
    paddingTop: 56,
    height: '100%',
    [theme.breakpoints.up('sm')]: {
      paddingTop: 64
    },
    
  },
  shiftContent: {
    paddingLeft: 300
  },
  content: {
    height: '100%'
    // width: '100%',
    // height: '100%',
    // overflowY: 'scroll',
    // boxShadow: '0 0 18px 10px rgba(0,0,0,0.2)'
  }
}));

const Main = props => {
  const { children } = props;

  const classes = useStyles();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'), {
    defaultMatches: true
  });

  const [openSidebar, setOpenSidebar] = useState(false);

  const handleSidebarOpen = () => {
    setOpenSidebar(true);
  };

  const handleSidebarClose = () => {
    setOpenSidebar(false);
  };

  const shouldOpenSidebar = isDesktop ? true : openSidebar;

  return (
    <div
      className={clsx({
        [classes.root]: true,
        [classes.shiftContent]: isDesktop
      })}
    >
      <main className={classes.content}>
        <Topbar onSidebarOpen={handleSidebarOpen} />
        <Sidebar
          onClose={handleSidebarClose}
          open={shouldOpenSidebar}
          variant={isDesktop ? 'persistent' : 'temporary'}
        />
        {children}
        <Footer />
      </main>
    </div>
  );
};

Main.propTypes = {
  children: PropTypes.node
};

export default Main;
