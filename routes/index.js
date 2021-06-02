const scheduler = require('../models/scheduler');
const express = require('express');
const logger = require('../lib/logger');
const { validator } = require('../middlewares/validator');
const router = express.Router();

// 스케줄 조회
router.get('/', async (req, res, next) => {
  const data = await scheduler.getCalendar(req.query.year, req.query.month);
  console.log(data);

  res.render('main', data);
});

// axios - ajax
router.route('/schedule')
        // 스케줄 등록 양식
        .get((req, res, next) => {
          const stamp = req.query.stamp;
          if (!stamp) {
            return res.send(`<script>alert("잘못된 접근입니다.");ke.layer.close();</script>`);
          }

          const data = {
            stamp,
            colors : scheduler.getColors(),
          };

          res.render("form", data);
        })
        // 스케줄 등록
        .post(validator, async (req, res, next) => {
          //console.log(req.body);
          const result = await scheduler.add(req.body);
          //console.log(result);


          return res.json({ success:result });
        })
        // 스케줄 수정
        .patch((req, res, next) => {

        })
        // 스케줄 삭제
        .delete((req, res, next) => {

        });

module.exports = router;
