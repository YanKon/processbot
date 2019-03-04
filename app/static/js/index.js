function submit_message(message) {
    $.post("/send_message", { message: text }, handle_response);
  
    function handle_response(data) {
      console.log(data);
      botui.message.bot({ // show bot message (now just Dialogflow Message)
      content: data.responseMessage
      })
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
  
        botui.message.human({ // show next message
          content: text
        })
      }
    });
  });
  