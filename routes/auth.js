const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const {User,School,Post,Comment,Chat,Room} = require('../models/');

const neis = require('../neis/neis');
const SchoolType = require('../neis/types/SchoolType');

const router = express.Router();

router.get('/overlap/change/:nick', isLoggedIn, async (req, res, next) => {
	try{
		const user=await User.findOne({
			where:{nick:req.params.nick},
		});
		if(user){
			return res.redirect(`/setting?nickError=중복된 닉네임 입니다.`);
		}
		return res.redirect(`/setting?nickError=사용가능한 닉네임 입니다.`);
	}catch(err){
		console.error(err);
		next(err);
	}
});
router.get('/overlap/join/:nick', isNotLoggedIn, async (req, res, next) => {
	try{
		const user=await User.findOne({
			where:{nick:req.params.nick},
		});
		if(user){
			return res.redirect(`/join?nickError=중복된 닉네임 입니다.`);
		}
		return res.redirect(`/join?nickError=사용가능한 닉네임 입니다.`);
	}catch(err){
		console.error(err);
		next(err);
	}
});
router.post('/join', isNotLoggedIn, async (req, res, next) => {
  const { email, password , nick, sexual,code} = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    const exUser2 = await User.findOne({ where: { nick } });
    if (exUser) {
      return res.redirect(`/join?loginError=123`);
  }
	if(exUser2){
      return res.redirect(`/join?loginError=1234`);
	}
    const hash = await bcrypt.hash(password, 12);
	const sname=await School.findOne({
		where:{code:code},
	})
    const u=await User.create({
      email,
      password: hash,
	  nick,
	  sexual,
	  edu:neis.REGION[sname.edu],
	  code:sname.code,
	  kind:sname.kind,
	  authority:0,
	  schoolName:sname.name,
	  SchoolId:sname.id, 
	  profile:'blank-profile.svg',
    });
	  
    return res.redirect('/');
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.redirect(`/?loginError=${info.message}`);
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect('/main');
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
});

router.get('/logout', isLoggedIn, (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

router.delete('/destroy', isLoggedIn, async(req, res) => {
	try{
	  await User.destroy({
		  where:{
			  id:req.user.id,
		  }
	  });
	  await Post.destroy({
		  where:{
			  UserId:req.user.id,
		  }
	  });
	  await Comment.destroy({
		  where:{
			  UserId:req.user.id,
		  }
	  });
	  await Chat.destroy({
		  where:{
			  User:req.user.nick,
		  }
	  });
		
	  await res.redirect('/');
	}catch (error) {
    console.error(error);
    return next(error);
  }
});

module.exports = router;