import React, { useState, useEffect } from 'react';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import validate from 'validate.js';
import { makeStyles } from '@material-ui/styles';
import {
  Grid,
  Button,
  IconButton,
  TextField,
  Link,
  Typography
} from '@material-ui/core';

import { API_URL } from '../../api/config';

// import { FirebaseContext } from '../../components/Firebase';
// // import { withFirebase } from '../../components/Firebase';
import Firebase from '../../components/Firebase';
import { FirebaseContext } from '../../components/Firebase';

// import firebase from "../../api/firebaseConfig";
import * as myfirebase from "firebase";

const firebase = new Firebase();
const auth = myfirebase.auth();
const google_provider = new myfirebase.auth.GoogleAuthProvider(); 

console.log('Firebase----------', firebase, auth, google_provider)

const schema = {
  email: {
    presence: { allowEmpty: false, message: 'is required' },
    email: true,
    length: {
      maximum: 64
    }
  },
  password: {
    presence: { allowEmpty: false, message: 'is required' },
    length: {
      maximum: 128
    }
  }
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
  socialButtons: {
    marginTop: theme.spacing(3)
  },
  socialIcon: {
    marginRight: theme.spacing(1),
    width: '10%'
  },
  sugestion: {
    marginTop: theme.spacing(2)
  },
  textField: {
    marginTop: theme.spacing(2)
  },
  socialFacebook: {
    margin: theme.spacing(1, 0),
    backgroundColor: '#4756ab'
  },
  socialGoogle: {
    margin: theme.spacing(1, 0),
    backgroundColor: '#dc4e41'
  },
  socialTwitter: {
    margin: theme.spacing(1, 0),
    backgroundColor: '#55acee'
  },
  signInButton: {
    margin: theme.spacing(2, 0)
  },
  floatRight: {
    float: 'right'
  }
}));


const SignIn = props => {
  const { history } = props;

  const classes = useStyles();

  const [formState, setFormState] = useState({
    isValid: false,
    values: {},
    touched: {},
    errors: {}
  });

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

  const handleSignIn = event => {
    event.preventDefault();

    fetch(`${API_URL}/getSignUserData`, {
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
    })
    .catch(err => console.log(err))
    // history.push('/dashboard');
  };

  const goolgeSignIn = () => {
    auth.signInWithPopup(google_provider)
      .then(res => {
        console.log('-----------SignInWithPopup: ', res.additionalUserInfo.profile)
        res.user.updateProfile({
          displayName: res.additionalUserInfo.profile.given_name
        })
      .then(() => {
        localStorage.setItem('user', JSON.stringify(res.user));
        localStorage.setItem('loggedIn', true);
      })
      .catch(err => {
        
      })
      .catch(err => { });
    })
    console.log('props.firebase--------------', props.firebase)
    // props.firebase
    //   .doCreateUserWithEmailAndPassword(email, passwordOne)
    //   .then(authUser => {
    //     this.setState({ ...INITIAL_STATE });
    //     this.props.history.push(ROUTES.HOME);
    //   })
    //   .catch(error => {
    //     this.setState({ error });
    //   });
  }


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
          lg={6}
        >
          <div className={classes.quote}>
          </div>
        </Grid>
        <Grid
          className={classes.content}
          item
          lg={6}
          xs={12}
        >
          <div className={classes.content}>
            <div className={classes.contentBody}>
              <form
                className={classes.form}
                onSubmit={handleSignIn}
              >
                <Typography
                  className={classes.title}
                  variant="h2"
                >
                  Sign in
                </Typography>
                <Typography
                  color="textSecondary"
                  gutterBottom
                >
                  Sign in with social media
                </Typography>
                <Grid
                  className={classes.socialButtons}
                  container
                  // spacing={2}
                >
                  <Grid item lg={12} xs={12} >
                    <Button
                      className={classes.socialFacebook}
                      onClick={goolgeSignIn}
                      size="large"
                      fullWidth
                      variant="contained"
                    >
                      {/* <FacebookIcon className={classes.socialIcon} /> */}
                      <img
                        className={classes.socialIcon}
                        src="/images/socialIcons/facebook.svg"
                      />
                      Login with Facebook
                    </Button>
                  </Grid>
                  <Grid item lg={12} xs={12}>
                    <Button
                      className={classes.socialGoogle}
                      onClick={handleSignIn}
                      size="large"
                      fullWidth
                      variant="contained"
                    >
                      {/* <GoogleIcon className={classes.socialIcon} /> */}
                      <img
                        className={classes.socialIcon}
                        src="/images/socialIcons/google.svg"
                      />
                      Login with Google
                    </Button>
                  </Grid>
                  <Grid item lg={12} xs={12}>
                    <Button
                      className={classes.socialTwitter}
                      onClick={handleSignIn}
                      size="large"
                      fullWidth
                      variant="contained"
                    >
                      {/* <TwitterIcon className={classes.socialIcon} /> */}
                      <img
                        className={classes.socialIcon}
                        src="/images/socialIcons/twitter.svg"
                      />
                      Login with Twitter
                    </Button>
                  </Grid>
                </Grid>
                <Typography
                  align="center"
                  className={classes.sugestion}
                  color="textSecondary"
                  variant="body1"
                >
                  or login with email address
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
                  error={hasError('password')}
                  fullWidth
                  helperText={
                    hasError('password') ? formState.errors.password[0] : null
                  }
                  label="Password"
                  name="password"
                  onChange={handleChange}
                  type="password"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={formState.values.password || ''}
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
                  Sign in now
                </Button>
                <Typography
                  color="textSecondary"
                  variant="body1"
                >
                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    variant="h6"
                  >
                    Forgot Password
                  </Link>
                  <Link
                    className={classes.floatRight}
                    component={RouterLink}
                    to="/sign-up"
                    variant="h6"
                  >
                    Sign up
                  </Link>
                </Typography>
              </form>
            </div>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

SignIn.propTypes = {
  history: PropTypes.object
};

export default withRouter(SignIn);
