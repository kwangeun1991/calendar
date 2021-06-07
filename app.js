const express = require('express');
const path = require('path');
const morgan = require('morgan');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const logger = require("./lib/logger");
const { sequelize } = require('./models');

// 라우터
const indexRouter = require('./routes');

dotenv.config();

const app = express();

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'html');
nunjucks.configure('views', {
  express : app,
  watch : true,
});

sequelize.sync({ force:false })
        .then(()=>{
          logger('데이터 베이스 연결성공');
        })
        .catch((err)=>{
          logger(err.message, 'error');
          logger(err.stack, 'error');
        });

if (process.env.NODE_ENV == 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

app.use(express.static(path.join(__dirname, 'public')));

// body-parser
app.use(express.json());
app.use(express.urlencoded({ extended:false }));

// 라우터 등록 부분
app.use(indexRouter); // "/" - 생략가능

// 없는 페이지
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url}는 없는 페이지 입니다.`);
  error.status = 404;
  next(error);
});

// 에러처리
app.use((err, req, res, next) => {
  err.status = err.status || 500;
  const message = `${err.status} ${err.message}`;
  logger(err.message, 'error');
  logger(err.stack, 'error');

  if (process.env.NODE_ENV == 'production') err.stack = {};
  res.locals.error = err;

  res.status(err.status).render('error');
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기중');
});
