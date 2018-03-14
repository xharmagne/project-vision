'use strict';

export default (sequelize, DataTypes) => {
  const schema = {
    address: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    priv_enc: {
      type: DataTypes.STRING,
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

  const Key = sequelize.define('Key', schema, {
    // Add createdAt and updatedAt timestamp columns by default.
    timestamps: true,
    // Underscore field names like: createdAt -> created_at
    underscored: true,
    // Disable modification of table names. Use explicit table name instead.
    freezeTableName: true,
    // Underlying table name.
    tableName: 'keys',

    name: {
      singular: 'key',
      plural: 'keys',
    },
    classMethods: {
      associate: function(models) {
        const { User, Key } = models;
        Key.hasOne(User, { foreignKey: 'id' });
      },
    },
  });

  Key.__schema = schema;

  return Key;
};
