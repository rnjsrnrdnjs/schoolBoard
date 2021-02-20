const Sequelize = require('sequelize');

module.exports = class Pdlike extends Sequelize.Model {
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
                modelName: 'Pdlike',
                tableName: 'pdlikes',
                paranoid: false,
                charset: 'utf8',
                collate: 'utf8_general_ci',
            }
        );
    }

    static associate(db) {
		db.Pdlike.belongsTo(db.Post);
	}
};