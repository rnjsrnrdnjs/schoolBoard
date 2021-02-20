const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const User = require('./user');
const Post = require('./post');
const School = require('./school');
const Chat =require('./chat');
const Comment=require('./comment');
const Room=require('./room');
const Plike=require('./plike');
const Pdlike=require('./pdlike');
const Clike=require('./clike');
const Cdlike=require('./cdlike');
const RoomList=require('./roomList');
const RoomAll=require('./roomAll');
const RoomAllList=require('./roomAllList');
const ChatAll=require('./chatAll');


const db = {};
const sequelize = new Sequelize(
  config.database, config.username, config.password, config,
);

db.sequelize = sequelize;
db.User = User;
db.Post = Post;
db.School = School;
db.Chat=Chat;
db.Comment=Comment;
db.Room=Room;
db.Plike=Plike;
db.Pdlike=Pdlike;
db.Clike=Clike;
db.Cdlike=Cdlike;
db.RoomList=RoomList;
db.RoomAll=RoomAll;
db.RoomAllList=RoomAllList;
db.ChatAll=ChatAll;


User.init(sequelize);
Post.init(sequelize);
School.init(sequelize);
Chat.init(sequelize);
Comment.init(sequelize);
Room.init(sequelize);
Plike.init(sequelize);
Pdlike.init(sequelize);
Clike.init(sequelize);
Cdlike.init(sequelize);
RoomList.init(sequelize);
RoomAllList.init(sequelize);
RoomAll.init(sequelize);
ChatAll.init(sequelize);


User.associate(db);
Post.associate(db);
School.associate(db);
Chat.associate(db);
Comment.associate(db);
Room.associate(db);
Plike.associate(db);
Pdlike.associate(db);
Clike.associate(db);
Cdlike.associate(db);
RoomList.associate(db);
RoomAllList.associate(db);
RoomAll.associate(db);
ChatAll.associate(db);


module.exports = db;
