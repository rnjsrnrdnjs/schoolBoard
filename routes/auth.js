const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../models/user');
const School = require('../models/school');
const neis = require('../neis/neis');
const SchoolType = require('../neis/types/SchoolType');

const router = express.Router();

router.post('/join', isNotLoggedIn, async (req, res, next) => {
  const { email, password , nick, sexual,code} = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    const exUser2 = await User.findOne({ where: { nick } });
    if (exUser || exUser2) {
        return res.redirect('/join?error=exist');
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


module.exports = router;