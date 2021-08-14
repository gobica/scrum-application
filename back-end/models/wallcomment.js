'use strict';
module.exports = (sequelize, DataTypes) => {
  const WallComment = sequelize.define('WallComment', {
    comment: {
      type: DataTypes.STRING(1024),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    idUser: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id'
      }
    },
    idProject: {
      type: DataTypes.INTEGER,
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
  }, {});
  WallComment.associate = function(models) {
    models.WallComment.belongsTo(models.Project, {
      as: 'project',
      foreignKey: 'idProject'
    });

    models.WallComment.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'idUser'
    });
  };
  return WallComment;
};