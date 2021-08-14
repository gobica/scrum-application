'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Tasks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      description: {
        allowNull: false,
        type: Sequelize.STRING
      },
      timeEstimateHrs: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      idAssignedUser: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      idSprintStory: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'SprintStories',
          key: 'id'
        }
      },
      userConfirmed: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      isReady: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Tasks');
  }
};