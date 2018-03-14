export default (sequelize, DataTypes) => {
  const schema = {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    blockNumber: {
      type: DataTypes.INTEGER,
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

  const Contract = sequelize.define('Contract', schema, {
    // Add createdAt and updatedAt timestamp columns by default.
    timestamps: true,
    // Underscore field names like: createdAt -> created_at
    underscored: true,
    // Disable modification of table names. Use explicit table name instead.
    freezeTableName: true,
    // Underlying table name.
    tableName: 'contracts',
  });

  Contract.__schema = schema;

  return Contract;
};
