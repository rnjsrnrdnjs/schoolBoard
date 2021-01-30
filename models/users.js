const Sequelize =require('sequelize');

module.exports=class User extends Sequelize.Model{
	static init(sequelize){
		return super.init({
			
		});
	}
	
	static associate(db){}
};