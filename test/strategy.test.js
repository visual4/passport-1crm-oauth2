var expect = require('chai').expect;
var crmOAuth2Strategy = require('..');

describe('Strategy', function() {

    var strategy = new crmOAuth2Strategy({
            clientID: 'yourClientId',
            clientSecret: 'yourClientSecret',
            callbackURL: 'https://www.example.net/auth/azureadoauth2/callback',
            scope: 'profile',
            baseURL: 'https://demo.1crm.de'
        },
        function() {});

    it('should be named 1crm_oauth2', function() {
        expect(strategy.name).to.equal('1crm_oauth2');
    });
});
