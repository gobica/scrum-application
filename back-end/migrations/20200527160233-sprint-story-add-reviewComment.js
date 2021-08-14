'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('SprintStories', 'reviewComment', Sequelize.STRING(1024), {
      defaultValue: null
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('SprintStories', 'reviewComment');
  }
};
