const express=require('express');
const {isLoggedIn ,isNotLoggedIn }=require('./middlewares');
const multer=require('multer');
const path=require('path');
const fs=require('fs');
const {sequelize}=require('../models');

const {Post,School,User,Comment}=require('../models');
const router=express.Router();

try{
	fs.readdirSync('uploads');
}catch(error){
	console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
	fs.mkdirSync('uploads');
}

const upload=multer({
	storage:multer.diskStorage({
		destination(req,file,cb){
			cb(null,'uploads/');
		},
		filename(req,file,cb){
			const ext=path.extname(file.originalname);
			cb(null,path.basename(file.originalname,ext)+Date.now()+ext);
		},
	}),
	limits:{fileSize:5*1024*1024},
});

router.post('/img',isLoggedIn,upload.single('img'),(req,res)=>{
	console.log(req.file+"!@#!@#!@#");
	res.json({url:`/img/${req.file.filename}`});
});

const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
  try {
	  if(req.body.Pid){
		  if(req.body.url){
			  const post=await Post.update({
			  title:req.body.title,
	  			category:req.body.category,
      			content: req.body.content,
      			img: req.body.url,
		  },{
			where:{
				id:req.body.Pid,
			},
		  });
		  }
		  else{
		  const post=await Post.update({
			  title:req.body.title,
	  			category:req.body.category,
      			content: req.body.content,
		  },{
			where:{
				id:req.body.Pid,
			},
		  });
		  }
	  }
	  else{
    const post = await Post.create({
	  title:req.body.title,
	  category:req.body.category,
      content: req.body.content,
      img: req.body.url,
	  like:0,
	  dislike:0,
	  likeChk:req.user.id,
	  dislikeChk:req.user.id,
      UserId: req.user.id,
	  SchoolId:req.user.SchoolId,
    });
	 }
	res.redirect(`/main/${req.body.category}`);
  } catch (error) {
    console.error(error);
    next(error);
  }
});
router.post('/comment',isLoggedIn,async(req,res,next)=>{
	try{
		const Pid=await req.body.Pid;
		const comment=await Comment.create({
			content:req.body.content,
			like:0,
			dislike:0,
			UserId:req.user.id,
			PostId:Pid,
			likeChk:req.user.id,
	  		dislikeChk:req.user.id,
		});	
		res.redirect(`/comment/${Pid}`);
	}catch (error) {
    console.error(error);
    next(error);
  }
});
router.post('/comment/like/:id',isLoggedIn,async(req,res,next)=>{
	try{
		const chk=await Comment.findOne({
			where:{
				id:req.body.Cid,	
			},
		});
		if(chk.likeChk==req.user.id){
			await Comment.increment({like: 1}, { where: { id:req.body.Cid, } });
			await Comment.increment({likeChk: 1}, { where: { id:req.body.Cid, } });
		}
		else {
			await Comment.decrement({like: 1}, { where: { id:req.body.Cid, } });
			await Comment.decrement({likeChk: 1}, { where: { id:req.body.Cid, } });
		}
		res.redirect(`/comment/${req.params.id}`);
	}catch (error) {
    console.error(error);
    next(error);
  }
});
router.post('/comment/dislike/:id',isLoggedIn,async(req,res,next)=>{
	try{
		const chk=await Comment.findOne({
			where:{
				id:req.body.Cid,	
			},
		});
		if(chk.dislikeChk==req.user.id){
			await Comment.increment({dislike: 1}, { where: { id:req.body.Cid, } });
			await Comment.increment({dislikeChk: 1}, { where: { id:req.body.Cid, } });
		}
		else {
			await Comment.decrement({dislike: 1}, { where: { id:req.body.Cid, } });
			await Comment.decrement({dislikeChk: 1}, { where: { id:req.body.Cid, } });
		}
		res.redirect(`/comment/${req.params.id}`);
	}catch (error) {
    console.error(error);
    next(error);
  }
});
router.post('/post/like/:id',isLoggedIn,async(req,res,next)=>{
	try{
		const chk=await Post.findOne({
			where:{
				id:req.params.id,	
			},
		});
		if(chk.likeChk==req.user.id){
			await Post.increment({like: 1}, { where: { id:req.params.id, } });
			await Post.increment({likeChk: 1}, { where: { id:req.params.id, } });
		}
		else {
			await Post.decrement({like: 1}, { where: { id:req.params.id, } });
			await Post.decrement({likeChk: 1}, { where: { id:req.params.id, } });
		}
		res.redirect(`/comment/${req.params.id}`);
	}catch (error) {
    console.error(error);
    next(error);
  }
});
router.post('/post/dislike/:id',isLoggedIn,async(req,res,next)=>{
	try{
		const chk=await Post.findOne({
			where:{
				id:req.params.id,	
			},
		});
		if(chk.dislikeChk==req.user.id){
			await Post.increment({dislike: 1}, { where: { id:req.params.id, } });
			await Post.increment({dislikeChk: 1}, { where: { id:req.params.id, } });
		}
		else {
			await Post.decrement({dislike: 1}, { where: { id:req.params.id, } });
			await Post.decrement({dislikeChk: 1}, { where: { id:req.params.id, } });
		}
		res.redirect(`/comment/${req.params.id}`);
	}catch (error) {
    console.error(error);
    next(error);
  }
});


module.exports=router;