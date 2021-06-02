const { sequelize, Sequelize : { QueryTypes } } = require('./index');
const logger = require('../lib/logger');
/**
* 스케줄러 MODEL
*
*/
const scheduler = {
  /**
  * 스케줄 당력 일자 + 스케줄
  *
  * @param INT year
  * @param INT|String month
  *
  * @return JSON
  */
  getCalendar : async function(year, month) {
    let date = new Date();
    year = year || date.getFullYear();
    month = month || date.getMonth() + 1;
    month = Number(month);
    /**
    * 1. 현재 달의 시작일, 현재 달의 마지막일(30, 31, 28, 29)
    * 2. 현재 달의 시작일의 요일
    */
    date = new Date(year, month - 1, 1);
    const timeStamp = date.getTime();
    const dayStamp = 60 * 60 * 24 * 1000;
    const yoil = date.getDay(); // 0~6
    const startNo = yoil * -1;
    const endNo = 42 + startNo; // startNo 음수 아니면 0

    let nextMonthDays = 0;
    let days = []; // 날짜
    for (let i = startNo; i < endNo; i++) {
      const newStamp = timeStamp + dayStamp * i;
      //console.log(new Date(newStamp).getDate());
      date = new Date(newStamp);

      const newYear = date.getFullYear();
      let newMonth = Number(date.getMonth() + 1);
      let newDay = date.getDate();
      if (newStamp > timeStamp && month != newMonth) { // 다음달
        nextMonthDays++;
      }

      newMonth = (newMonth < 10)?"0"+newMonth:newMonth;
      newDay = (newDay < 10)?"0"+newDay:newDay;
      const str = `${newYear}.${newMonth}.${newDay}`;
      const stamp = parseInt(newStamp / 1000); // 1초단위 unit time

      days.push({
        'date' : str, // 년도      2020.07.20
        'day' : newDay, // 01, 02, 03, ...
        'yoil' : this.getYoil(newStamp), // 일,월,화,수,... 한글요일
        'yoilsEn' : this.getYoil(newStamp, 'en'), // 영문요일
        'stamp' : stamp, // 1초단위 unix timestamp
        'object' : date,
      });
    }// endfor
    //console.log(nextMonthDays);
    //console.log(days);
    if (nextMonthDays >= 7) {
      days.forEach((v, i, _days) => {
        if (i >= 35) {
          delete _days[i];
        }
      });

      days.length = 35;
    }

    /** 스케줄 조회 */
    const schedules = this.get(days[0].object, days[days.length -1].object);
    /** 스케줄 조회 */


    let nextYear = year, prevYear = year;
    let nextMonth = month, prevMonth = month;
    if (month == 1) {
      prevYear--;
      prevMonth = 12;
      nextMonth++;
    } else if (month == 12) {
      nextYear++;
      nextMonth = 1;
      prevMonth--;
    } else {
      prevMonth--;
      nextMonth++;
    }

    //console.log(days);
    const yoilsEn = this.getYoils('en');
    return {days, year, month, yoilsEn, prevYear, prevMonth, nextYear, nextMonth};
  },
  /**
  * 현재요일 (일~토)
  *
  */
  getYoil : function(timeStamp, mode) {
    mode = mode || 'ko';
    let date;
    if (timeStamp) {
      date = new Date(timeStamp);
    } else {
      date = new Date();
    }

    const yoils = this.getYoils(mode);
    const yoil = date.getDay();

    return yoils[yoil];
  },
  getYoils : function(mode) {
    mode = mode || 'ko';
    if (mode == 'ko') { // 한글요일
      return ["일","월","화","수","목","금","토"];
    } else { // 영어 요일
      return ["SUN","MON","TUE","WED","THU","FRI","SAT"];
    }
  },
  /**
  * 선택 가능 색상코드(hexcode + 영문색상명)
  *
  */
  getColors : function() {
    return [
      'pink',
      '#fff200',
      '#eeff00',
      '#ff8c00',
      '#00ffbb',
      '#ffd000',
      '#80ff00',
      '#bc63ff',
      'blue',
      'skyblue',
      'red',
      'gray',
      'orange',
      'green',
      '#9500ff',
    ];
  },
  /**
  * 스케줄 추가
  *
  * 시작일 종료일 형식 2021-06-02
  */
  add : async function(params) {
    const startDate = params.startDate.split(".");
    const startStamp = new Date(startDate[0], Number(startDate[1]) - 1, startDate[2]).getTime();

    const endDate = params.endDate.split(".");
    const endStamp = new Date(endDate[0], Number(endDate[1]) - 1, endDate[2]).getTime();

    const step = (60 * 60 * 24 * 1000);

    try {
      for (let i = startStamp; i <= endStamp; i += step) {
        //console.log(new Date(i));
        const sql = `INSERT INTO schedule (scheduleDate, title, color)
                                    VALUES(:scheduleDate, :title, :color)`;
        const replacements = {
          scheduleDate : new Date(i),
          title : params.title,
          color : params.color,
        };

        await sequelize.query(sql, {
          replacements,
          type:QueryTypes.INSERT,
        });
      }

      return true;
    } catch (err) {
      logger(err.message, 'error');
      logger(err.stack, 'error');

      return false;
    }
  },
  /**
  * 스케줄 조회
  *
  */
  get : async function(sdate, edate) {
    if (!sdate  || !edate)
      return false;

      const sql = `SELECT * FROM schedule WHERE scheduleDate BETWEEN ? AND ?`;
      const rows = await sequelize.query(sql, {
        replacements : [sdate, edate],
        type:QueryTypes.SELECT,
      });

      const list = {};
      // 날짜 - 색상 - 일정
      //      - 색상
      rows.forEach(async (v) => {
        //console.log(v);
        let scheduleDate = "S" + v.scheduleDate.replace(/-/g, "");
        list[scheduleDate][v.color] = list[scheduleDate][v.color] || [];
        list[scheduleDate][v.color].push(v);
      });
      console.log(list);
  },

};


module.exports = scheduler;
