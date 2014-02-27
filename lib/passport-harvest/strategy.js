/**
 * Module dependencies.
 */
var util = require('util'),
OAuth2Strategy = require('passport-oauth').OAuth2Strategy,
InternalOAuthError = require('passport-oauth').InternalOAuthError,
request = require('request');

var BASE_URL = 'https://api.harvestapp.com';

/**
 * `Strategy` constructor.
 *
 * The Harvest authentication strategy authenticates requests by delegating to
 * Harvest using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Harvest application's client id
 *   - `clientSecret`  your Harvest application's client secret
 *   - `callbackURL`   URL to which Harvest will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new HarvestStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/harvest/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL =
    options.authorizationURL || BASE_URL + '/oauth2/authorize';
  options.tokenURL =
    options.tokenURL || BASE_URL + '/oauth2/token';

  OAuth2Strategy.call(this, options, verify);
  this.name = 'harvest';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


Strategy.prototype.authorizationParams = function (options) {
  var params = {};
  params.response_type = 'code';
  return params;
};

/**
 * Retrieve user profile from Harvest.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `harvest`
 *   - `id`               the user's Harvest ID
 *   - `username`         the user's Harvest username
 *   - `displayName`      the user's full name
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  profileUrl = BASE_URL + '/account/who_am_i';

  request.get({
    url: profileUrl,
    headers: { 'User-Agent': 'request' },
    json: true,
    qs: {
      access_token: accessToken
    }
  },
    function(error, response) {
      if (error) {
        done(error);
      } else {
        var json = response.body;
        var user = json.user;

        var profile = { provider: 'harvest' };

        profile.id = user.id;
        profile.emails = [
          { value: user.email, type: 'main' }
        ];
        profile.photos = [
          { value: user.avatar_url, type: 'main' }
        ];
        profile.name = {
          giveName: user.first_name,
          familyName: user.last_name,
        };
        profile.displayName = [
          user.first_name,
          user.last_name
        ].join(' ');

        // Extra bits not in Portable Contacts schema
        profile.email = user.email;
        profile.company = json.company;
        profile._json = json;

        done(null, profile);
      }
    }
  );
};


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
