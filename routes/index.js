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
        // 스케줄 등록, 수정
        .post(validator, async (req, res, next) => {
          //console.log(req.body);
          const result = await scheduler.add(req.body);
          //console.log(result);


          return res.json({ success:result });
        })
        // 스케줄 색상 수정
        .patch( async (req, res, next) => {
          //console.log(req.body);
          const result = await scheduler.changeColor(req.body.period, req.body.prevColor, req.body.color);

          return res.json({success : result});
        })
        // 스케줄 삭제
        .delete( async (req, res, next) => {
          //console.log(req.query);
          const result = await scheduler.delete(req.query.period, req.query.color);

          return res.json({ success : result });
        });

/** 스케줄 조회 */
router.get("/schedule/view/:stamp/:color", async (req, res, next) => {
  //req.params
  //console.log(req.params);
  const data = await scheduler.getSchedule(req.params.stamp, req.params.color);
  data.todaySchedules = await scheduler.getTodaySchedule();
  //console.log(todaySchedules);
  //console.log(data);
  data.colors = Object.keys(scheduler.getColors());

  return res.render("view", data);
});

/** 스케줄 수정 */
router.get("/schedule/:period/:color", async (req, res, next) => {
  const data = await scheduler.getInfo(req.params.period, req.params.color);
  data.colors =  Object.keys(scheduler.getColors());
  data.period = req.params.period;

  return res.render("form", data);
});

/** 오늘 스케줄 확인 */
router.route("/schedule/today")
      .get(async (req, res, next) => {
      const list = await scheduler.getTodaySchedules();
      return res.render("today", { list });
      })
      .patch(async (req, res, next) => {
        const result = await scheduler.confrimTodaySchedule(req.body.isChecked);

        return res.json({success:result});
      });

module.exports = router;
