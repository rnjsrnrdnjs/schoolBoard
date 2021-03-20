const Sequelize = require('sequelize');

module.exports = class MyChat extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
				user: {
                    type: Sequelize.STRING(15),
                    allowNull: false,
                },
				chat: {
                    type: Sequelize.STRING(1500),
                    allowNull: true,
                },
                img: {
                    type: Sequelize.STRING(200),
                    allowNull: true,
                },
            },{
				sequelize,
                timestamps: true,
                underscored: false,
                modelName: 'MyChat',
                tableName: 'myChats',
                paranoid: true,
                charset: 'utf8',
                collate: 'utf8_general_ci',
			}
        );
    }

    static associate(db) {
		db.MyChat.belongsTo(db.MyRoom);
		db.MyChat.belongsTo(db.User);
	}
};