const Sequelize = require('sequelize');

module.exports = class ChatAll extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
				user: {
                    type: Sequelize.STRING(15),
                    allowNull: false,
                },
				chat: {
                    type: Sequelize.STRING(200),
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
                modelName: 'ChatAll',
                tableName: 'chatAlls',
                paranoid: true,
                charset: 'utf8',
                collate: 'utf8_general_ci',
			}
        );
    }

    static associate(db) {
		db.ChatAll.belongsTo(db.RoomAll);
		db.ChatAll.belongsTo(db.User);
	}
};