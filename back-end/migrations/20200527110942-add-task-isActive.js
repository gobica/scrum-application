'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Tasks', 'isActive', Sequelize.BOOLEAN, {
      defaultValue: "false"
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Tasks', 'isActive');
  }
};
