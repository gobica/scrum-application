'use strict';
module.exports = (sequelize, DataTypes) => {
  const ResetRequest = sequelize.define('ResetRequest', {
    stringToken: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    issued: {
      type: DataTypes.DATE,
      validate: {
        isDate: true
      },
      allowNull: false
    },
    validUntil: {
      type: DataTypes.DATE,
      validate: {
        isDate: true,
        isInFuture: function(value) {
          const currDate = new Date();
          if(value < currDate)
            throw new Error('Token\'s expiration date must be in the future');
        }
      },
      allowNull: false
    },
    isUsed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    idUser: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id'
      },
      allowNull: false
    }
  }, {});
  ResetRequest.associate = function(models) {
    models.ResetRequest.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'idUser'
    });
  };
  return ResetRequest;
};