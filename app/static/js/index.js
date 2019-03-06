function submit_message(message) {
  $.post("/send_message", { message: message }, handle_response);

  function handle_response(data) {
    console.log(data);

    data.messages.forEach(message => {
      botui.message.bot({
        // show bot message (now just Dialogflow Message)
        content: message
      });
    });

    if (data.hasOwnProperty("buttons")) {
      botui.action
        .button({
          action: data.buttons
        })
        .then(function(res) {
          // will be called when a button is clicked.
          console.log(res.value);
          submit_message(res.value);
        });
    }
  }
}

var userText;
$(document).ready(function() {
  $("#InputField").keypress(function(e) {
    if (e.keyCode == 13) {
      userText = $("#InputField").val();
      submit_message(userText);
      console.log($("#InputField").val());
      $("#InputField").val("");

      botui.message.human({
        // show next message
        content: userText
      });
    }
  });
});
