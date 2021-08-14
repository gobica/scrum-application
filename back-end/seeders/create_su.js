require('dotenv').config();
let { User } = require('../models');
let currentEnv = process.env.NODE_ENV || 'development';
let faker = require('faker');

User.findOne({ where: { globalRole: "admin" }})
.then(existingAdmin => {
    if(currentEnv == 'production' && existingAdmin) {
        console.error('An admin account already exists in production environment, can not create another!');
        return;
    }

    // admin does not exist yet OR this is dev environment (for convenience, allow unlimited admin creations there)
    let randPass = faker.internet.password();
    let username = "admin";
    let mail = "admin@smrpog5.com"
    User.create({
        username: username,
        email: mail,
        password: randPass,
        globalRole: "admin",
        firstName: "John",
        lastName: "Smith"
    }).then(createdUser => {
        if(!createdUser) {
            console.error("Creation of admin user failed");
            return;
        }

        console.log(`**User details (note them down somewhere safe)**\n - username: ${username} (${mail})\n - password: ${randPass}`);
    });
});