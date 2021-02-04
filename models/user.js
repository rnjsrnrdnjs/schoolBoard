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
   				     type: Sequelize.STRING(15),
        			allowNull: false,
      			},
                //성별
                sexual: {
					type:Sequelize.STRING(5),
                    allowNull: false,
				},
				schoolName:{
					type: Sequelize.STRING(20),
                    allowNull: false,
				},
				authority:{
					type: Sequelize.INTEGER,
                    allowNull: true,
				}
            },{
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
		
	}
};