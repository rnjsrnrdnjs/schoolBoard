const Sequelize = require('sequelize');

module.exports = class Room extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
				title:{
                    type: Sequelize.STRING(20),
                    allowNull: false,
				},
				owner:{
                    type: Sequelize.STRING(15),
                    allowNull: false,
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
		db.Room.belongsTo(db.School);
	}
};