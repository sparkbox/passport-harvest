# Passport-Harvest

[Passport](https://github.com/jaredhanson/passport) strategy for authenticating
with [Harvest](http://harvestapp.com/) using the OAuth 2.0 API.

This module lets you authenticate using Harvest in your Node.js applications.
By plugging into Passport, Harvest authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

    $ npm install passport-harvest

## Usage

#### Configure Strategy

The Harvest authentication strategy authenticates users using a Harvest
account and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, as well as
`options` specifying a client ID, client secret, and callback URL.

    passport.use(new HarvestStrategy({
        clientID: HARVEST_CLIENT_ID,
        clientSecret: HARVEST_CLIENT_SECRET,
        callbackURL: "http://127.0.0.1:3000/auth/harvest/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ harvestId: profile.id }, function (err, user) {
          return done(err, user);
        });
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'harvest'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.get('/auth/harvest',
      passport.authenticate('harvest'));

    app.get('/auth/harvest/callback',
      passport.authenticate('harvest', { failureRedirect: '/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
      });

## License

MIT
