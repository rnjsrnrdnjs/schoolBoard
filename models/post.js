const Sequelize = require('sequelize');

module.exports = class Post extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                content: {
                    type: Sequelize.String(140),
                    allowNull: false,
                },
                img: {
                    type: Sequelize.String(200),
                    allowNull: false,
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

    static associate(db) {}
};