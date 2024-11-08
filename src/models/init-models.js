import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _code from  "./code.js";
import _role from  "./role.js";
import _users from  "./users.js";

export default function initModels(sequelize) {
  const code = _code.init(sequelize, DataTypes);
  const role = _role.init(sequelize, DataTypes);
  const users = _users.init(sequelize, DataTypes);

  users.belongsTo(role, { as: "role", foreignKey: "role_id"});
  role.hasMany(users, { as: "users", foreignKey: "role_id"});

  return {
    code,
    role,
    users,
  };
}
