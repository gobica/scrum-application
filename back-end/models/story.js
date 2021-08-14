'use strict';
const Op = require('sequelize').Op;

module.exports = (sequelize, DataTypes) => {
  const Story = sequelize.define('Story', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: { args: true, msg: 'Story name is required' },
        // checks that the story name is unique inside specific project,
        // i.e. two different projects can still have a story with same name 
        uniqueInsideProject: async function() {
          let storiesInProj = await Story.findAll({
            where: {
              [Op.and]: [
                { 'idProject': this.idProject },
                { 'name': this.name },
                { 'isDeleted': false }
              ]
            },
            attributes: ['name']
          });
          if(storiesInProj.length > 0)
            throw new Error(`Name of story must be unique project-wise`);
        }
      },
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(1024),
      defaultValue: ''
    },
    acceptanceTests: {
      type: DataTypes.STRING(1024),
      validate: {
        notNull: { args: true, msg: 'Acceptance tests need to be specified' }
      },
      allowNull: false
    },
    priority: {
      type: DataTypes.STRING,
      validate: {
        notNull: { args: true, msg: 'Priority is required' },
        isIn: { args: [['must have', 'could have', 'should have', 'won\'t have this time']], msg: 'Invalid priority type' }
      },
      allowNull: false
    },
    businessValue: {
      type: DataTypes.INTEGER,
      validate: {
        isDecimal: { args: true, msg: 'Business value must be a number' },
        notNull: { args: true, msg: 'Business value is required' }
      },
      allowNull: false
    },
    sizePts: {
      type: DataTypes.FLOAT,
      validate: {
        isDecimal: { args: true, msg: 'Story size must be a number' },
        min: 0
      },
      defaultValue: null
    },
    isAccepted: {
      type: DataTypes.BOOLEAN,
      validate: {
        isIn: { args: [[true, false, null]], msg: "'isAccepted' must be one of true (accepted) / false (rejected) / null (unreviewed)" }
      },
      defaultValue: null
    },
    idSprintCompleted: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Sprint',
        key: 'id'
      }
    },
    idProject: {
      type: DataTypes.INTEGER,
      validate: {
        notNull: { args: true, msg: 'The story needs to be tied to a project' }
      },
      allowNull: false,
      references: {
        model: 'Project',
        key: 'id'
      }
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    defaultScope: {
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    }
  });
  Story.associate = function(models) {
    models.Story.belongsTo(models.Project, {
      as: 'project',
      foreignKey: 'idProject'
    });

    models.Story.belongsToMany(models.Sprint, {
      through: models.SprintStory,
      as: 'sprints',
      foreignKey: 'idStory',
      otherKey: 'idSprint'
    });
  };
  return Story;
};