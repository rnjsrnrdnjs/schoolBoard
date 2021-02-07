const Sequelize = require('sequelize');

module.exports = class Comment extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                content: {
                    type: Sequelize.STRING(140),
                    allowNull: false,
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
				likeChk:{
					type: Sequelize.INTEGER,
                    allowNull: false,
				},
				dislikeChk:{
					type: Sequelize.INTEGER,
                    allowNull: false,
				}
            },
            {
                sequelize,
                timestamps: true,
                underscored: false,
                modelName: 'Comment',
                tableName: 'comments',
                paranoid: true,
                charset: 'utf8',
                collate: 'utf8_general_ci',
            }
        );
    }

    static associate(db) {
		db.Comment.belongsTo(db.Post);
		db.Comment.belongsTo(db.User);
	}
};