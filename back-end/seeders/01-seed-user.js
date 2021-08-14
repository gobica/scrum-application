'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [
      {
        username: 'jack',
        email: 'jack@fakemail.com'.toLowerCase(),
        password: await bcrypt.hash('password', 10),
        globalRole: 'user',
        firstName: 'Jack',
        lastName: 'Harkness',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'sally',
        email: 'sally@fakemail.com'.toLowerCase(),
        password: await bcrypt.hash('12345', 10),
        globalRole: 'user',
        firstName: 'Sally',
        lastName: 'Sparrow',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'donna',
        email: 'donna@fakemail.com'.toLowerCase(),
        password: await bcrypt.hash('12345', 10),
        globalRole: 'user',
        firstName: 'Donna',
        lastName: 'Noble',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'jdoe',
        email: 'jdoe@fakemail.com'.toLowerCase(),
        password: await bcrypt.hash('securePassw0rd', 10),
        globalRole: 'user',
        firstName: 'John',
        lastName: 'Doe',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'harold',
        email: 'harold@fakemail.com'.toLowerCase(),
        password: await bcrypt.hash('12345', 10),
        globalRole: 'user',
        firstName: 'Harold',
        lastName: 'Saxon',
        isDeleted: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'apond',
        email: 'amypond@fakemail.com'.toLowerCase(),
        password: await bcrypt.hash('password1234', 10),
        globalRole: 'user',
        firstName: 'Amelia',
        lastName: 'Pond',
        isDeleted: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'charper',
        email: 'charper@fakemail.com'.toLowerCase(),
        password: await bcrypt.hash('ui23bnf03249', 10),
        globalRole: 'user',
        firstName: 'Charles',
        lastName: 'Harper',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'alan',
        email: 'alanharper@fakemail.com'.toLowerCase(),
        password: await bcrypt.hash('2zu8n32234', 10),
        globalRole: 'user',
        firstName: 'Alan',
        lastName: 'Harper',
        isDeleted: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'rosa',
        email: 'rosadiaz@fakemail.com'.toLowerCase(),
        password: await bcrypt.hash('123781234c', 10),
        globalRole: 'user',
        firstName: 'Rosa',
        lastName: 'Diaz',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'wilfred',
        email: 'wilfred@fakemail.com'.toLowerCase(),
        password: await bcrypt.hash('23zu8n20234n', 10),
        globalRole: 'user',
        firstName: 'Wilfred',
        lastName: 'Mott',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'carlton',
        email: 'carlton@fakemail.com'.toLowerCase(),
        password: await bcrypt.hash('12789n3489234', 10),
        globalRole: 'user',
        firstName: 'Carlton',
        lastName: 'Banks',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
