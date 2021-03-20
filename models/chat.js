const Sequelize = require('sequelize');

module.exports = class Chat extends Sequelize.Model {
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
                modelName: 'Chat',
                tableName: 'chats',
                paranoid: true,
                charset: 'utf8',
                collate: 'utf8_general_ci',
			}
        );
    }

    static associate(db) {
		db.Chat.belongsTo(db.Room);
		db.Chat.belongsTo(db.User);
	}
};