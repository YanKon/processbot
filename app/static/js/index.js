$('#live-chat').hide(0);

function submit_userText(userText) {
  $.post("/send_userText", { userText: userText }, handle_response);

  function handle_response(responseObject) {
    
    console.log("ResponseObject:")
    console.log(responseObject);

    if (responseObject.currentProcessStep !== "")
      viewer.get('canvas').addMarker(responseObject.currentProcessStep, 'highlight');
    
    if (responseObject.previousProcessStep !== "")
      viewer.get('canvas').addMarker(responseObject.previousProcessStep, 'done');
    

    // Bot Messages ausgeben
    responseObject.messages.forEach(function(message,index) {
      setTimeout(function(){
        botui.message.bot({
          delay: 1000,
          loading: true,
          content: message
        });
      },1000*index+500);
    });
    
    // Buttons? --> anzeigen & geklickter Button auslesen
    if (responseObject.buttons != []) {
      // TODO : Eingabe Feld ausblenden
      setTimeout(function(){
        botui.action
          .button({
            action: responseObject.buttons
          })
          .then(function(pressedButton) {
            // Wird ausgeführt, wenn ein Button geklickt wurde
            submit_button(responseObject.currentProcess, responseObject.currentProcessStep, responseObject.previousProcessStep, pressedButton.value);
          });
      },1000*(responseObject.messages.length-1)+responseObject.messages.length*500);
    }
  }
}

// ResponseObject mitübergeben, damit klar ist, in welchem Prozessschritt man sich befindet
function submit_button(currentProcess, currentProcessStep, previousProcessStep, pressedButtonValue) {
  console.log("currentProcess:")
  console.log(currentProcess)
  console.log("currentProcessStep:")
  console.log(currentProcessStep)
  console.log("previousProcessStep:")
  console.log(previousProcessStep)
  console.log("pressedButtonValue:")
  console.log(pressedButtonValue)


  $.post("/send_button", { pressedButtonValue: pressedButtonValue, currentProcess: currentProcess, previousProcessStep: previousProcessStep, currentProcessStep: currentProcessStep }, handle_response);

  function handle_response(responseObject) {
    console.log ("########## im handle Response von submitButton angekommen")
    console.log("ResponseObject:")
    console.log(responseObject);

    if (responseObject.currentProcessStep !== "")
      viewer.get('canvas').addMarker(responseObject.currentProcessStep, 'highlight');
    
    if (responseObject.previousProcessStep !== "")
      viewer.get('canvas').addMarker(responseObject.previousProcessStep, 'done');

    // Bot Messages ausgeben
    responseObject.messages.forEach(function(message,index) {
      setTimeout(function(){
        botui.message.bot({
          delay:1000,
          loading: true,
          content: message
        });
      },1000*index+500);
    });
  
    // Buttons? --> anzeigen & geklickter Button auslesen
    if (responseObject.buttons != []) {
      // TODO : Eingabe Feld ausblenden
      setTimeout(function(){
        botui.action
          .button({
            action: responseObject.buttons
          })
          .then(function(pressedButton) {
            // Wird ausgeführt, wenn ein Button geklickt wurde
            submit_button(responseObject.currentProcess, responseObject.currentProcessStep, responseObject.previousProcessStep, pressedButton.value);
          });
      },1000*(responseObject.messages.length-1)+responseObject.messages.length*500);
    }

  }

}


// Leitet die Usereingaben ans Backend weiter
var userText;
$(document).ready(function() {
  
  $("#chat_send").click(function(e) {
      userText = $("#InputField").val();
      submit_userText(userText);
      console.log($("#InputField").val());
      $("#InputField").val("");

        // Zeigt den UserText im Chatfenster an
      botui.message.human({
        content: userText
      });
  });
  
  $("#InputField").keypress(function(e) {
    if (e.keyCode == 13) {
      userText = $("#InputField").val();
      submit_userText(userText);
      console.log($("#InputField").val());
      $("#InputField").val("");

      // Zeigt den UserText im Chatfenster an
      botui.message.human({
        content: userText
      });
    }
  });
});



	$('.chat-close').on('click', function(e) {

		e.preventDefault();
    $('#live-chat').fadeOut(300);
    $('#prime').fadeIn(300);

	});


$('#prime').on('click', function(e) {
  e.preventDefault();
  $('#live-chat').fadeIn(300);
  $('#prime').hide(0);

});
