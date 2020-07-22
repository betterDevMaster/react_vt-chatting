import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';

// import { Topbar } from './components';

const useStyles = makeStyles(() => ({
  root: {
    padding: 100,
    width: '100%',
    height: '100%',
  },
  content: {
    height: '100%',
    boxShadow: '0 0 18px 10px rgba(0,0,0,0.2)'
  }
}));

const Minimal = props => {
  const { children } = props;

  const classes = useStyles();

  return (
    <div className={classes.root}>
      {/* <Topbar /> */}
      <main className={classes.content}>{children}</main>
    </div>
  );
};

Minimal.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};

export default Minimal;
