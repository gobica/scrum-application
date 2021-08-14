'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
   return queryInterface.addColumn('Stories', 'idSprintCompleted', Sequelize.INTEGER, {
      references: {
        table: 'Sprints',
        field: 'id'
      },
      defaultValue: null 
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Stories', 'idSprintCompleted');
  }
};
