function submit_message(message) {
    $.post("/send_message", { message: text }, handle_response);
  
    function handle_response(data) {
      console.log(data);

      data.responseMessage.forEach(message => {
        botui.message.bot({ // show bot message (now just Dialogflow Message)
          content: message
        })
      });
      
      if (data.hasOwnProperty("buttons")) {
        botui.action.button({
          action: data.buttons
        }).then(function (res) { // will be called when a button is clicked.
          $("#InputField").prop('disabled', false);
          submit_message(res.value);
        });
      }

      // deaktiviert das Inputfeld
      // $("#InputField").prop('disabled', true);
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
  
  