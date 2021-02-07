const Sequelize = require('sequelize');

module.exports = class Room extends Sequelize.Model {
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
                timestamps: false,
                underscored: false,
                modelName: 'Room',
                tableName: 'rooms',
                paranoid: false,
                charset: 'utf8',
                collate: 'utf8_general_ci',
			}
        );
    }

    static associate(db) {
		db.Room.hasMany(db.Chat);
		db.Room.belongsToMany(db.User,{through:'UserRoom'});
	}
};