const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const {User,School,Post,Comment,Chat,Room,RoomAll} = require('../models/');

const neis = require('../neis/neis');
const SchoolType = require('../neis/types/SchoolType');

const router = express.Router();


router.post('/overlap/change', isLoggedIn, async (req, res, next) => {
	try{
		const user=await User.findOne({
			where:{nick:req.body.nick},
		});
		if(user){
			return res.redirect(`/setting?nickError=중복된 닉네임 입니다.`);
		}
		await Chat.update({
			user:req.body.nick,
		},{
			where:{
				user:req.user.nick,
			}
		})
		await User.update({
			nick:req.body.nick,
		},{
			where:{
				id:req.user.id,
			}
		});
		await Room.update({
			owner:req.body.nick,
		},{
			where:{
				owner:req.user.nick,
			}
		});
		await RoomAll.update({
			owner:req.body.nick,
		},{
			where:{
				owner:req.user.nick,
			}
		});
		
		
		
		return res.redirect('/setting');
	}catch(err){
		console.error(err);
		next(err);
	}
});
router.post('/overlapNick/:nick', isNotLoggedIn, async (req, res, next) => {
	try{
		const findUser=await User.findOne({
			where:{
				nick:req.params.nick,	
			}
		});
		if(findUser)
			return res.json({ chk : false });
		else
			return res.json({ chk: true });
	}catch(err){
		console.error(err);
		next(err);
	}
});
router.post('/overlapId/:email', isNotLoggedIn, async (req, res, next) => {
	try{
		const findUser=await User.findOne({
			where:{
				email:req.params.email,	
			}
		});
		if(findUser)
			return res.json({ chk : false });
		else
			return res.json({ chk: true });
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
      return res.redirect(`/join?loginError=중복된 아이디 입니다.`);
  }
	if(exUser2){
      return res.redirect(`/join?loginError=중복된 닉네임 입니다.`);
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
	  schoolName:sname.name,
	  SchoolId:sname.id, 
	  profile:'blank-profile.svg',
	  concaveWin:0,	
	  concaveLose:0,	
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
	  await Room.destroy({
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