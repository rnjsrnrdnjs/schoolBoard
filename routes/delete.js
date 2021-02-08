const express=require('express');
const {isLoggedIn ,isNotLoggedIn }=require('./middlewares');
const {sequelize}=require('../models');

const {Post,School,User,Comment}=require('../models');
const router=express.Router();

router.post('/comment/:id',isLoggedIn,async(req,res,next)=>{
	try{
		const Pid=await req.body.Pid;
		await Comment.destroy({
			where:{
				id:req.params.id,
			}
		});
		await res.redirect(`/comment/${Pid}`);
	}catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/post/:id',isLoggedIn,async(req,res,next)=>{
	try{
		await Post.destroy({
			where:{
				id:req.params.id,
			}
		})
		await res.redirect(`/main`);
		
	}catch (error) {
    console.error(error);
    next(error);
  }
});


module.exports=router;