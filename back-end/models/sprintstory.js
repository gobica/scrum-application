'use strict';
module.exports = (sequelize, DataTypes) => {
  const SprintStory = sequelize.define('SprintStory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    idSprint: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Sprint',
        key: 'id'
      }
    },
    idStory: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Story',
        key: 'id'
      }
    },
    isReady: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isAccepted: {
      type: DataTypes.BOOLEAN,
      defaultValue: null,
      validate: {
        isIn: { args: [[true, false, null]], msg: "'isAccepted' must be one of true (accepted) / false (rejected) / null (unreviewed)" }
      }
    },
    reviewComment: {
      type: DataTypes.STRING(1024),
      defaultValue: null
    }
  }, {});

  SprintStory.associate = function(models) {
    models.SprintStory.hasMany(models.Task, {
      as: 'tasks',
      foreignKey: 'idSprintStory',
      onDelete: 'CASCADE',
      hooks: true
    });
    models.SprintStory.belongsTo(models.Story, {
      as: 'story',
      foreignKey: 'idStory'
    })
  };
  return SprintStory;
};