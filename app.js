const express =require('express');
const cookieParser=require('cookie-parser');
const morgan=require('morgan');
const path=require('path');
const session=require('express-session');
const nunjucks=require('nunjucks');
const dotenv=require('dotenv');
const passport=require('passport');
const helmet=require('helmet');
const hpp=require('hpp');
const redis=require('redis');
const RedisStore=require('connect-redis')(session);
const cors = require('cors')();

dotenv.config();
const redisClient=redis.createClient({
	url:`redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
	password:process.env.REDIS_PASSWORD,
});
const pageRouter=require('./routes/page');
const authRouter=require('./routes/auth');
const postRouter=require('./routes/post');
const deleteRouter=require('./routes/delete');
const {sequelize} =require('./models');
const passportConfig=require('./passport');
const webSocket=require('./socket');
//const logger=require('./logger');

const app=express();
passportConfig();
app.set('port',process.env.PORT || 3000);
app.set('view engine','html');
nunjucks.configure('views',{
	express:app,
	watch:true,
});
const sessionMiddleware=session({
	resave:false,
	saveUninitialized:false,
	secret:process.env.COOKIE_SECRET,
	cookie:{
		httpOnly:true,
		secure:false,
	},
	store:new RedisStore({client:redisClient}),
});
/*  https를 사용해야하는경우 
if(process.env.NODE_ENV==='production'){
	sessionMiddleware.proxy=true;
	sessionMiddleware.cookie.secure=true;
}*/

sequelize.sync({force:false})
	.then(()=>{
	console.log('데이터베이스 연결 성공');
})
.catch((err)=>{
	console.error(err);
});
if(process.env.NODE_ENV==='production'){
	app.use(morgan('combined'));
	app.use(helmet());
	app.use(hpp());
	app.use(cors);
}
else{
	app.use(morgan('dev'));
}
app.use(cors);
app.use(express.static(path.join(__dirname,'public')));
app.use('/img',express.static(path.join(__dirname,'uploads')));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.use('/',pageRouter);
app.use('/auth',authRouter);
app.use('/post',postRouter);
app.use('/delete',deleteRouter);

app.use((req,res,next)=>{
	const error=new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
	error.status=404;
	next(error);
});

app.use((err,req,res,next)=>{
	res.locals.message=err.message;
	res.locals.error=process.env.NODE_ENV !=='production' ? err:{};
	res.status(err.status || 500);
	res.render('error');
});

const server=app.listen(app.get('port'),()=>{
	console.log(app.get('port'),'번 포트에서 대기중');
});

webSocket(server,app,sessionMiddleware);