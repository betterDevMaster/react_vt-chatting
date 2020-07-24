import React, { useState, useEffect } from 'react';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import validate from 'validate.js';
import { makeStyles, useTheme } from '@material-ui/styles';
// import Carousel from 'react-material-ui-carousel'
import {Paper} from '@material-ui/core'
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';

import {
  Grid,
  Button,
  IconButton,
  TextField,
  Link,
  Typography
} from '@material-ui/core';

import { API_URL } from '../../common/api';

import Firebase from '../../components/Firebase';
import { duration } from 'moment';

const auth = Firebase.getInstance().auth;
const googleAuth = Firebase.getInstance().googleAuth;
const facebookAuth = Firebase.getInstance().facebookAuth;
const twitterAuth = Firebase.getInstance().twitterAuth;

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

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

const tutorialSteps = [
  {
    imgPath:
      './images/carousels/1.jpeg',
  },
  {
    imgPath:
    './images/carousels/2.jpg',
  },
  {
    imgPath:
      './images/carousels/3.jpg',
  },
  // {
  //   imgPath:
  //     'https://images.unsplash.com/photo-1518732714860-b62714ce0c59?auto=format&fit=crop&w=400&h=250&q=60',
  // },
  // {
  //   imgPath:
  //     'https://images.unsplash.com/photo-1512341689857-198e7e2f3ca8?auto=format&fit=crop&w=400&h=250&q=60',
  // },
];


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
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  },
  quoteItem: {
    width: '100%',
    height: '100%',
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
    backgroundColor: '#4756ab',
    borderRadius: '45%'
  },
  socialGoogle: {
    margin: theme.spacing(1, 0),
    backgroundColor: '#dc4e41',
    borderRadius: '45%',
  },
  socialTwitter: {
    margin: theme.spacing(1, 0),
    backgroundColor: '#55acee',
    borderRadius: '45%',
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
  const theme = useTheme();

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

  function validateSignUser(values) {
    fetch(`${API_URL}/getSignUserData`, {
      method: 'post',
      headers: {
        accept: 'application/json', 
        'content-type': 'application/json'
      },
      body: JSON.stringify({ values: values })
    })
    .then(res => res.json())
    .then(data => {
      if (data.value)
        history.push('/dashboard');
    })
    .catch(err => console.log(err))
  }

  const handleSignIn = event => {
    event.preventDefault();
    validateSignUser(formState.values)
  };
  
  const handleGASign = () => {
    auth.signInWithPopup(googleAuth)
      .then(res => {
        console.log('-----------SignInWithPopupGoogle: ', res.additionalUserInfo.profile)
        validateSignUser({email: res.additionalUserInfo.profile.email, id: res.additionalUserInfo.profile.id })
      })
      .catch(err => { })
  }

  const handleFBASign = () => {
    auth.signInWithPopup(facebookAuth)
      .then(res => {
        console.log('-----------SignInWithPopupFacebook: ', res.additionalUserInfo.profile)
        validateSignUser({email: res.additionalUserInfo.profile.email, id: res.additionalUserInfo.profile.id })
      })
      .catch(err => {
        
      })
  }

  const handleTTASign = () => {
    auth.signInWithPopup(twitterAuth)
      .then(res => {
        console.log('-----------SignInWithPopupTwitter: ', res.additionalUserInfo.profile)
        validateSignUser({email: res.additionalUserInfo.profile.email, id: res.additionalUserInfo.profile.id })
      })
      .catch(err => {
        
      })
  }

  function Item(props)
  {
      return (
          <Paper className={classes.quoteItem}>
              <img className={classes.quoteItem} src={props.item.src}></img>
          </Paper>
      )
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
          lg={8}
        >
          <AutoPlaySwipeableViews
            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
            enableMouseEvents
            interval={5000}
            animation={'fade'}
            className={classes.quoteItem}
          >
            {tutorialSteps.map((step, index) => (
              <div key={step.label} className={classes.quoteItem}>
                  <img className={classes.quoteItem} src={step.imgPath} alt={step.label} />
              </div>
            ))}
          </AutoPlaySwipeableViews>
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
                      onClick={handleFBASign}
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
                      onClick={handleGASign}
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
                      onClick={handleTTASign}
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
