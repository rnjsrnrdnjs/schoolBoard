const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                email: {
                    type: Sequelize.STRING(40),
                    allowNull: false,
                    unique: true,
                },
                //비밀번호
                password: {
					type:Sequelize.STRING(100),
                    allowNull: false,
				},
                nick: {
   				     type: Sequelize.STRING(8),
        			allowNull: false,
					unique:true,
      			},
                //성별
                sexual: {
					type:Sequelize.STRING(5),
                    allowNull: false,
				},
				edu:{
					type: Sequelize.STRING(50),
                    allowNull: false,
				},
				code:{
					type: Sequelize.STRING(50),
                    allowNull: false,
				},
				kind:{
					type: Sequelize.STRING(50),
                    allowNull: false,
				},
				schoolName:{
					type: Sequelize.STRING(50),
                    allowNull: false,
				},
				profile: {
                    type: Sequelize.STRING(200),
                    allowNull: true,
                },
			},
			{
				sequelize,
				timestamps:false,
				underscored:false,
				modelName:'User',
				tableName:'users',
				paranoid:false,
				charset:'utf8',
				collate:'utf8_general_ci',
			}
        );
    }

    static associate(db) {
		db.User.belongsTo(db.School);
		db.User.hasMany(db.Post);
		db.User.hasMany(db.Chat);
		db.User.hasMany(db.Comment);
		db.User.hasMany(db.Room);
		db.User.hasMany(db.RoomAll);
		db.User.hasMany(db.ChatAll);
		db.User.hasMany(db.MyRoom);
		db.User.hasMany(db.MyChat);
		db.User.hasMany(db.Alarm);
	}
};