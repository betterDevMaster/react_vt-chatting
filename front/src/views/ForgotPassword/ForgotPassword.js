import React, { useState, useEffect } from 'react';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import validate from 'validate.js';
import { makeStyles } from '@material-ui/styles';
import Snackbar from '@material-ui/core/Snackbar';

import {
  Grid,
  Button,
  TextField,
  Link,
  Typography
} from '@material-ui/core';

import { API_URL } from '../../common/api'

const schema = {
  email: {
    presence: { allowEmpty: false, message: 'is required' },
    email: true,
    length: {
      maximum: 64
    }
  },
};

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.default,
    height: '100%',
    borderRadius: '10px'
  },
  grid: {
    height: '100%'
  },
  quoteContainer: {
    [theme.breakpoints.down('md')]: {
      display: 'none'
    }
  },
  quote: {
    backgroundColor: theme.palette.neutral,
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundImage: 'url(/images/auth.jpg)',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  },
  quoteInner: {
    textAlign: 'center',
    flexBasis: '600px'
  },
  quoteText: {
    color: theme.palette.white,
    fontWeight: 300
  },
  name: {
    marginTop: theme.spacing(3),
    color: theme.palette.white
  },
  bio: {
    color: theme.palette.white
  },
  contentContainer: {},
  content: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  contentHeader: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: theme.spacing(5),
    paddingBototm: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  },
  logoImage: {
    marginLeft: theme.spacing(4)
  },
  contentBody: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'center'
    }
  },
  form: {
    paddingLeft: 100,
    paddingRight: 100,
    paddingBottom: 125,
    flexBasis: 700,
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2)
    }
  },
  title: {
    marginTop: theme.spacing(3)
  },
  textField: {
    marginTop: theme.spacing(2)
  },
  signInButton: {
    margin: theme.spacing(2, 0)
  }
}));

const ForgotPassword = props => {
  const { history } = props;

  const classes = useStyles();

  const [formState, setFormState] = useState({
    isValid: false,
    values: {},
    touched: {},
    errors: {}
  });

  const [snackbar, setSnackbar] = useState(false)

  useEffect(() => {
    const errors = validate(formState.values, schema);

    setFormState(formState => ({
      ...formState,
      isValid: errors ? false : true,
      errors: errors || {}
    }));
  }, [formState.values]);

  const handleChange = event => {
    event.persist();

    setFormState(formState => ({
      ...formState,
      values: {
        ...formState.values,
        [event.target.name]:
          event.target.type === 'checkbox'
            ? event.target.checked
            : event.target.value
      },
      touched: {
        ...formState.touched,
        [event.target.name]: true
      }
    }));
  };

  const handleForgotPassword = event => {
    event.preventDefault();

    fetch(`${API_URL}/getForgotPassword`, {
      method: 'post',
      headers: {
        accept: 'application/json', 
        'content-type': 'application/json'
      },
      body: JSON.stringify({ values: formState.values })
    })
    .then(res => res.json())
    .then(data => {
      console.log('data-------', data)
      if (data.value !== '')
        document.getElementById('getpassword').value = data.value
      else
        setSnackbar(true)

    })
    .catch(err => console.log(err))
    // history.push('/dashboard');
  };

  const handleClose = () => {
    setSnackbar(false)
  };

  const hasError = field =>
    formState.touched[field] && formState.errors[field] ? true : false;

  return (
    <div className={classes.root}>
      <Grid
        className={classes.grid}
        container
      >
        <Grid
          className={classes.quoteContainer}
          item
          lg={8}
        >
          <div className={classes.quote}>
          </div>
        </Grid>
        <Grid
          className={classes.content}
          item
          lg={4}
          xs={12}
        >
          <div className={classes.content}>
            <div className={classes.contentBody}>
              <form
                className={classes.form}
                onSubmit={handleForgotPassword}
              >
                <Typography
                  className={classes.title}
                  variant="h2"
                >
                  Forgot Password
                </Typography>
                <Typography
                  color="textSecondary"
                  gutterBottom
                >
                  Get the password with your email
                </Typography>
                
                <TextField
                  className={classes.textField}
                  error={hasError('email')}
                  fullWidth
                  helperText={
                    hasError('email') ? formState.errors.email[0] : null
                  }
                  label="Email address"
                  name="email"
                  onChange={handleChange}
                  type="text"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={formState.values.email || ''}
                  variant="outlined"
                />              
                <TextField
                  className={classes.textField}
                  fullWidth
                  disabled
                  label="Get password"
                  id="getpassword"
                  type="text"
                  value={formState.values.getpassword || ''}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  variant="outlined"
                />

                <Button
                  className={classes.signInButton}
                  color="primary"
                  disabled={!formState.isValid}
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                >
                  Get Password
                </Button>
                <Typography
                  color="textSecondary"
                  variant="body1"
                >
                  Have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/sign-in"
                    variant="h6"
                  >
                    Sign in
                  </Link>
                </Typography>
              </form>
            </div>
          </div>
        </Grid>
      </Grid>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={5000}
        open={snackbar}
        onClose={handleClose}
        message={'Wrong Email!'}
        key={'top-center'}>
      </Snackbar>
    </div>
  );
};

ForgotPassword.propTypes = {
  history: PropTypes.object
};

export default withRouter(ForgotPassword);
