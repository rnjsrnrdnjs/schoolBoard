const Sequelize = require('sequelize');

module.exports = class MyChatRead extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
				readId: {
                    type: Sequelize.STRING(10),
                    allowNull: false,
                },
            },{
				sequelize,
                timestamps: true,
                underscored: false,
                modelName: 'MyChatRead',
                tableName: 'myChatReads',
                paranoid: true,
                charset: 'utf8',
                collate: 'utf8_general_ci',
			}
        );
    }

    static associate(db) {
		db.MyChatRead.belongsTo(db.MyChat);
	}
};