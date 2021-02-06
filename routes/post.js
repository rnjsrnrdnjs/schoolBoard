const express=require('express');
const {isLoggedIn ,isNotLoggedIn }=require('./middlewares');
const multer=require('multer');
const path=require('path');
const fs=require('fs');

const {Post,School,User}=require('../models');
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
	  console.log(req.body.url);
    const post = await Post.create({
	  title:req.body.title,
	  category:req.body.category,
      content: req.body.content,
      img: req.body.url,
	  like:0,
	//dislike:0,
      UserId: req.user.id,
	  SchoolId:req.user.SchoolId,
    });
	res.redirect(`/board/${req.body.category}`);
  } catch (error) {
    console.error(error);
    next(error);
  }
});


module.exports=router;