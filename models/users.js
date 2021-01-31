const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                email: {
                    type: Sequelize.String(40),
                    allowNull: false,
                    unique: true,
                },
                //아이디
                ownId: {
					type:sequelize.String(20),
                    allowNull: false,
                    unique: true,
				},
                //비밀번호
                password: {
					type:sequelize.String(100),
                    allowNull: false,
				},
                //닉네임
                nickname: {
					type:sequelize.String(100),
                    allowNull: false, 
				},
                //성별
                sexual: {
					type:sequelize.String(2),
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

    static associate(db) {}
};