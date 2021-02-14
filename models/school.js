const Sequelize = require('sequelize');

module.exports = class School extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
				edu:{
					type: Sequelize.STRING(50),
                    allowNull: false,
				},
				code:{
					type: Sequelize.STRING(50),
                    allowNull: false,
				},
				kind:{
					type: Sequelize.STRING(50),
                    allowNull: false,
				},
				name:{
					type: Sequelize.STRING(50),
                    allowNull: false,
				},
				addr:{
					type: Sequelize.STRING(50),
                    allowNull: false,
				},
				tellNum:{
					type: Sequelize.STRING(50),
                    allowNull: true,
				},
				homepage:{
					type: Sequelize.STRING(50),
                    allowNull: true,
				},
				coeduScNm:{
					type: Sequelize.STRING(50),
                    allowNull: true,
				},
				fondScNm:{
					type: Sequelize.STRING(50),
                    allowNull: true,
				},
				teacherCnt:{
					type: Sequelize.STRING(50),
                    allowNull: true,
				},
				level:{
					type:Sequelize.INTEGER,
					defalutValue:0,
				},
			},
			{
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
		db.School.hasOne(db.Room);
	}
};