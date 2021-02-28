const Sequelize = require('sequelize');

module.exports = class Room extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
				title:{
                    type: Sequelize.STRING(15),
                    allowNull: false,
				},
				owner:{
                    type: Sequelize.STRING(8),
                    allowNull: false,
				},
				password:{
                    type: Sequelize.STRING(15),
                    allowNull: true,
				},
				cnt:{
					type:Sequelize.INTEGER,
					defalutValue:0,
					allowNull:false,
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
		db.Room.hasMany(db.RoomList);
		db.Room.belongsTo(db.School);
		db.Room.belongsTo(db.User);
	}
};