const { describe, it, after, before } = require('mocha');
const { expect } = require('chai');
const axios = require('axios');
let { User } = require('../models');

process.on('unhandledRejection', (err) => {
    console.error(err);
});

let baseUrl = 'http://localhost:3000/api';
let adminToken, adminId;
let userToken, userId;
let SAMPLE_ADMIN = {
    username: "admin",
    email: "admin@fakemail.com",
    password: "admin",
    globalRole: "admin",
    firstName: "John",
    lastName: "Smith"
};
let SAMPLE_USER = {
    username: "user",
    email: "user@fakemail.com",
    password: "user",
    globalRole: "user",
    firstName: "Donna",
    lastName: "Noble"
};

describe('User handling tests', async function() {
    before(async function() {
        await User.destroy({ where: { } });
        // Create an admin and user account and save their login tokens for later
        let createdAdmin = await User.create(SAMPLE_ADMIN);
        let createdUser = await User.create(SAMPLE_USER);

        let responseAdmin = await axios.post(baseUrl + '/login', {
            username: SAMPLE_ADMIN.username,
            password: SAMPLE_ADMIN.password
        });
        adminId = createdAdmin.id;
        adminToken = responseAdmin.data.token;
        
        let responseUser = await axios.post(baseUrl + '/login', {
            username: SAMPLE_USER.username,
            password: SAMPLE_USER.password
        });
        userId = createdUser.id;
        userToken = responseUser.data.token;
    });

    after(async function() {
        await User.destroy({ where: { } });
    });

    context('Authentication', async function() {
        it('Login with wrong username and wrong password should return 400 Bad Request', async function() {
            try {
                await axios.post(baseUrl + '/login', {
                    username: '_' + SAMPLE_USER.username,
                    password: SAMPLE_USER.password.toUpperCase()
                });
                throw new Error('Login with wrong credentials should not succeed!');
            }
            catch(err) {
                expect(err.response).to.exist;
                expect(err.response.status).to.equal(400);
                expect(err.response.data.message).to.equal('Wrong username or password');
            }
        });
        
        it('Login with correct username and wrong password should return 400 Bad Request', async function() {
            try {
                await axios.post(baseUrl + '/login', {
                    username: SAMPLE_USER.username,
                    password: SAMPLE_USER.password.toUpperCase()
                });
                throw new Error('Login with wrong credentials should not succeed!');
            }
            catch(err) {
                expect(err.response).to.exist;
                expect(err.response.status).to.equal(400);
                expect(err.response.data.message).to.equal('Wrong username or password');
            }
        });

        it('Login with wrong username and correct password should return 400 Bad Request', async function() {
            try {
                await axios.post(baseUrl + '/login', {
                    username: '_' + SAMPLE_USER.username,
                    password: SAMPLE_USER.password
                });
                throw new Error('Login with wrong credentials should not succeed!');
            }
            catch(err) {
                expect(err.response).to.exist;
                expect(err.response.status).to.equal(400);
                expect(err.response.data.message).to.equal('Wrong username or password');
            }
        });

        it('Login with correct credentials should return a token', async function() {
            let response = await axios.post(baseUrl + '/login', {
                username: SAMPLE_USER.username,
                password: SAMPLE_USER.password
            });
            expect(response.status).to.equal(200);
            expect(response.data.token).to.exist;
        });

        it('Registraton should not be open to public', async function() {
            try {
                await axios.post(baseUrl + '/register', {
                    username: 'anotherUser',
                    email: 'another@fakemail.com',
                    password: '123123',
                    firstName: 'Name',
                    lastName: 'Surname'
                });
                throw new Error('Registration without token should not succeed');
            }
            catch(err) {
                expect(err.response).to.exist;
                expect(err.response.status).to.equal(401);
            }
        });

        it('User should not be able to create (register) another user', async function() {
            try {
                await axios.post(baseUrl + '/register', {
                    username: 'martha.jones',
                    email: 'martha.jones@fakemail.com',
                    password: '12345',
                    firstName: 'Martha',
                    lastName: 'Jones'
                }, { 
                    headers: { 'Authorization': `Bearer ${userToken}` }
                });
                throw new Error('Users should not be able to register new user');
            }
            catch(err) {
                expect(err.response).to.exist;
                expect(err.response.status).to.equal(401);
                expect(err.response.data.message).to.equal('Only an admin can create users');
            }            
        });

        it('User should not be able to create (register) another admin', async function() {
            try {
                await axios.post(baseUrl + '/register', {
                    username: 'martha.jones',
                    email: 'martha.jones@fakemail.com',
                    password: '12345',
                    firstName: 'Martha',
                    lastName: 'Jones',
                    globalRole: 'admin'
                }, { 
                    headers: { 'Authorization': `Bearer ${userToken}` }
                });
                throw new Error('Users should not be able to register new admin');
            }
            catch(err) {
                expect(err.response).to.exist;
                expect(err.response.status).to.equal(401);
                expect(err.response.data.message).to.equal('Only an admin can create users');
            }            
        });

        it('Admin should be able to create (register) another user', async function() {
            let response = await axios.post(baseUrl + '/register', {
                username: 'martha.jones',
                email: 'martha.jones@fakemail.com',
                password: '12345',
                firstName: 'Martha',
                lastName: 'Jones'
            }, { 
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            expect(response.status).to.equal(201);
            expect(response.data.globalRole).to.equal('user');
            // hashed password should not get sent back
            expect(response.data).to.not.have.property('password');         
        });

        it('Admin should be able to create (register) another admin', async function() {
            let response = await axios.post(baseUrl + '/register', {
                username: 'martha.jones.admin',
                email: 'martha.jones.admin@fakemail.com',
                password: '12345',
                firstName: 'Martha',
                lastName: 'Jones',
                globalRole: 'admin'
            }, { 
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            expect(response.status).to.equal(201);
            expect(response.data.globalRole).to.equal('admin');
            // hashed password should not get sent back
            expect(response.data).to.not.have.property('password');
        });

        it('Creation of user with already used username should fail', async function() {
            let user1 = {
                username: 'john.doe',
                email: 'john.doe@fakemail.com',
                firstName: 'John',
                lastName: 'Doe',
                password: '1234567890'
            };
            let user2 = {
                username: 'john.doe',
                email: 'john.doe1@fakemail.com',
                firstName: 'John',
                lastName: 'Doe',
                password: '1234567890'
            };

            // first request should go through
            let response = await axios.post(baseUrl + '/register', user1, {
                headers: { 'Authorization': 'Bearer ' + adminToken }
            });
            expect(response.status).to.equal(201);
            expect(response.data.username).to.equal(user1.username);
            expect(response.data.globalRole).to.equal('user');

            try {
                // second request with same user details should fail
                await axios.post(baseUrl + '/register', user2, {
                    headers: { 'Authorization': 'Bearer ' + adminToken }
                });
                throw new Error('Creation of user with duplicated username should not succeed!');
            }
            catch(err) {
                expect(err.response).to.exist;
                expect(err.response.status).to.equal(400);
                expect(err.response.data.messages[0]).to.equal('Username already in use');
            }
        });

        it('Creation of user with already used email should fail', async function() {
            let user1 = {
                username: 'sarah.jane',
                email: 'sarah.jane@fakemail.com',
                firstName: 'Sarah',
                lastName: 'Jane',
                password: '1234567890'
            };
            // emails should be treated as case insensitive!
            let user2 = {
                username: 'sarah.jane1',
                email: 'sArah.jane@fakemail.com',
                firstName: 'Sarah',
                lastName: 'Jane',
                password: '1234567890'
            };

            // first request should go through
            let response = await axios.post(baseUrl + '/register', user1, {
                headers: { 'Authorization': 'Bearer ' + adminToken }
            });
            expect(response.status).to.equal(201);
            expect(response.data.username).to.equal(user1.username);
            expect(response.data.globalRole).to.equal('user');

            try {
                // second request with same user details should fail
                await axios.post(baseUrl + '/register', user2, {
                    headers: { 'Authorization': 'Bearer ' + adminToken }
                });
                throw new Error('Creation of user with duplicated username should not succeed!');
            }
            catch(err) {
                expect(err.response).to.exist;
                expect(err.response.status).to.equal(400);
                expect(err.response.data.messages[0]).to.equal('E-mail already in use');
            }
        });
    });

    context('Getting user details', async function() {
        it('Non-authorized user should not be able to view specific user details', async function() {
            try {
                await axios.get(baseUrl + '/user/' + userId);
                throw new Error('Non-authorized user should not be able to view user details');
            }
            catch(err) {
                expect(err.response).to.exist;
                expect(err.response.status).to.equal(401);
            }
        });

        it('Non-authorized user should not be able to view all users\' details', async function() {
            try {
                await axios.get(baseUrl + '/user');
                throw new Error('Non-authorized user should not be able to view all users\' details');
            }
            catch(err) {
                expect(err.response).to.exist;
                expect(err.response.status).to.equal(401);
            }
        });

        it('User should be able to get their details', async function() {
            let response = await axios.get(baseUrl + '/user/' + userId, { 
                headers: { 'Authorization': 'Bearer ' + userToken }
            });
            const body = response.data;

            expect(response.status).to.equal(200);
            expect(body.username).to.equal(SAMPLE_USER.username);
            expect(body.globalRole).to.equal(SAMPLE_USER.globalRole);
        });

        it('User should not be able to get other users\' details', async function() {
            try {
                await axios.get(baseUrl + '/user/' + adminId, { 
                    headers: { 'Authorization': 'Bearer ' + userToken }
                });
                throw new Error('Non-authorized user should not be able to view user details');
            }
            catch(err) {
                expect(err.response).to.exist;
                expect(err.response.status).to.equal(401);
                expect(err.response.data.message).to.equal('Users can only view their own details');
            }
        });

        it('User should not be able to view all users\' details', async function() {
            try {
                await axios.get(baseUrl + '/user', {
                    headers: { 'Authorization': 'Bearer ' + userToken }
                });
                throw new Error('Non-authorized user should not be able to view all users\' details');
            }
            catch(err) {
                expect(err.response).to.exist;
                expect(err.response.status).to.equal(401);
                expect(err.response.data.message).to.equal('Only an admin can view all users');
            }
        });

        it('Admin should be able to get their own as well as other users\' details', async function() {
            let response1 = await axios.get(baseUrl + '/user/' + adminId, { 
                headers: { 'Authorization': 'Bearer ' + adminToken }
            });
            const body1 = response1.data;
            expect(response1.status).to.equal(200);
            expect(body1.username).to.equal(SAMPLE_ADMIN.username);
            expect(body1.globalRole).to.equal(SAMPLE_ADMIN.globalRole);

            let response2 = await axios.get(baseUrl + '/user/' + userId, {
                headers: { 'Authorization': 'Bearer ' + adminToken }
            });
            const body2 = response2.data;
            expect(response1.status).to.equal(200);
            expect(body2.username).to.equal(SAMPLE_USER.username);
            expect(body2.globalRole).to.equal(SAMPLE_USER.globalRole);
        });

        it('Admin should be able to view all users\' details', async function() {
            let response = await axios.get(baseUrl + '/user', {
                headers: { 'Authorization': 'Bearer ' + adminToken }
            });
            expect(response.status).to.equal(200);
            expect(response.data.length).to.be.above(0);
        });

        it('Getting non-existing user\'s details should return 404', async function() {
            try {
                await axios.get(baseUrl + '/user/' + -1, {
                    headers: { 'Authorization': 'Bearer ' + adminToken }
                });
                throw new Error('Request should have failed');
            }
            catch(err) {
                expect(err.response).to.exist;
                expect(err.response.status).to.equal(404);
                expect(err.response.data.message).to.equal('Invalid user ID');
            }
        });
    });

    let sampleUpdateUserId;
    context('Editing user details', async function() {
        this.beforeEach(async function() {
            let createdUser = await User.create({
                username: 'harold',
                email: 'harold.saxon@fakemail.com',
                password: '12345',
                globalRole: 'user',
                firstName: 'Harold',
                lastName: 'Saxon'
            });
            sampleUpdateUserId = createdUser.id;
        });

        this.afterEach(async function() {
            await User.destroy({ where: { username: 'harold' } });
        })

        it("Non-authorized users should not be able to change users' details", async function() {
            try {
                await axios.put(baseUrl + '/user/' + sampleUpdateUserId, {
                    email: 'uniqueEmail@fakemail.com'
                });
                throw new Error('Request should have failed');
            }
            catch(err) {
                expect(err.response).to.exist;
                expect(err.response.status).to.equal(401);
            }
        });

        it("Users should not be able to change users' details", async function() {
            try {
                await axios.put(baseUrl + '/user/' + sampleUpdateUserId, {
                    email: 'uniqueEmail@fakemail.com'
                }, { headers: { 'Authorization': 'Bearer ' + userToken } });
                throw new Error('Request should have failed');
            }
            catch(err) {
                expect(err.response).to.exist;
                expect(err.response.status).to.equal(401);
                expect(err.response.data.message).to.equal('Only an admin can update users');
            }
        });

        it("Admin should be able to change users' details", async function() {
            let response = await axios.put(baseUrl + '/user/' + sampleUpdateUserId, {
                email: 'unique@fakemail.com',
                globalRole: 'admin'
            }, { headers: { 'Authorization': 'Bearer ' + adminToken } });
            expect(response.status).to.equal(200);
            expect(response.data.email).to.equal('unique@fakemail.com');
            expect(response.data.globalRole).to.equal('admin');
        });

        it("Updating username/email to non-unique values should fail", async function() {
            // username
            try {
                await axios.put(baseUrl + '/user/' + sampleUpdateUserId, {
                    username: SAMPLE_USER.username
                }, { headers: { 'Authorization': 'Bearer ' + adminToken } });
                throw new Error('Request should have failed');
            }
            catch(err) {
                expect(err.response).to.exist;
                expect(err.response.status).to.equal(400);
                expect(err.response.data.messages[0]).to.equal('Username already in use');
            }

            // email - case-insensitive!
            try {
                let existingEmail = SAMPLE_USER.email;
                await axios.put(baseUrl + '/user/' + sampleUpdateUserId, {
                    email: existingEmail[0].toUpperCase() + existingEmail.substring(1)
                }, { headers: { 'Authorization': 'Bearer ' + adminToken } });
                throw new Error('Request should have failed');
            }
            catch(err) {
                expect(err.response).to.exist;
                expect(err.response.status).to.equal(400);
                expect(err.response.data.messages[0]).to.equal('E-mail already in use');
            }
        });
    });
});
