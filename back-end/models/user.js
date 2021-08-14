'use strict';
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

const saltRounds = 10;
const TOKEN_VALIDITY_MS = 1 * 60 * 60 * 1000;
if(!process.env.JWT_SECRET)
  console.error("**Please set the environment variable JWT_SECRET to enable JWT generation**");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: { args: true, msg: 'Username is required' }
      },
      allowNull: false,
      unique: { args: true, msg: 'Username already in use' }
    },
    // NOTE: saving lowercased email
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: { args: true, msg: 'Invalid e-mail format' },
        notEmpty: { args: true, msg: 'E-mail required' }
      },
      allowNull: false,
      unique: { args: true, msg: 'E-mail already in use' }
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: { args: true, msg: 'Password is required' }
      },
      allowNull: false
    },
    globalRole: {
      type: DataTypes.STRING,
      validate: {
        isIn: { args: [['user', 'admin']], msg: 'Invalid role name' }
      }
    },
    firstName: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: { args: true, msg: 'First name is required' }
      },
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: { args: true, msg: 'Last name is required' }
      },
      allowNull: false
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    lastLogin: {
      type: DataTypes.DATE
    }
  }, {
    defaultScope: {
      attributes: {
        exclude: ['password', 'createdAt', 'updatedAt']
      }
    },
    scopes: {
      withPassword: {
        attributes: { }
      },
      publicDetails: {
        attributes: ['id', 'username']
      }
    }
  });
  User.associate = function(models) {
    models.User.belongsToMany(models.Project, {
      through: models.ProjectUser,
      as: "projects",
      foreignKey: "idUser",
      otherKey: "idProject"
    });

    models.User.hasMany(models.Project, { foreignKey: 'idProductOwner', onDelete: 'RESTRICT', hooks: true });
    models.User.hasMany(models.Project, { foreignKey: 'idScrumMaster', onDelete: 'RESTRICT', hooks: true });
    models.User.hasMany(models.Task, { foreignKey: 'idAssignedUser' });
    models.User.hasMany(models.WallComment, { foreignKey: 'idUser' });
    models.User.hasMany(models.TaskWork, { foreignKey: 'idUser' });
  };

  User.beforeValidate(async function(user, options) {
    user.email = user.email.toLowerCase();
  })

  User.beforeCreate(async function(user, options) {
    const hashedSaltedPass = await bcrypt.hash(user.password, saltRounds);
    user.password = hashedSaltedPass;
  });

  User.beforeUpdate(async function(user, options) {
    let changedFields = user.changed();
    // re-hash password if it's updated
    if(changedFields && changedFields.find(el => el === "password")) {
      const hashedSaltedPass = await bcrypt.hash(user.password, saltRounds);
      user.password = hashedSaltedPass;
    }
  });

  User.authenticate = async function(username, password) {
    const queryUser = await User.scope("withPassword").findOne({ where: { username: username }});
    if(queryUser) {
      const isMatch = await bcrypt.compare(password, queryUser.password);
      if(isMatch) {
        let generatedToken = queryUser.generateToken();
        queryUser.lastLogin = new Date();
        await queryUser.save();
        return generatedToken;
      }
    }

    throw new Error("Authentication failed!");
  };

  User.prototype.generateToken = function() {
    let expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + TOKEN_VALIDITY_MS);
    return jwt.sign({
      id: this.id,
      username: this.username,
      email: this.email.toLowerCase(),
      globalRole: this.globalRole,
      firstName: this.firstName,
      lastName: this.lastName,
      // unix timestamp (seconds since 1.1.1970)
      lastLogin: this.lastLogin? parseInt(this.lastLogin.getTime() / 1000, 10): null,
      exp: parseInt(expirationDate.getTime() / 1000, 10)
    }, process.env.JWT_SECRET);
  };

  return User;
};