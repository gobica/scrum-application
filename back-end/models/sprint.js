'use strict';
const Op = require('sequelize').Op;

module.exports = (sequelize, DataTypes) => {
  const Sprint = sequelize.define('Sprint', {
    startDate: {
      type: DataTypes.DATE,
      validate: {
        isDate: true,
        isInFuture: function(value) {
          let queryDate = new Date(value);
          let currDate = new Date();
          currDate.setHours(0, 0, 0, 0);
          if(queryDate < currDate)
            throw new Error(`Cannot create sprint before today at midnight (server time): ${currDate.toISOString()}`);
        }
      },
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      validate: {
        isDate: true
      },
      allowNull: false
    },
    velocity: {
      type: DataTypes.FLOAT,
      validate: {
        isDecimal: { args: true, msg: 'Velocity must be a number' },
        isNonNeg: function(value) {
          if(value <= 0)
            throw new Error('Sprint velocity must be positive');
        }
      },
      allowNull: false
    },
    idProject: {
      type: DataTypes.INTEGER,
      validate: {
        notNull: { args: true, msg: 'Sprint must be tied to a specific project' }
      },
      allowNull: false,
      references: {
        model: 'Project',
        key: 'id'
      }
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: "false"
    }
  }, {
    defaultScope: {
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    }
  });

  Sprint.afterValidate(async function(sprint, options) {
    if(sprint.startDate >= sprint.endDate)
      throw new Error('Start date must be before end date');

    let overlappingSprints = await Sprint.findAll({
      where: {
        [Op.and]: [
          { isDeleted: false },
          { idProject: sprint.idProject },
          {
            [Op.or]: [
              {
                [Op.and]: [
                  //        |---------------|         EXISTING SPRINT
                  //  |------------|                  NEW SPRINT
                  //     |----------------------|     NEW SPRINT
                  { startDate: { [Op.gte]: sprint.startDate } },
                  { startDate: { [Op.lte]: sprint.endDate } }
                ]
              },
              {
                [Op.and]: [
                  //        |---------------|         EXISTING SPRINT
                  //            |-------|             NEW SPRINT
                  { startDate: { [Op.lte]: sprint.startDate } },
                  { endDate: { [Op.gte]: sprint.endDate } }
                ]
              },
              {
                [Op.and]: [
                  //        |---------------|         EXISTING SPRINT
                  //                 |-----------|    NEW SPRINT
                  { endDate: { [Op.gte]: sprint.startDate } },
                  { endDate: { [Op.lte]: sprint.endDate } }
                ]
              }
            ]
          }
        ]
      }
    });

    // exclude itself in the search for overlapping sprints
    if(sprint.id && overlappingSprints.length > 1 || !sprint.id && overlappingSprints.length > 0) {
      throw new Error('Sprint overlaps with existing sprint in project');
    }

  });

  Sprint.prototype.isActive = function() {
    let currDate = new Date();
    let startDate = new Date(this.startDate);
    let endDate = new Date(this.endDate);
    if(startDate <= currDate && currDate <= endDate) {
      console.log(`Sprint is active: ${startDate} <= ${currDate} <= ${endDate}`);
      return true;
    }
    
    return false;
  }

  Sprint.associate = function(models) {
    models.Sprint.belongsTo(models.Project, {
      as: 'project',
      foreignKey: 'idProject'
    });

    models.Sprint.belongsToMany(models.Story, {
      through: models.SprintStory,
      as: 'stories',
      foreignKey: 'idSprint',
      otherKey: 'idStory'
    });
  };
  return Sprint;
};