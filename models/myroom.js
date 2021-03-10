const Sequelize = require('sequelize');

module.exports = class MyRoom extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
				//manito -> 마니또 ,individual -> 1대1 톡
				kind:{
                    type: Sequelize.STRING(15),
                    allowNull: false,
				},
				member1:{
                    type: Sequelize.STRING(10),
                    allowNull: false,
				},
				member2:{
                    type: Sequelize.STRING(10),
                    allowNull: false,
				},
            },{
				sequelize,
                timestamps: false,
                underscored: false,
                modelName: 'MyRoom',
                tableName: 'myRooms',
                paranoid: false,
                charset: 'utf8',
                collate: 'utf8_general_ci',
			}
        );
    }

    static associate(db) {
		db.MyRoom.hasMany(db.MyChat);
		db.MyRoom.belongsTo(db.User);
	}
};