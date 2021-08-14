'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Sprints', 'isDeleted', Sequelize.BOOLEAN, {
      defaultValue: "false"
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Sprints', 'isDeleted');
  }
};
