const Sequelize = require('sequelize');

module.exports = class Notice extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
				title:{
                    type: Sequelize.STRING(20),
                    allowNull: false,
				},
                content: {
					//나중에 1000으로바꾸기
                    type: Sequelize.STRING(1000),
                    allowNull: false,
                },
                img: {
                    type: Sequelize.STRING(200),
                    allowNull: true,
                },
            },
            {
                sequelize,
                timestamps: true,
                underscored: false,
                modelName: 'Notice',
                tableName: 'notices',
                paranoid: true,
                charset: 'utf8',
                collate: 'utf8_general_ci',
            }
        );
    }

    static associate(db) {
		
	}
};