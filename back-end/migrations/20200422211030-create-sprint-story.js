'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('SprintStories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idSprint: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Sprints',
          key: 'id'
        },
        onDelete: 'cascade'
      },
      idStory: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Stories',
          key: 'id'
        },
        onDelete: 'cascade'
      },
      isReady: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isAccepted: {
        type: Sequelize.BOOLEAN,
        defaultValue: null
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
    return queryInterface.dropTable('SprintStories');
  }
};