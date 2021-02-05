const Sequelize = require('sequelize');

module.exports = class Post extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
				category: {
                    type: Sequelize.STRING(10),
                    allowNull: false,
                },
                content: {
                    type: Sequelize.STRING(140),
                    allowNull: false,
                },
                img: {
                    type: Sequelize.STRING(200),
                    allowNull: true,
                },/*
				like:{
                    type: Sequelize.INTEGER,
                    allowNull: true,
					defalut:0,
				}*/
            },
            {
                sequelize,
                timestamps: true,
                underscored: false,
                modelName: 'Post',
                tableName: 'posts',
                paranoid: true,
                charset: 'utf8',
                collate: 'utf8_general_ci',
            }
        );
    }

    static associate(db) {
		db.Post.belongsTo(db.School);
		db.Post.hasMany(db.Comment);
		db.Post.belongsTo(db.User);
	}
};