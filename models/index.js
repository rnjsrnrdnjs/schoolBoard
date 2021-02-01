const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const User = require('./user');
const Post = require('./post');
const School = require('./school');
const Chat =require('./chat');

const db = {};
const sequelize = new Sequelize(
  config.database, config.username, config.password, config,
);

db.sequelize = sequelize;
db.User = User;
db.Post = Post;
db.School = School;
db.Chat=Chat;

User.init(sequelize);
Post.init(sequelize);
School.init(sequelize);
Chat.init(sequelize);

User.associate(db);
Post.associate(db);
School.associate(db);
Chat.associate(db);

module.exports = db;