const Sequelize = require('sequelize');

module.exports = class RoomAll extends Sequelize.Model {
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
                modelName: 'RoomAll',
                tableName: 'roomAlls',
                paranoid: false,
                charset: 'utf8',
                collate: 'utf8_general_ci',
			}
        );
    }

    static associate(db) {
		db.RoomAll.hasMany(db.ChatAll);
		db.RoomAll.hasMany(db.RoomAllList);
		db.RoomAll.belongsTo(db.User);
	}
};