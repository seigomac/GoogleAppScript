function myFunction() {
  var now = new Date();
  const date2 = now.getFullYear() + "年" + 
      (now.getMonth() + 1)  + "月" + 
      now.getDate() + "日";  
  console.log(date2);
}
