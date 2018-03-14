import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../../config';
import { omitSecrets } from '../utils/auth';
import { values } from 'lodash';
import Joi from 'joi';

export const roles = {
  BANK: 'bank',
  ANYONE: '*',
};

export const payloadSchema = {
  username: Joi.string().email().required(),
  password: Joi.string().required(),
  role: Joi.any().valid(values(roles)).required(),
  fullName: Joi.string().required(),
  contactNumber: Joi.string().regex(/^0[0-8]\d{8}$/g).required(),
};

export default (sequelize, DataTypes) => {
  const saltAndHash = (instance, options, next) => {
    if (!instance.changed('password')) {
      return next(null);
    }

    new Promise((resolve, reject) => {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          return reject(err);
        }
        resolve(salt);
      });
    })
      .then(salt => {
        bcrypt.hash(instance.password, salt, (err, hash) => {
          if (err) {
            throw new Error(err);
          }
          instance.password = hash;
          next(null, instance);
        });
      })
      .catch(err => next(err));
  };

  const schema = {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'keys',
        key: 'address',
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fullName: {
      type: DataTypes.STRING,
      field: 'full_name',
      allowNull: false,
    },
    contactNumber: {
      type: DataTypes.STRING,
      field: 'contact_number',
    },
    lastLogin: {
      type: DataTypes.DATE,
      field: 'last_login',
      allowNull: true,
    },
    invitationCode: {
      type: DataTypes.UUID,
      field: 'invitation_code',
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      validate: {
        isIn: [values(roles)],
      },
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  };

  const User = sequelize.define('User', schema, {
    // Add createdAt and updatedAt timestamp columns by default.
    timestamps: true,
    // Underscore field names like: createdAt -> created_at
    underscored: true,
    // Disable modification of table names. Use explicit table name instead.
    freezeTableName: true,
    // Underlying table name.
    tableName: 'users',
    // Name used when associated with others.
    name: {
      singular: 'user',
      plural: 'users',
    },
    // Add relationships/associations.
    classMethods: {
      associate: function(models) {
        const { Key, User } = models;
        User.belongsTo(Key, { foreignKey: 'id' });
      },
    },
    // Instance methods which can be called.
    instanceMethods: {
      generateToken: function() {
        return jwt.sign(omitSecrets(this), config.token, {
          expiresIn: config.tokenDuration,
        });
      },
      validatePassword: async function(password) {
        return new Promise((resolve, reject) => {
          bcrypt.compare(password, this.password, (err, isMatch) => {
            if (err) {
              return reject(err);
            }
            resolve(isMatch);
          });
        });
      },
    },
    hooks: {
      beforeCreate: saltAndHash,
      beforeUpdate: saltAndHash,
      beforeSave: saltAndHash,
    },
  });

  User.__schema = schema;

  return User;
};
