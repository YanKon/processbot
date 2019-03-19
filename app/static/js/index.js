//$("#live-chat").hide(0);

// Geht über alle Messages und gibt sie aus
// 1000 * index + 500 => gibt messages mit Verzögerung aus (abhängig von index größe)
function handle_messages(responseObject) {
  // Bot Messages ausgeben
  responseObject.messages.forEach(function(message, index) {
    setTimeout(function() {
      botui.message.bot({
        delay: 1000,
        loading: true,
        content: message
      });
    }, 1000 * index + 500);
  });
}

// blendet Buttons, falls vorhanden, ein
// erkennt button klick und führt Funktion aus
function handle_buttons(responseObject) {
  // Buttons? --> anzeigen & geklickter Button auslesen
  if (responseObject.buttons != []) {
    // TODO : Eingabe Feld ausblenden
    setTimeout(function() {
      botui.action
        .button({
          action: responseObject.buttons
        })
        .then(function(pressedButton) {
          // Wird ausgeführt, wenn ein Button geklickt wurde
          submit_button(
            responseObject.currentProcess,
            responseObject.currentProcessStep,
            responseObject.previousProcessStep,
            pressedButton.value
          );
        });
    }, 1000 * (responseObject.messages.length - 1) +
      responseObject.messages.length * 500);
  }
}

function highlightStep(responseObject) {
  console.log("highlight start");
  if (responseObject.currentProcessStep !== "")
    viewer.get("canvas").addMarker(responseObject.currentProcessStep, "highlight");

  if (responseObject.previousProcessStep !== "")
    viewer.get("canvas").addMarker(responseObject.previousProcessStep, "done");
    console.log("highlight end");
}

function submit_userText(userText) {
  $.post("/send_userText", { userText: userText }, handle_response);

  function handle_response(responseObject) {
        
        if (responseObject.currentProcess !== ""){
          // Model laden, wenn noch nicht geschehen
          if (!viewer.get("canvas").hasOwnProperty("_rootElement")){  // --> model noch nicht angezeigt
            console.log("BPMN Model is loading ...")
            // MODEL LADEN, dann warten, dann Highlighten
            loadBPMN(responseObject.currentProcess).then(function () {
              console.log("BPMN successfully imported")
              highlightStep(responseObject);
            })
            .catch(function(err) {
              console.error("could not import BPMN 2.0 diagram", err);
            });
          } else { // --> model schon angezeigt --> also direkt HIGHLIGHT
            highlightStep(responseObject);
          }
        } else { //currentProcess ist nicht gesetzt
          console.log("######### Anderer Intent als Process Run #########")
        }

        handle_messages(responseObject);
        handle_buttons(responseObject);

  }
}

// ResponseObject mitübergeben, damit klar ist, in welchem Prozessschritt man sich befindet
function submit_button(currentProcess, currentProcessStep, previousProcessStep, pressedButtonValue) {

  $.post(
    "/send_button",
    {
      pressedButtonValue: pressedButtonValue,
      currentProcess: currentProcess,
      previousProcessStep: previousProcessStep,
      currentProcessStep: currentProcessStep
    },
    handle_response
  );

  function handle_response(responseObject) {

    if (viewer.get("canvas").hasOwnProperty("_rootElement")){ // BPMN Model angezeigt
      if (responseObject.currentProcess !== "") // currentProcess ist gesetzt
        highlightStep(responseObject);
      else  // currentProcess nicht gesetzt --> dann lösche das Model raus (entweder Cancel oder Prozess durchlaufen)
        unloadBPMN();
    } 

    handle_messages(responseObject);
    handle_buttons(responseObject);

  }
}

// Leitet die Usereingaben ans Backend weiter
var userText;
$(document).ready(function() {

  $("#chat_send").click(function(e) {
    userText = $("#InputField").val();
    submit_userText(userText);
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
      $("#InputField").val("");

      // Zeigt den UserText im Chatfenster an
      botui.message.human({
        content: userText
      });
    }
  });
});

$(".chat-close").on("click", function(e) {
  e.preventDefault();
  $("#live-chat").fadeOut(300);
  $("#prime").fadeIn(300);
});

$("#prime").on("click", function(e) {
  e.preventDefault();
  $("#live-chat").fadeIn(300);
  $("#prime").hide(0);
});
