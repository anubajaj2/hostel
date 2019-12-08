"use strict";
//var log4js = require('log4js');
//var logger = log4js.getLogger("odata");
var InitSecurity = (function () {
    function InitSecurity(app) {
        this.User = app.models.User;
        this.Role = app.models.Role;
        this.AppUser = app.models.AppUser;
        this.RoleMapping = app.models.RoleMapping;
    }
    ;
    InitSecurity.prototype.init = function () {
        var _this = this;
        this.User.findOne({ where: { email: 'user1@gmail\.com' } }).then(function (user) {
            if (!user) {
                _this.User.create({ username: 'user1', email: 'user1@gmail\.com', password: 'Welcome1!' }).then(function (user) {
                    if (user) {
                        //logger.debug("User created: " + JSON.stringify(user.toJSON()));
                        _this.assignAdminUserToRole(user);
                    }
                    else {
                        //logger.error("user 'anurag' could not be created. Program may not work as expected");
                    }
                });
            }
            else {
                _this.assignAdminUserToRole(user);
            }
        }).catch(function (err) {
            //logger.error("error: " + err);
        });
        this.User.findOne({ where: { email: 'user2@gmail\.com' } }).then(function (user) {
            if (!user) {
                _this.User.create({ username: 'user2', email: 'user2@gmail\.com', password: 'Welcome1!' }).then(function (user) {
                    if (user) {
                        //logger.debug("User created: " + JSON.stringify(user.toJSON()));
                        _this.assignAdminUserToRole(user);
                    }
                    else {
                        //logger.error("user 'anurag' could not be created. Program may not work as expected");
                    }
                });
            }
            else {
                _this.assignAdminUserToRole(user);
            }
        }).catch(function (err) {
            //logger.error("error: " + err);
        });
        this.User.findOne({ where: { email: 'user3@gmail\.com' } }).then(function (user) {
            if (!user) {
                _this.User.create({ username: 'user3', email: 'user3@gmail\.com', password: 'Welcome1!' }).then(function (user) {
                    if (user) {
                        //logger.debug("User created: " + JSON.stringify(user.toJSON()));
                        _this.assignAdminUserToRole(user);
                    }
                    else {
                        //logger.error("user 'anurag' could not be created. Program may not work as expected");
                    }
                });
            }
            else {
                _this.assignAdminUserToRole(user);
            }
        }).catch(function (err) {
            //logger.error("error: " + err);
        });
        this.User.findOne({ where: { email: 'user4@gmail\.com' } }).then(function (user) {
            if (!user) {
                _this.User.create({ username: 'user4', email: 'user4@gmail\.com', password: 'Welcome1!' }).then(function (user) {
                    if (user) {
                        //logger.debug("User created: " + JSON.stringify(user.toJSON()));
                        _this.assignAdminUserToRole(user);
                    }
                    else {
                        //logger.error("user 'anurag' could not be created. Program may not work as expected");
                    }
                });
            }
            else {
                _this.assignAdminUserToRole(user);
            }
        }).catch(function (err) {
            //logger.error("error: " + err);
        });
        this.User.findOne({ where: { email: 'user5@gmail\.com' } }).then(function (user) {
            if (!user) {
                _this.User.create({ username: 'user5', email: 'user5@gmail\.com', password: 'Welcome1!' }).then(function (user) {
                    if (user) {
                        //logger.debug("User created: " + JSON.stringify(user.toJSON()));
                        _this.assignAdminUserToRole(user);
                    }
                    else {
                        //logger.error("user 'anurag' could not be created. Program may not work as expected");
                    }
                });
            }
            else {
                _this.assignAdminUserToRole(user);
            }
        }).catch(function (err) {
            //logger.error("error: " + err);
        });

    };

    InitSecurity.prototype.initRoleForUser = function (user) {
        var _this = this;
        this.Role.findOne({ where: { name: 'r_admin' }, include: 'principals' }).then(function (role) {
            if (!role) {
                _this.Role.create({ name: 'r_admin', description: 'grants general access to businesstrips' }).then(function (role) {
                    if (role) {
                        //logger.debug("Role created: " + JSON.stringify(role.toJSON()));
                        _this.assignUserToRole(user, role);
                    }
                    else {
                      //  logger.error("role 'r_admin' could not be created. Program may not work as expected");
                    }
                });
            }
            else {
            //  _this.assignUserToRole(user, role);
            }
        });

    };
    InitSecurity.prototype.initClearkRoleForUser = function (user) {
        var _this = this;
        this.AppUser.findOne({ where: { "EmailId": user.email } }).then(function (roleMapping) {
            if (!roleMapping) {
                _this.AppUser.create({
                    TechnicalId: user.id,
                    EmailId: user.email,
                    UserName: user.username,
                    Role:"Content"
                }).then(function (roleMapping) {
                    //logger.debug("Rolemapping created: " + JSON.stringify(roleMapping.toJSON()));
                });
            }
        });

    };
    InitSecurity.prototype.assignAdminUserToRole = function (user) {
        var _this = this;
        this.AppUser.findOne({ where: { "EmailId": user.email } }).then(function (roleMapping) {
            if (!roleMapping) {
                _this.AppUser.create({
                    TechnicalId: user.id,
                    EmailId: user.email,
                    UserName: user.username,
                    Role:"Admin"
                }).then(function (roleMapping) {
                  //  logger.debug("Rolemapping created: " + JSON.stringify(roleMapping.toJSON()));
                });
            }
        });
    };
    InitSecurity.prototype.assignUserToRole = function (user, role) {
        var _this = this;
        this.RoleMapping.findOne({ where: { principalType: this.RoleMapping.USER, principalId: user.id, roleId: role.id } }).then(function (roleMapping) {
            if (!roleMapping) {
                role.principals.create({
                    principalType: _this.RoleMapping.USER,
                    principalId: user.id
                }).then(function (roleMapping) {
                  //  logger.debug("Rolemapping created: " + JSON.stringify(roleMapping.toJSON()));
                });
            }
        });
    };
    return InitSecurity;
}());

module.exports = function initial_security(app) {
    //logger.debug("starting initial_security script");
    var initSecurity = new InitSecurity(app);
    initSecurity.init();
};
//# sourceMappingURL=initial_security.js.map
