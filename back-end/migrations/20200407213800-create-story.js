'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Stories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING(1024),
        defaultValue: ''
      },
      acceptanceTests: {
        type: Sequelize.STRING(1024),
        allowNull: false
      },
      priority: {
        type: Sequelize.STRING,
        allowNull: false
      },
      businessValue: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      sizePts: {
        type: Sequelize.FLOAT
      },
      isAccepted: {
        type: Sequelize.BOOLEAN,
        defaultValue: null
      },
      idProject: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Projects',
          key: 'id'
        }
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
    return queryInterface.dropTable('Stories');
  }
};