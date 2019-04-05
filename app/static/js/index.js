//$("#live-chat").hide(0);

// BESCHREIBUNG
function handle_model(responseObject) {
 
  if (responseObject.currentProcess !== "") { // CurrentProcess ist gesetzt
    if(!viewer.get("canvas").hasOwnProperty("_rootElement")) { // --> model noch nicht angezeigt)
      loadBPMN(responseObject.currentProcess, viewer).then(function () { // MODEL LADEN, dann warten, dann Highlighten
        highlightStep(responseObject);
      })
      .catch(function(err) {
        console.error("could not import BPMN 2.0 diagram", err);
      });
    } 
    else // --> model schon angezeigt --> also direkt HIGHLIGHT
      highlightStep(responseObject);
  } 
  else { // CurrentProcess ist nicht gesetzt
    if(viewer.get("canvas").hasOwnProperty("_rootElement")) // --> model ist angezeigt)
      unloadBPMN();;
  }
}

// BESCHREIBUNG
function showOverlays(processStep) {
  var instruction = elementRegistry.get(processStep).businessObject.get("chatbot:instruction");
  var detailInstruction = elementRegistry.get(processStep).businessObject.get("chatbot:detailInstruction");

  var $overlayHtml =
    $('<div class="arrow_box_highlight">' +
        '<p class="pheader1">general instruction</p>' +
        '<div class="node-instruction-current">' + instruction + '</div>' +
        '<p class="pheader2">detail instruction</p>' +
        '<div class="node-instruction-current">' + detailInstruction + '</div>' +
      '</div>').css({
        width: elementRegistry.get(processStep).width * 2,
      });

  overlays.add(processStep, 'note', {
    position: {
      bottom: -7,
      left: -(elementRegistry.get(processStep).width / 2)
    },
    html: $overlayHtml
  });
}

// BESCHREIBUNG
function hideOverlays(processStep) {
  overlays.remove({ element: processStep });
}

var lastHighlighted = "";
function highlightStep(responseObject) {
  if (responseObject.currentProcessStep !== "") {
    if (lastHighlighted !== ""){
      viewer.get("canvas").removeMarker(lastHighlighted, "highlight");
      hideOverlays(lastHighlighted)

    } 
    viewer.get("canvas").addMarker(responseObject.currentProcessStep, "highlight");
    lastHighlighted = responseObject.currentProcessStep;
    showOverlays(responseObject.currentProcessStep);
  }

  if (responseObject.previousProcessStep !== "") {
    viewer.get("canvas").addMarker(responseObject.previousProcessStep, "done");
  }

}

// BESCHREIBUNG
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

// BESCHREIBUNG
// blendet Buttons, falls vorhanden, ein
// erkennt button klick und führt Funktion aus
function handle_buttons(responseObject) {
  // Buttons? --> anzeigen & geklickter Button auslesen

  //  geändert zu length ungleich 0, weil er bei != [] trotz leerer Liste reingegangen ist
  if (responseObject.buttons.length != 0) {
    deactivateInput();
    setTimeout(function() {
      botui.action
        .button({
          action: responseObject.buttons,
          delay: 1000
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
  else 
    reactivateInput();
}

// BESCHREIBUNG
function submit_userText(userText) {
  $.post("/send_userText", 
    { 
     userText: userText 
    }, 
    handle_response
  );

  function handle_response(responseObject) {
        
    handle_model(responseObject);
    handle_messages(responseObject);
    handle_buttons(responseObject);

  }
}

// BESCHREIBUNG
// ResponseObject mitübergeben, damit klar ist, in welchem Prozessschritt man sich befindet
function submit_button(currentProcess, currentProcessStep, previousProcessStep, pressedButtonValue) {

  $.post("/send_button",
    {
      pressedButtonValue: pressedButtonValue,
      currentProcess: currentProcess,
      previousProcessStep: previousProcessStep,
      currentProcessStep: currentProcessStep
    },
    handle_response
  );

  function handle_response(responseObject) {

    handle_model(responseObject);
    handle_messages(responseObject);
    handle_buttons(responseObject);

  }
};

// BESCHREIBUNG
function reactivateInput() {
  $("#InputField").removeAttr("disabled");  // unclickable
  $("#InputField").removeClass("InputField-inactive");
  $("#chat_send").removeClass("disable-me");  // unclickable
};

// BESCHREIBUNG
function deactivateInput() {
  $("#InputField").attr("disabled", "disabled");  // unclickable
  $("#InputField").addClass("InputField-inactive");
  $("#chat_send").addClass("disable-me");  // unclickable
};

// holt sich alle Prozesse dich sich verändert haben und gibt notification aus
// gibt aber die Notification nur aus, wenn sie nicht schonmal ausgegeben wurde => toastedProcesses
// TODO: wenn button für die ABfrage geklickt wird (also nicht automatisch abgefragt wird) muss alle Ausgaben nochmal ausgegeben werden
var toastedProcesses = [];
var uptodateProcesses = false;

// BESCHREIBUNG
function threadingBPMN() {
  // Warumm $SCRIPT_ROOT ? (siehe http://flask.pocoo.org/docs/0.12/patterns/jquery/)
  $.post($SCRIPT_ROOT + '/get_status_bpmnDir', function (data) {
    console.log(data)
    // if (data.imports.length === 0 && data.updates.length === 0 && !uptodateProcesses) {
    //   uptodateProcesses = true;
    //   $.toast({
    //     title: 'No processes changed!',
    //     // subtitle: '11 mins ago', // könnte man noch berechnen!!!!
    //     content: 'All processes are up-to-date.',
    //     type: 'success',
    //     delay: '5000'
    //   });
    // }
    if (data.updates.length !== 0) {
      $("#updatesBadge").html(data.updates.length)
      data.updates.forEach(function (process) {
        if (!toastedProcesses.includes(process)) {
          $.toast({
            title: 'Process changed!',
            // subtitle: '11 mins ago', // könnte man noch berechnen!!!!
            content: 'The process <b id="processName">' + process + '</b> has updates.',
            type: 'info',
            delay: '5000'
          });
          toastedProcesses.push(process);

          $("#updateDropdown").append(
            '<div class="row" style="margin: 5px 10px 0 10px; border-top: 1px solid #eee; padding-top: 5px;">' +
            '<div class="col-8" style="margin-left: 3px">' +
            '<a class="align-middle">' + process + '</a>' +
            '</div>' +
            '<div class="col-4 text-center" style="margin-right: -3px">' +
            '<button class="btn btn-sm btn-success" id="' + process + '" onclick="bpmnUpdate(event)" type="submit">Update</button>' +
            '</div>' +
            '</div>'
          )
        }
      });
    }

    if (data.imports.length !== 0) {
      $("#importBadge").html(data.imports.length)
      data.imports.forEach(function (process) {
        if (!toastedProcesses.includes(process)) {
          $.toast({
            title: 'New process!',
            // subtitle: '11 mins ago', // könnte man noch berechnen!!!!
            content: 'You can now import the process <b id="processName">' + process + '</b>.',
            type: 'info',
            delay: '5000'
          });
          toastedProcesses.push(process);

          $("#importDropdown").append(
            '<div class="row" id="' + process.replace(/\s+/g, '') + '_row" style="margin: 5px 10px 0 10px; border-top: 1px solid #eee; padding-top: 5px;">' +
            '<div class="col-8" style="margin-left: 3px">' +
            '<a class="align-middle">' + process + '</a>' +
            '</div>' +
            '<div class="col-4 text-center" style="margin-right: -3px">' +
            '<button class="btn btn-sm btn-success" id="' + process + '" onclick="bpmnImport(event)" type="submit">Import</button>' +
            '</div>' +
            '</div>'
          )
        }
      });
    }
  });
}

// BESCHREIBUNG
$(document).ready(function() {

  // BESCHREIBUNG
  threadingBPMN();

  // BESCHREIBUNG
  function handleUserInput() {
    var userText = $("#InputField").val();

    if (userText !== "") {
      submit_userText(userText);
      $("#InputField").val("");
      // Zeigt den UserText im Chatfenster an
      botui.message.human({
        content: userText
      });
    }
  }

  // BESCHREIBUNG
  $("#chat_send").click(function(e) {
    handleUserInput();
  });

  // BESCHREIBUNG
  $("#InputField").keypress(function(e) {
    if (e.keyCode == 13)
      handleUserInput();
  });

  // BESCHREIBUNG
  $(".chat-close").on("click", function(e) {
    e.preventDefault();
    $("#live-chat").fadeOut(300);
    $("#prime").fadeIn(300);
  });
  
  // BESCHREIBUNG
  $("#prime").on("click", function(e) {
    e.preventDefault();
    $("#live-chat").fadeIn(300);
    $("#prime").hide(0);
  });  

  
  // soll nachher in dialog.js und für jeden intent eigene funktion 
  $('#toggleScreenOverlay').click(function(e) {
    var html;
    $.ajax({
      url: "/static/resources/svg/pizza.svg",
      success: function(data) {
        html = new XMLSerializer().serializeToString(data.documentElement);
        createDialogOverlay('Pizza.bpmn',html);
      },
      async: false // <- this turns it into synchronous
    });

    // BEISPIEL WAS DER BOT KANN OVERLAY

    // var html = 
    //   '<p style="text-align:left; border-bottom: 1px solid LightGrey; font-weight:bold;">Process</p>' +
    //   '<p>"run process Reisekosten"</p>' +
    //   '<p>"which processes?"</p>' +
    //   '</br>' +
    //   '<p style="text-align:left; border-bottom: 1px solid LightGrey; font-weight:bold;">Task</p>' +
    //   '<p>"Ask 1"</p>' 
    // createDialogOverlay('For example, you could ask me the following:',html)
  });

  // BESCHREIBUNG
  setInterval(function() {
    threadingBPMN();
  }, 10000);

  // BESCHREIBUNG => EIGENE FUNKTION NOCH SCHREIBEN
  $.post($SCRIPT_ROOT + '/get_all_processes', function(data) {
    console.log(data)
    if (data.length !== 0) {
      data.forEach(function(process) {
        $("#deleteDropdown").prepend(
          '<div class="row" style="margin: 0 10px 0 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">' +
          '<div class="col-8">' +
            '<a class="align-middle">' + process + '</a>' +
          '</div>' +
          '<div class="col-4 text-center">' +
            '<button class="btn btn-sm btn-danger" id="' + process + '" onclick="bpmnDelete(event)" type="submit">Delete</button>' +
          '</div>' +
        '</div>'
        )
      })
    }
  });


});

// BESCHREIBUNG
function popoverInput() {
  $('[data-toggle="tooltip"]').tooltip({ animation: true })
  if ($("#InputField").hasClass("InputField-inactive"))
    $('[data-toggle="tooltip"]').tooltip('enable');
  else 
    $('[data-toggle="tooltip"]').tooltip('disable');
}

// BESCHREIBUNG
$(".botui-messages-container").on("click",".botui-message", function(e){
  var processList = e.target.src.split("/");
  var processName = processList[processList.length-1].split(".")[0];
  
  var html = '<div id="bpmnCanvasOverlay" style="height:95%"></div>'
  createDialogOverlay(processName,html);
  var bpmnViewerOverlay = new BpmnJS({ container: "#bpmnCanvasOverlay" });
  $("#overlaySwitch").click();
  loadBPMN(processName, bpmnViewerOverlay);

  // AKTION DIE BEIM SCHLIESSEN DES OVERLAYS AUSGEFÜHRT WERDEN
  $('.fa-times').click(function() {
    $("#overlaySwitch").click();
  });

  // BEISPIEL FÜR SVG LADEN
  // $.ajax({
  //   url: "/static/resources/svg/"+processName+".svg",
  //   success: function(data) {
  //     html = new XMLSerializer().serializeToString(data.documentElement);
  //     createDialogOverlay(processName+'.svg',html);
  //   },
  //   async: true // <- this turns it into synchronous
  // });

});

// BESCHREIBUNG
function bpmnDelete(e) {
  $.post($SCRIPT_ROOT + '/delete_database_select', 
    { 
      processName: e.target.id 
    },
    handle_response
    );
  
    function handle_response(message) {
      $.toast({
        title: 'Processes deleted!',
        // subtitle: '11 mins ago', // könnte man noch berechnen!!!!
        content: "Successfully delete process: " + message,
        type: 'success',
        delay: '5000'
      });
    }
};  

// BESCHREIBUNG
function bpmnDeleteAll() {
  $.post($SCRIPT_ROOT + '/delete_database_all',
    handle_response
  );
  
  function handle_response(message) {
    $.toast({
      title: 'Processes deleted!',
      // subtitle: '11 mins ago', // könnte man noch berechnen!!!!
      content: "Successfully delete all processes.",
      type: 'success',
      delay: '5000'
    });
  }
};


// BESCHREIBUNG
function bpmnImport(e) {  
  
  $.post($SCRIPT_ROOT + '/import_process',
    { 
      processName: e.target.id 
    },
    handle_response
  );

  function handle_response(message) {
    $.toast({
      title: 'Process imported!',
      // subtitle: '11 mins ago', // könnte man noch berechnen!!!!
      content: "Successfully import the process:" + message,
      type: 'success',
      delay: '5000'
    });

    $("#" + e.target.id.replace(/\s+/g, '') + "_row").remove();
    $("#importBadge").html(parseInt($("#importBadge").html()) - 1)
  }
}