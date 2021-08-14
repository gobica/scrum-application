'use strict';
module.exports = (sequelize, DataTypes) => {
  const TaskWork = sequelize.define('TaskWork', {
    idUser: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id'
      }
    },
    idTask: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Task',
        key: 'id'
      }
    },
    workDoneHrs: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        isDecimal: true,
        isPositive: function(value) {
          if(value <= 0)
            throw new Error("'workDoneHrs' must be a positive number");
        }
      }
    },
    workRemainingHrs: {
      type: DataTypes.FLOAT,
      validate: {
        min: 0
      }
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    comment: {
      type: DataTypes.STRING,
      defaultValue: ''
    }
  }, {});
  TaskWork.associate = function(models) {
    models.TaskWork.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'idUser'
    });
    models.TaskWork.belongsTo(models.Task, {
      as: 'task',
      foreignKey: 'idTask'
    });
  };
  return TaskWork;
};