'use strict';
module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      },
      unique: { args: true, msg: 'Project name must be unique' },
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(1024),
      defaultValue: ''
    },
    idProductOwner: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id'
      }
    },
    idScrumMaster: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id'
      }
    }
  }, {
    defaultScope: {
      attributes: {
        exclude: ['updatedAt']
      }
    }
  });

  Project.associate = function(models) {
    models.Project.belongsToMany(models.User, {
      through: models.ProjectUser,
      as: 'users',
      foreignKey: 'idProject',
      otherKey: 'idUser',
      onDelete: 'CASCADE'
    });

    models.Project.belongsTo(models.User, {
      as: 'productOwner',
      foreignKey: 'idProductOwner'
    });

    models.Project.belongsTo(models.User, {
      as: 'scrumMaster',
      foreignKey: 'idScrumMaster'
    });

    models.Project.hasMany(models.Story, {
      as: 'stories',
      foreignKey: 'idProject',
      onDelete: 'CASCADE',
      hooks: true
    });

    models.Project.hasMany(models.Sprint, {
      as: 'sprints',
      foreignKey: 'idProject',
      onDelete: 'CASCADE',
      hooks: true
    });

    models.Project.hasMany(models.WallComment, {
      as: 'comments',
      foreignKey: 'idProject'
    });
  };
  return Project;
};