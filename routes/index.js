const scheduler = require('../models/scheduler');
const express = require('express');
const logger = require('../lib/logger');
const { validator } = require('../middlewares/validator');
const router = express.Router();

// 스케줄 조회
router.get('/', async (req, res, next) => {
  const data = await scheduler.getCalendar(req.query.year, req.query.month);
  //console.log(data);

  res.render('main', data);
});

// axios - ajax
router.route('/schedule')
        // 스케줄 등록 양식
        .get((req, res, next) => {
          const stamp = req.query.stamp;
          let date = "";
          if (stamp) {
            date = scheduler.getDate(stamp);
          }

          const data = {
            stamp,
            colors : Object.keys(scheduler.getColors()),
            date,
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

/** 스케줄 조회 */
router.get("/schedule/view/:stamp/:color", async (req, res, next) => {
  //req.params
  //console.log(req.params);
  const data = await scheduler.getSchedule(req.params.stamp, req.params.color);
  //console.log(data);
  data.colors = Object.keys(scheduler.getColors());

  return res.render("view", data);
});

module.exports = router;
