const express=require('express');
const {isLoggedIn ,isNotLoggedIn ,search}=require('./middlewares');
const multer=require('multer');
const path=require('path');
const fs=require('fs');
const {sequelize}=require('../models');

const neis = require('../neis/neis');
const SchoolType = require('../neis/types/SchoolType');

const {Post,School,User,Comment,Room,Chat}=require('../models');
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
	res.json({url:`/img/${req.file.filename}`});
});

const upload2 = multer();
router.post('/profile/img',isLoggedIn, upload.single('img'), async (req, res, next) => {
  try {
	  const filename='img/'+req.file.filename;
    await User.update({
		profile:filename,
	},{
		where: {id: req.user.id},
	});	
	  res.render('setting/setting');
  } catch (error) {
    console.error(error);
    next(error);
  }
});
router.post('/room/:id/img',isLoggedIn, upload.single('img'), async (req, res, next) => {
  try {
	  console.log(req.file.filename);
    const chat = await Chat.create({
	  UserId:req.user.id,
      RoomId: req.params.id,
      user: req.user.nick,
      img: req.file.filename,
	});	
    req.app.get('io').of('/chat').to(req.params.id).emit('chat', chat);
    res.send('ok');
  } catch (error) {
    console.error(error);
    next(error);
  }
});
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
router.post('/join/:find', isNotLoggedIn, async(req, res, next) => {
	try{
	    res.render('join',{
			find:req.params.find,
			code:req.body.code,
		});
	}catch(err){
		console.log(err);
		next(err);
	}
});


router.post('/school/search', isNotLoggedIn, async(req, res, next) => {
	try{
		const result=await neis.searchSchool(req.body.schoolname,req.body.region);
		result.forEach(async(school)=>{
			const find=await School.findOne({
				where:{
					code:school.code,
				},
			})
			console.log(1);
			if(find===null){
				const detail=await neis.createSchool(neis.REGION[school.edu], school.code,school.kind).getSchoolDetail();
				await School.create({
				edu:neis.REGION[detail.edu],
				code:detail.code,
				kind:detail.kind,
				name:detail.name,
				addr:detail.addr,
				tellNum:detail.tellNum,
				homepage:detail.homepage,
				coeduScNm:detail.coeduScNm,
				fondScNm:detail.fondScNm,
				teacherCnt:detail.teacherCnt,
				level:0,
				});
			}
		})
	    await res.render('findSchool',{
			result:result,
		});
	}catch(err){
		console.log(err);
		next(err);
	}
});

router.post('/schoolMake', isLoggedIn, async(req, res, next) => {
	try{
		const newRoom=await Room.create({
			title:req.body.title,
			owner:res.locals.user.nick,
			SchoolId:res.locals.school.id,
		});
		const io=req.app.get('io');
		io.of('/room').emit('newRoom',newRoom);
		res.redirect(`/room/${newRoom.id}`);
	}catch(err){
		console.error(error);
		next(error);
	}
});
router.post('/room/:id/chat', isLoggedIn, async(req, res, next) => {
	try{
		const chat=await Chat.create({
			user:req.user.nick,
			UserId:req.user.id,
			RoomId:req.params.id,
			chat:req.body.chat,
		});
		req.app.get('io').of('/chat').to(req.params.id).emit('chat', chat);
  		 res.send('ok');
	}catch(err){
		console.error(error);
		next(error);
	}
});

module.exports=router;