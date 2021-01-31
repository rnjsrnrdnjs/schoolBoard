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
                //닉네임
                nickname: {
					type:Sequelize.STRING(100),
                    allowNull: false, 
				},
                //성별
                sexual: {
					type:Sequelize.STRING(2),
                    allowNull: false,
				},
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
		db.User.hasMany(db.Post);
	}
};