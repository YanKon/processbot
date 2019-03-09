function submit_userText(userText) {
  $.post("/send_userText", { userText: userText }, handle_response);

  function handle_response(responseObject) {
    
    console.log("ResponseObject:")
    console.log(responseObject);

    // Bot Messages ausgeben
    responseObject.messages.forEach(message => {
      botui.message.bot({
        content: message
      });
    });
  
    // Buttons? --> anzeigen & geklickter Button auslesen
    if (responseObject.buttons != []) {
      // TODO : Eingabe Feld ausblenden
      botui.action
        .button({
          action: responseObject.buttons
        })
        .then(function(pressedButton) {
          // Wird ausgeführt, wenn ein Button geklickt wurde
          submit_button(responseObject.currentProcess, responseObject.currentProcessStep, pressedButton.value);
        });
    }
  }
}

// ResponseObject mitübergeben, damit klar ist, in welchem Prozessschritt man sich befindet
function submit_button(currentProcess, currentProcessStep, pressedButtonValue) {
  console.log("currentProcess:")
  console.log(currentProcess)
  console.log("currentProcessStep:")
  console.log(currentProcessStep)
  console.log("pressedButtonValue:")
  console.log(pressedButtonValue)

  $.post("/send_button", { pressedButtonValue: pressedButtonValue, currentProcess: currentProcess, currentProcessStep: currentProcessStep }, handle_response);

  function handle_response(responseObject) {
    console.log ("########## im handle Response von submitButton angekommen")
    console.log("ResponseObject:")
    console.log(responseObject);

    // Bot Messages ausgeben
    responseObject.messages.forEach(message => {
      botui.message.bot({
        content: message
      });
    });
  
    // Buttons? --> anzeigen & geklickter Button auslesen
    if (responseObject.buttons != []) {
      // TODO : Eingabe Feld ausblenden
      botui.action
        .button({
          action: responseObject.buttons
        })
        .then(function(pressedButton) {
          // Wird ausgeführt, wenn ein Button geklickt wurde
          submit_button(responseObject.currentProcess, responseObject.currentProcessStep, pressedButton.value);
        });
    }
  }
}


// Leitet die Usereingaben ans Backend weiter
var userText;
$(document).ready(function() {
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
