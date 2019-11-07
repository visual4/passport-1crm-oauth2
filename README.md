# Passport-1crm-oauth2

[Passport](http://passportjs.org/) strategy for authenticating with [1CRM](https://1crm-system.de)
using the OAuth 2.0 protocol.

## Install

    $ npm install passport-1crm-oauth

## Usage

#### Configure Strategy

The 1CRM OAuth 2.0 authentication strategy authenticates requests by delegating to 1CRM using the OAuth 2.0 protocol.

Applications must supply a `verify` callback which accepts an `accessToken`, `refresh_token` and service-specific `profile`, and then calls the `done` callback supplying a `user`, which should be set to `false` if the credentials are not valid.  If an exception occured, `err` should be set.

##### Options

* `clientID`: specifies the client id of the application that is registered in 1CRM.
* `clientSecret`: secret used to establish ownership of the client Id.
* `callbackURL`: URL to which 1CRM will redirect the user after obtaining authorization.
* `scope`              List of resources requested (profile)
* `baseURL`            the baseURL of the 1CRM installation (eg: https://demo.1crm.de)
* `authorizationURL`   optional Authorization URL
* `tokenURL`           optional Token URL
* `profileURL`         optional URL where the user profile can be fetched

```javascript
var CRMOauth2Strategy = require('passport-1crm-oauth2').Strategy;
passport.use("1CRM", new CRMOauth2Strategy ({
    clientID: 'yourClientId',
    clientSecret: 'yourClientSecret',
    callbackURL: 'https://www.example.net/auth/strategy/callback',
    scope: 'profile',
    baseURL: 'https://demo.1crm.de'
  },
  function (accessToken, refresh_token, profile, done) {
    // Deal with the user data in your own way
  }
));
```
## Node-RED Example
we are using this strategy to secure a [Node-RED](https://nodered.org/) instance with 1CRM SSO authentication. You'll have to create a new API Client in 1CRM first. It is important to validate the callbackURL twice, as it's hard to see and understand error messages if it doesn't match. The password can be set after the API Client has been created.

```javascript
// Securing Node-RED
// -----------------
// To password protect the Node-RED editor and admin API, the following
// property can be used. See http://nodered.org/docs/security.html for details.

adminAuth: {
    type: "strategy",
    strategy: {
        name: "1crm_oauth2",
        label: 'mit 1CRM anmelden',
        icon: "fa-twitter",
        strategy: require('passport-1crm-oauth2'),
        options: {
            baseURL: 'https://demo.1crm.de',
            clientID: 'aaaa-bbbbb-ccccc',
            clientSecret: 'vERYsECRETpASSWORD',
            callbackURL: "http://localhost:1880/auth/strategy/callback",
            scope: 'profile',
            verify: function (accessToken, refreshToken, profile, done) {
                if (!profile.name) {
                    done(null, false, { message: 'wrong user or password' });
                }
                profile.username = profile.name;
                done(null, profile);
            }
        },
    },
    users: function (user) {
        return Promise.resolve({ username: user, permissions: "*" });
    }

},
```
## Tests

    $ npm install
    $ npm test
    
## Credits

  - thanks to https://github.com/Burke9077/passport-office365-oauth2 which this strategy was based on.