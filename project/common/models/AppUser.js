'use strict';

module.exports = function(AppUser) {

    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    //validations
    AppUser.validatesPresenceOf('TechnicalId', {message: 'TechnicalId Cannot be blank'});
    AppUser.validatesPresenceOf('UserName', {message: 'UserName Cannot be blank'});
    AppUser.validatesFormatOf('EmailId', {with: re, message: 'invalid email id'});
    AppUser.validatesPresenceOf('Role', {message: 'Role Cannot be blank'});


};
