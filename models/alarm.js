const Sequelize = require('sequelize');

module.exports = class Alarm extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                content: {
					//나중에 1000으로바꾸기
                    type: Sequelize.STRING(1000),
                    allowNull: false,
                },
				src:{
					type:Sequelize.STRING(200),
					allowNull:true,
				},
				read:{
					type: Sequelize.STRING(5),
                    allowNull: false,
				},
            },
            {
                sequelize,
                timestamps: true,
                underscored: false,
                modelName: 'Alarm',
                tableName: 'alarms',
                paranoid: true,
                charset: 'utf8',
                collate: 'utf8_general_ci',
            }
        );
    }

    static associate(db) {
		db.Alarm.belongsTo(db.User);
	}
};