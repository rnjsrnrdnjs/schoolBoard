const Sequelize = require('sequelize');

module.exports = class School extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
				name:{
					type:Sequelize.STRING(20),
					allowNull:false,
				}, 
    			address:{
					type:Sequelize.STRING(40),
					allowNull:false,
				},
				level:{
					type:Sequelize.INTEGER,
				},
            },{
				sequelize,
				timestamps:false,
				underscored:false,
				modelName:'School',
				tableName:'schools',
				paranoid:false,
				charset:'utf8',
				collate:'utf8_general_ci',
			}
        );
    }

    static associate(db) {
		db.School.hasMany(db.User);
		db.School.hasMany(db.Post);
	}
};