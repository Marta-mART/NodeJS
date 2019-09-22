//loopback app
module.exports = function(app) {
    var Customer = app.models.Customer;

    //find if admin user exists
    Customer.findOne({ username: 'Admin' }, (err, users) => {

        //if it doesn;t exists, create one
        if(!users) {
            Customer.create([
                {username: 'Admin', email: 'admin@confusion.net', password: 'password'}
            ], (err, users) => {
                if(err) throw(err);

                var Role = app.models.Role;
                var RoleMapping = app.models.RoleMapping;

                //if db contains already role mapping, destroy if exists
                RoleMapping.destroyAll();

                Role.findOne( { name: 'admin' }, (err, role) => {
                    if(err) throw(err);

                    if(!role) {
                        Role.create({ name: 'admin' }, (err, role) => {
                            if(err) throw(err);

                            role.principals.create({
                                principalType: RoleMapping.USER,
                                principalId: users[0].id
                            }, (err, principals) => {
                                if(err) throw(err);
                            })
                        });
                    }
                    else { //if admin role exists we do the mapping
                        role.principals.create({
                            principalType: RoleMapping.USER,
                            principalId: users[0].id
                        }, (err, principal) => {
                            if(err) throw(err);
                        });
                    }
                });
            });
        }
    });
} 