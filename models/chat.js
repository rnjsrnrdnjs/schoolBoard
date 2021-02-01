const Sequelize = require('sequelize');

module.exports = class Chat extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
				content: {
                    type: Sequelize.STRING(140),
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
		db.Chat.hasMany(db.User);
	}
};