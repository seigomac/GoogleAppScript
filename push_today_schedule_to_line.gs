
//カレンダーの予定を定義
var calendar_name = PropertiesService.getScriptProperties().getProperty("calendar_name");
var weekday = ["日", "月", "火", "水", "木", "金", "土"];

// メインの処理


//Lineに送信する関数
function notifyTodayEvents() {
  
  //今日の予定をJSONで解析して,後続のcreateMessageに渡す。
  var todayEvents = JSON.parse(timetreeGetUpcomingEventsByName(calendar_name)).data;
  var message = "SeigoとMisakiの今日の予定だよ!\n\n" + createMessage(todayEvents);
  
  sendMessageToLine(message);
}

//TimeTreeから取得したtodayEventsから送信するメッセージを生成
function createMessage(events) {

  var message = '';
  var eventsSize = events.length;

  //予定がない場合
  if (eventsSize === 0) {
    return message += "予定はなしんご。。"
  }


  //予定がある場合
  events.forEach(function(event, index) {
    
    var response  = timetreeGetUser();
    var user_name = JSON.parse(response).data;
    console.log(user_name);
    console.log(user_name.attributes.name);
    
    var allDay = event.attributes.all_day; //終日
    var title = event.attributes.title; //予定
    var tmp_startAt = formatDate(new Date(event.attributes.start_at), allDay); //開始日時 mm/dd hh:mm
    var tmp_endAt = formatDate(new Date(event.attributes.end_at), allDay); //終了日時 mm/dd hh:mm
    //var user_detect = event.attributes.start_timezone; //誰の予定か
   
    var startAt = tmp_startAt.slice(-5); //開始時刻のみ hh:mm
    var endAt = tmp_endAt.slice(-5); //終了時刻のみ hh:mm

    title_time = startAt + "-" + endAt
    
    message += title_time + "\t" + title;

    //予定が0件になるまでループ
    if (index < eventsSize - 1) message += "\n";
  });

  var tmp_message_date = new Date();
  const message_date = tmp_message_date.getFullYear() + "年" + (tmp_message_date.getMonth() + 1)  + "月" + tmp_message_date.getDate() + "日";  
  
  to_send_message = '<' + message_date + "の予定" + '>'+ "\n" + message
  return to_send_message;
}

//終日かどうかで日付のフォーマットを決定
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
 console.log(user_name.attributes.name);
 return user_name.attributes.name;

 Logger.log(user_name.attributes.name); 
 // ユーザー取得メソッドをコール
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
