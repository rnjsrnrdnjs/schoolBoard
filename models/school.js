const Sequelize = require('sequelize');

module.exports = class School extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
				schoolName:{
					type:Sequelize.STRING(20),
					unique:true,
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

    static associate(db) {}
};