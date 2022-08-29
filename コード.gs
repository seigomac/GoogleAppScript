//var timetree_personal_access_token = "CRR0tUo9vmxNNrMYlSZ4NPCnKi31K8Y7qrLL6BOgXWAnNJYt";
//var line_notify_access_token = "5DpLkqpXEGlIE1QyqtjFCTIGc7LT2ClXyBV3nR5Pt2p";
var calendar_name = PropertiesService.getScriptProperties().getProperty("calendar_name");
var weekday = ["日", "月", "火", "水", "木", "金", "土"];

// メインの処理


function notifyTodayEvents() {
  var todayEvents = JSON.parse(timetreeGetUpcomingEventsByName(calendar_name)).data;
  var message = "SeigoとMisakiの今日の予定だよ!\n\n" + createMessage(todayEvents);
  
  /*if (GetUserName() == 'せいちゃん'){
    var message = "SeigoとMisakiの今日の予定だよ!\n\n" + createMessage(todayEvents);
  }else{
    var message = "Misakiの今日の予定だよ!\n\n" + createMessage(todayEvents);
  }*/

  sendMessageToLine(message);
}

function createMessage(events) {
  var message = '';
  var eventsSize = events.length;

  if (eventsSize === 0) {
    return message += "予定はないよ"
  }

  events.forEach(function(event, index) {
    var allDay = event.attributes.all_day;
    var title = event.attributes.title;
    var startAt = formatDate(new Date(event.attributes.start_at), allDay);
    var endAt = formatDate(new Date(event.attributes.end_at), allDay);

    message += '■' +startAt + ' - ' + endAt + "\n" + "\t" + '・'　+ title;
    

    if (index < eventsSize - 1) message += "\n\n";
  });

  return message;
}

function formatDate(date, allDay) {
  if (allDay) {
    return Utilities.formatDate(date, 'JST', 'MM/dd(' + weekday[date.getDay()] + ')');
  } else {
    return Utilities.formatDate(date, 'JST', 'MM/dd(' + weekday[date.getDay()] + ') HH:mm');
  }
}

// TimeTree用の処理
 
  //ユーザ情報取得
function GetUserName(){
 var response  = timetreeGetUser();
 var user_name = JSON.parse(response).data;
 return user_name.attributes.name;

 Logger.log(user_name.attributes.name); // ユーザー取得メソッドをコール
}

 //ユーザ名取得する関数
function timetreeGetUser(){
 var url = 'https://timetreeapis.com/user';
 var method = 'GET';
 var payload = '';
 return timetreeAPI(url, method, payload); // TimeTree APIをコール
}

function timetreeGetUpcomingEventsByName(name) {
  var id = timetreeGetCalendarIdByName(name);
  return timetreeGetUpcomingEvents(id);
}

function timetreeGetUpcomingEvents(id) {
  var url = 'https://timetreeapis.com/calendars/' + id + '/upcoming_events?timezone=Asia/Tokyo';
  var method = 'GET'; 
  var payload = '';
  return timetreeAPI(url, method, payload);
}

function timetreeGetCalendars() {
  var url = 'https://timetreeapis.com/calendars';
  var method = 'GET';
  var payload = '';
  return timetreeAPI(url, method, payload);
}

function timetreeGetCalendarIdByName(name) {
  var response = timetreeGetCalendars();
  var calendars = JSON.parse(response).data;

  var calendar = calendars.filter(function(data){
    return data.attributes.name.toString() === name;
  });
  return calendar[0].id;
}

function timetreeAPI(url, method, payload) {
  var accessToken = PropertiesService.getScriptProperties().getProperty('timetree_personal_access_token');
  //var accessToken = PropertiesService.getScriptProperties().getProperty('75izNFdM16vphG9IlkRvgLazvukFy7RBKGIpfFAiVq0wmKxM');
  var headers = {
    'Authorization': 'Bearer '+ accessToken
  };
  var options = {
    'method': method,
    'headers': headers,
    'payload': payload
  };

  return UrlFetchApp.fetch(url, options);
}

// LINE Notify用の処理
function sendMessageToLine(message) {
  var url = 'https://notify-api.line.me/api/notify';
  var payload = "message=" + message;
  lineNotifyAPI(url, 'post', payload);
}

function lineNotifyAPI(url, method, payload){
  var accessToken = PropertiesService.getScriptProperties().getProperty('line_notify_access_token');
  var headers = {
   'Authorization': 'Bearer '+ accessToken
  };
  var options = {
     "method": method,
     "headers": headers,
     "payload": payload
  };

  return UrlFetchApp.fetch(url, options);
}
