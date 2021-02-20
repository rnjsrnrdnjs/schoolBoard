const Sequelize = require('sequelize');

module.exports = class Clike extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
				UserId:{
					type: Sequelize.STRING(10),
                    allowNull: false,
				},
            },
            {
                sequelize,
                timestamps: false,
                underscored: false,
                modelName: 'Clike',
                tableName: 'clikes',
                paranoid: false,
                charset: 'utf8',
                collate: 'utf8_general_ci',
            }
        );
    }

    static associate(db) {
		db.Clike.belongsTo(db.Comment);
	}
};