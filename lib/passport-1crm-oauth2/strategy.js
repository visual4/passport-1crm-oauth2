/**
 * Module dependencies.
 */
var util = require('util'),
    https = require('https'),
    OAuth2Strategy = require('passport-oauth').OAuth2Strategy,
    InternalOAuthError = require('passport-oauth').InternalOAuthError;


/**
 * `Strategy` constructor.
 *
 * 
 * Options:
 *   - `clientID`           specifies the client id of the application that is registered in 1CRM
 *   - `clientSecret`       secret used to establish ownership of the client Id
 *   - `callbackURL`        URL to which 1CRM will redirect the user after obtaining authorization
 *   - `scope`              List of resources requested (profile)
 *   - `baseURL`            the baseURL of the 1CRM installation (eg: https://demo.1crm.de)
 *   - `authorizationURL`   optional Authorization URL (full Path)
 *   - `tokenURL`           optional Token URL (full Path)
 *   - `profileURL`         optional URL where the user profile can be fetched
 *
 * Examples:
 *
 *     var CRMOauth2Strategy = require('passport-1crm-oauth2').Strategy;
 *     passport.use("1CRM", new CRMOauth2Strategy ({
 *         clientID: 'yourClientId',
 *         clientSecret: 'yourClientSecret',
 *         callbackURL: 'https://www.example.net/auth/strategy/callback',
 *         scope: 'profile',
 *         baseURL: 'https://demo.1crm.de'
 *       },
 *       function (accessToken, refresh_token, profile, done) {
 *         // Deal with the user data in your own way
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
    options = options || {};

    var base_url = options.baseURL;

    options.authorizationURL = options.authorizationURL != null ? options.authorizationURL : base_url + '/api.php/auth/user/authorize';
    options.tokenURL = options.tokenURL != null ? options.tokenURL : base_url + '/api.php/auth/user/access_token';
    options.profileURL = options.profileURL != null ? options.profileURL : base_url + '/api.php/me';

    this.options = options;

    OAuth2Strategy.call(this, options, verify);

    this.name = '1crm_oauth2';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);

/**
 * Authenticate request by delegating to Azure AD using OAuth.
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = function(req, options) {
    if (!options.resource && this.resource) { // include default resource as authorization parameter
        options.resource = this.resource;
    }

    // Call the base class for standard OAuth authentication.
    OAuth2Strategy.prototype.authenticate.call(this, req, options);
};

/**
 * Retrieve user profile from Azure AD.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `office365_oauth2`
 *   - `id`
 *   - `username`
 *   - `displayName`
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, callback) {
        // Get the user profile
    var options = {
        //host: 'graph.microsoft.com',
        //path: '/v1.0/me',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer ' + accessToken
        }
    };

    https.get(this.options.profileURL, options, function(response) {
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            var error;
            if (response.statusCode === 200) {
                var profile = JSON.parse(body);
                profile.username = profile.name;
                profile.displayName = profile.first_name + ' ' + profile.last_name;
                return callback(null, profile);
            } else {
                error = new Error();
                error.code = response.statusCode;
                error.message = response.statusMessage;
                // The error body sometimes includes an empty space
                // before the first character, remove it or it causes an error.
                body = body.trim();
                error.innerError = JSON.parse(body).error;
                return callback(error);
            }
        });
    }).on('error', function(e) {
        return callback(e);
    });
};

/**
 * Return extra Azure AD-specific parameters to be included in the authorization
 * request.
 *
 * @param {Object} options
 * @return {Object}
 * @api protected
 */
Strategy.prototype.authorizationParams = function(options) {
    return options;
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
