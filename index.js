var express = require("express");
var app = express();
var server = require("http").createServer(app);
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var dateFormat = require("dateformat");
var JsonDB = require("node-json-db");
var fs = require("fs");
const jsonFileName = "lessons.json";
const jsonFileClass = "classes.json";
app.set("views", "./");
app.set("view engine", "ejs");

server.listen(process.env.PORT || 3000, function() {
  console.log("server is listening on port 3000");
});

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(bodyParser.json());

app.post("/news", function(req, res) {
  var class_room_name = req.body.class_room_name;
  console.log(class_room_name);
  var classes = require("./classes.json").classes;
  classes.forEach(classRoom => {
    console.log(classRoom.jugyoCd);
    if (classRoom.jugyoCd === class_room_name) {
      res.send({
        status: 200,
        message: "Success",
        data: classRoom
      });
    }
  });
});

app.post("/attendance", function(req, res) {
  var user_id = req.body.user_id;
  var code = req.body.code;
  var class_id = req.body.class_id;
  var beacon_uuid = req.body.beacon_uuid;

  // console.log("code: " + code + " - beacon uuid: " + beacon_uuid);

  if (compareCode(code, class_id)) {
    res.set("Content-Type", "application/json");
    res.send({
      status: 200,
      message: "Success",
      data: {
        request_time: getCurrentTime()
      }
    });
  } else {
    res.set("Content-Type", "application/json");
    res.send({
      status: 404,
      message: "Code not found",
      data: {}
    });
  }
});

function compareCode(code, class_id) {
  let isEqual;
  var classes = require("./classes.json").classes;
  for (var i = 0; i < classes.length; i++) {
    if (
      code === classes[i].attendance_code &&
      class_id === classes[i].jugyoCd
    ) {
      isEqual = true;
      break;
    } else {
      isEqual = false;
    }
  }
  return isEqual;
}

function getCurrentTime() {
  let date_ob = dateFormat(new Date(), "yyyy/mm/dd HH:mm:ss");

  return date_ob;
}

app.get("/getLessons", function(req, res) {
  // var obj = JSON.parse(fs.readFileSync(jsonFileName, "utf8"));
  var lessons = require("./lessons.json").jgkmInfo;
  // res.end(200);
  res.send({
    result: true,
    displayMessage: "",
    authResult: true,
    jgkmInfo: lessons,
    gakkiInfo: {
      gakkiName: "前期",
      gakkiNo: 1,
      nendo: 2016
    },
    serviceName: "AppGetJkwrService"
  });
});
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
var jugyoCd = getRandomInt(10000, 99999);
app.post("/addClass", urlencodedParser, function(req, res) {
  response = req.body;

  let db = new JsonDB(jsonFileName, true, false);
  db.push(
    jsonFileName + "/jgkmInfo[]",
    {
      jugyoName: response.jugyoName,
      kaikoYobi: parseInt(response.kaikoYobi),
      kyostName: response.kyostName,
      jugyoCd: jugyoCd + "",
      gakkiNo: 1,
      kyoinName: response.kyoinName,
      jigenNo: parseInt(response.jigenNo),
      jugyoKbn: "1",
      kaikoNendo: 2016,
      jugyoEndTime: response.jugyoEndTime,
      jugyoStartTime: response.jugyoStartTime,
      attendanceStartTime: response.attendanceStartTime,
      attendanceEndTime: response.attendanceEndTime,
      follow_up_test: 1,
      keijiInfo: {
        midokCnt: 0
      },
      nendo: 2016
    },
    true
  );

  let dbClass = new JsonDB(jsonFileClass, true, false);
  dbClass.push(
    jsonFileClass + "/classes[]",
    {
      jugyoCd: jugyoCd + "",
      attendance_code: response.AttendanceCode
    },
    true
  );

  res.redirect(req.get("referer"));
});

app.get("/addclass", function(req, res) {
  let lessons = require("./lessons.json").jgkmInfo;
  res.render("index.ejs", { lesson: lessons });
});

app.get("/removeClass", function(req, res) {
  let jugyoCd = req.query.jugyoCd;
  let lessons = require("./lessons.json");
  let classes = require("./classes.json");
  let index = lessons.jgkmInfo.findIndex(a => a.jugyoCd === jugyoCd);
  let index2 = classes.classes.findIndex(a => a.jugyoCd === jugyoCd);
  if (index > -1) {
    lessons.jgkmInfo.splice(index, 1);
  }
  if (index2 > -1) {
    classes.classes.splice(index2, 1);
  }

  let data = JSON.stringify(lessons, null, 2);
  let data2 = JSON.stringify(classes, null, 2);
  fs.writeFileSync("./lessons.json", data);
  fs.writeFileSync("./classes.json", data2);
  console.log(jugyoCd);
  res.redirect(req.get("referer"));
});

app.get("/", function(req, res) {
  let lessons = require("./lessons.json").jgkmInfo;
  res.render("index.ejs", { lesson: lessons });
});
/*
,
    {
      "jugyoName": "物理",
      "kaikoYobi": 1,
      "kyostName": "B102教室",
      "jugyoCd": "15341",
      "gakkiNo": 1,
      "kyoinName": "高崎",
      "jigenNo": 3,
      "jugyoKbn": "1",
      "kaikoNendo": 2016,
      "jugyoEndTime": "14:40",
      "jugyoStartTime": "13:10",
      "follow_up_test": 1,
      "attendanceStartTime": "13:10",
      "attendanceEndTime": "13:20",
      "keijiInfo": {
        "midokCnt": 0
      },
      "nendo": 2016
    },
    {
      "jugyoName": "英語",
      "kaikoYobi": 3,
      "kyostName": "B103教室",
      "jugyoCd": "15343",
      "gakkiNo": 1,
      "kyoinName": "山本",
      "jigenNo": 4,
      "jugyoKbn": "1",
      "kaikoNendo": 2016,
      "jugyoEndTime": "19:40",
      "jugyoStartTime": "18:10",
      "follow_up_test": 1,
      "attendanceStartTime": "18:10",
      "attendanceEndTime": "18:20",
      "keijiInfo": {
        "midokCnt": 0
      },
      "nendo": 2016
    }
*/
