'use strict';
module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    description: {
      type: DataTypes.STRING,
      validate: {
        notNull: { args: true, msg: 'Task description is required' }
      },
      allowNull: false
    },
    timeEstimateHrs: {
      type: DataTypes.FLOAT,
      validate: {
        isDecimal: { args: true, msg: 'Time estimate must be a number' },
        notNull: { args: true, msg: 'Time estimate is required' },
        isNonNeg: function(value) {
          if(value <= 0)
            throw new Error('Task time estimate must be positive');
        }
      },
      allowNull: false
    },
    idAssignedUser: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id'
      }
    },
    idSprintStory: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'SprintStory',
        key: 'id'
      }
    },
    userConfirmed: {
      allowNull: false,
      defaultValue: false,
      validate: {
        isIn: { args: [[true, false]], msg: "'userConfirmed' is required to be a boolean" }
      },
      type: DataTypes.BOOLEAN
    },
    isReady: {
      allowNull: false,
      defaultValue: false,
      validate: {
        isIn: { args: [[true, false]], msg: "'isReady' is required to be a boolean" }
      },
      type: DataTypes.BOOLEAN
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      validate: {
        isIn: { args: [[true, false]], msg: "'isActive' is required to be a boolean" }
      },
      defaultValue: false
    }
  }, {
    defaultScope: {
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    }
  });
  Task.associate = function(models) {
    models.Task.belongsTo(models.SprintStory, {
      as: 'sprintStory',
      foreignKey: 'idSprintStory'
    });
    models.Task.belongsTo(models.User, {
      as: 'assignedUser',
      foreignKey: 'idAssignedUser'
    });
    models.Task.hasMany(models.TaskWork, {
      foreignKey: 'idUser'
    });
  };
  return Task;
};