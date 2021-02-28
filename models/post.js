const Sequelize = require('sequelize');

module.exports = class Post extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
				category: {
                    type: Sequelize.STRING(10),
                    allowNull: false,
                },
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
				like:{
                    type: Sequelize.INTEGER,
					defalutValue:0,
                    allowNull: true,
				},
				dislike:{
                    type: Sequelize.INTEGER,
					defalutValue:0,
                    allowNull: true,
				},
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
		db.Post.hasMany(db.Plike);
		db.Post.hasMany(db.Pdlike);
	}
};