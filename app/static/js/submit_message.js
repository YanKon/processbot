function submit_message(message) {
  $.post("/send_message", { message: message }, handle_response);
  function handle_response(data) {
    console.log(data);
    data.responseMessage.forEach(message => {
      botui.message.bot({
        content: message
      });
    });
    if (data.hasOwnProperty("buttons")) {
      botui.action.button({
        action: data.buttons
      }).then(function (res) {
        submit_message(res.value);
      });
    }
  }
}
var text;
$(document).ready(function () {
  $('#InputField').keypress(function (e) {
    if (e.keyCode == 13) {
      text = $('#InputField').val();
      submit_message(text);
      console.log($('#InputField').val());
      $('#InputField').val("");
      botui.message.human({
        content: text
      });
    }
  });
});
