var toastedProcesses = [];
var setImportProcesses = [];
var setUpdateProcesses = [];
var setDeleteProcesses = [];
var loadedProcessModel = "";

// BESCHREIBUNG
function handle_model(responseObject) {
  if (responseObject.currentProcessName !== "") { // CurrentProcess ist gesetzt
    if (loadedProcessModel != "" && loadedProcessModel != responseObject.currentProcessName) { // model ist geladen und das geladene ist ein anderes als ich anzeigen will
      unloadBPMN();
      loadedProcessModel = "";
      loadBPMN(responseObject.currentProcessName).then(function () { // MODEL LADEN, dann warten, dann Highlighten
        loadedProcessModel = responseObject.currentProcessName;
        highlightStep(responseObject);
      })
      .catch(function(err) {
        console.error("could not import BPMN 2.0 diagram", err);
      });
    }

    else if(!viewer.get("canvas").hasOwnProperty("_rootElement")) { // --> model noch nicht angezeigt)
      loadBPMN(responseObject.currentProcessName).then(function () { // MODEL LADEN, dann warten, dann Highlighten
        loadedProcessModel = responseObject.currentProcessName;
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
      unloadBPMN(viewer);
      loadedProcessModel = "";
  }
}

// BESCHREIBUNG
function showOverlays(processStep) {

  // prüft ob die Overlays angezeigt werden sollen
  if ($("#overlaySwitch").prop('checked')) 
    display = "";
  else 
    display = " hidden";

  var instruction = elementRegistry.get(processStep).businessObject.get("chatbot:instruction");
  var detailInstruction = elementRegistry.get(processStep).businessObject.get("chatbot:detailInstruction");

  // ist type ungleich Task
  if (instruction === undefined) {
    var splitQuestion = elementRegistry.get(processStep).businessObject.get("chatbot:splitQuestion");
    if (splitQuestion === undefined)
      return;
    else {
      var $overlayHtml =
      $('<div class="arrow_box_highlight' + display + '">' +
        '<p class="pheader1">split question</p>' +
        '<div class="node-instruction-current">' + splitQuestion + '</div>' +
        '</div>').css({
          width: elementRegistry.get(processStep).width * 2,
        });
    }
  }
  else {
    var $overlayHtml =
    $('<div class="arrow_box_highlight' + display + '">' +
      '<p class="pheader1">general instruction</p>' +
      '<div class="node-instruction-current">' + instruction + '</div>' +
      '<p class="pheader2">detail instruction</p>' +
      '<div class="node-instruction-current">' + detailInstruction + '</div>' +
      '</div>').css({
        width: elementRegistry.get(processStep).width * 2,
    });
  }

  overlays.add(processStep, 'note', {
    position: {
      bottom: -7,
      left: -(elementRegistry.get(processStep).width / 2)
    },
    html: $overlayHtml
  });
}

// Entfernt an dem aktuellen Step das Overlay
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
    // removeMarker "done" falls Node nochmal besucht wird
    viewer.get("canvas").removeMarker(responseObject.currentProcessStep, "done");
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
            responseObject.currentProcessName,
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
function submit_button(currentProcess, currentProcessName, currentProcessStep, previousProcessStep, pressedButtonValue) {

  $.post("/send_button",
    {
      pressedButtonValue: pressedButtonValue,
      currentProcess: currentProcess,
      currentProcessName: currentProcessName,
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

// Reaktiviert das Inputfeld des Chatfensters => Usereingaben sind dann wieder möglich 
function reactivateInput() {
  $("#InputField").removeAttr("disabled");  // unclickable
  $("#InputField").removeClass("InputField-inactive");
  $("#chat_send").removeClass("disable-me");  // unclickable
};

// Deaktiviert das Inputfeld des Chatfensters => Usereingaben sind nicht möglich
function deactivateInput() {
  $("#InputField").attr("disabled", "disabled");  // unclickable
  $("#InputField").addClass("InputField-inactive");
  $("#chat_send").addClass("disable-me");  // unclickable
};

// holt sich alle Prozesse dich sich verändert haben und gibt notification aus
// gibt aber die Notification nur aus, wenn sie nicht schonmal ausgegeben wurde => toastedProcesses
var uptodateProcesses = false;

// BESCHREIBUNG
function threadingBPMN() {
  // Warumm $SCRIPT_ROOT ? (siehe http://flask.pocoo.org/docs/0.12/patterns/jquery/)
  $.post($SCRIPT_ROOT + '/get_status_bpmnDir', function (data) {
    
    if (data.updates.length !== 0) {

      $("#updateBadge").html(data.updates.length)
      $("#updateAllButton").removeClass("hidden");
      $("#updateDropdownText").addClass("hidden");

      data.updates.forEach(function (process) {
        if (!setUpdateProcesses.includes(process)) {
          $.toast({
            title: 'Process changed!',
            // subtitle: '11 mins ago', // könnte man noch berechnen!!!!
            content: 'The process <b id="processName">' + process + '</b> has updates.',
            type: 'info',
            delay: '5000'
          });
          setUpdateProcesses.push(process);

          $("#dropdown-menu-proceses-update").append(
            '<div class="row h-100" id="' + process.replace(/\s+/g, '') + '_row_update" style="margin: 5px 10px 6px 10px; border-bottom: 1px solid #eee; padding: 5px 0 10px 0;">' +
            '<div class="col-8"' +
            '<a class="align-middle">' + process + '</a>' +
            '</div>' +
            '<div class="col-4 text-center" style="margin-top: auto;margin-bottom: auto;">' +
            '<button class="btn btn-sm btn-success" id="' + process + '" onclick="bpmnUpdate(event)" type="submit">Update</button>' +
            '</div>' +
            '</div>'
          )
        }
      });
    }

    if (data.imports.length !== 0) {

      $("#importBadge").html(data.imports.length)
      $("#importAllButton").removeClass("hidden");
      $("#importDropdownText").addClass("hidden");

      data.imports.forEach(function (process) {
        if (!toastedProcesses.includes(process) && !setImportProcesses.includes(process)){
          $.toast({
            title: 'New process!',
            // subtitle: '11 mins ago', // könnte man noch berechnen!!!!
            content: 'You can now import the process <b id="processName">' + process + '</b>.',
            type: 'info',
            delay: '5000'
          });
          toastedProcesses.push(process);
          setImportProcesses.push(process);

          $("#dropdown-menu-proceses-import").append(
            '<div class="row h-100" id="' + process.replace(/\s+/g, '') + '_row_import" style="margin: 5px 10px 6px 10px; border-bottom: 1px solid #eee; padding: 5px 0 10px 0;">' +
            '<div class="col-8">' +
            '<a class="align-middle">' + process + '</a>' +
            '</div>' +
            '<div class="col-4 text-center" style="margin-top: auto;margin-bottom: auto;">' +
            '<button class="btn btn-sm btn-info" id="' + process + '" onclick="bpmnImport(event)" type="submit">Import</button>' +
            '</div>' +
            '</div>'
          )
        }
      });
    }

    else {
      $("#importBadge").html("")
      $("#importAllButton").addClass("hidden");
      $("#importDropdownText").removeClass("hidden");
    }
  });
}

// BESCHREIBUNG
$(document).ready(function() {

  // BESCHREIBUNG
  threadingBPMN();
  setDeleteDropwdown();

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
  if (e.target.src !== undefined) {
    var processList = e.target.src.split("/");
    var processName = processList[processList.length-1].split(".")[0];
    processName = processName.replace(/%20/g," ");
    
    var html = '<div id="bpmnCanvasOverlay" style="height:95%"></div>'
    createDialogOverlay(processName,html);
    var bpmnViewerOverlay = new BpmnJS({ container: "#bpmnCanvasOverlay" });
  
    if (!$("#overlaySwitch").prop('checked')) 
      $("#overlaySwitch").click();

    loadSecondBPMN(processName, bpmnViewerOverlay);

    // AKTION DIE BEIM SCHLIESSEN DES OVERLAYS AUSGEFÜHRT WERDEN
    $('.fa-times').click(function() {
      $("#overlaySwitch").click();
    });
  }

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

// **************************************************************************
// ************* handle_functions für import, update und delete ************* 
// **************************************************************************

// BESCHREIBUNG
function handle_response_select(response) {
  $('#' + response.source + 'Spinner').addClass("hidden");

  $.toast({
    title: 'Process ' + response.source + 'ed!',
    // subtitle: '11 mins ago', // könnte man noch berechnen!!!!
    content: "Successfully "+ response.source + "ed" + " the process <b>" + response.processName + "</b>",
    type: 'success',
    delay: '5000'
  });

  $("#" + response.processName.replace(/\s+/g, '') + "_row_"+ response.source).remove();
    if ((parseInt($("#"+ response.source + "Badge").html())-1) === 0) 
      $("#"+ response.source + "Badge").html("")
    else
      $("#"+ response.source + "Badge").html(parseInt($("#"+ response.source + "Badge").html()) - 1)
  
  if (response.source === "import") {
    setImportProcesses = setImportProcesses.filter(e => e !== response.processName);

    setTimeout(function() {
      setDeleteDropwdown();
      setImportDropwdown();
    }, 1000);
  }

  else if (response.source === "update") {
    setUpdateProcesses = setUpdateProcesses.filter(e => e !== response.processName);

    setTimeout(function() {
      setDeleteDropwdown();
      setUpdateDropwdown();
    }, 1000);
  }
}

// BESCHREIBUNG
function handle_response_all(response) {
  $('#' + response.source + 'Spinner').addClass("hidden");

  $.toast({
    title: 'Process ' + response.source + 'ed!',
    // subtitle: '11 mins ago', // könnte man noch berechnen!!!!
    content: "Successfully " + response.source + "ed" + " all processes",
    type: 'success',
    delay: '5000'
  });

  response.processList.forEach(function(process) {
    $("#" + process.replace(/\s+/g, '') + "_row_" + response.source).remove();
    // deleteDropdown hat keine Badge => daher nur für die anderen beiden Badge aktualisieren
    if (response.source !== "delete") {
      if ((parseInt($("#" + response.source + "Badge").html())-1) === 0) 
        $("#" + response.source + "Badge").html("")
      else
        $("#" + response.source + "Badge").html(parseInt($("#" + response.source + "Badge").html()) - 1)
    }
    if (response.source === "import")
      setImportProcesses = setImportProcesses.filter(e => e !== process);
    else if (response.source === "update")
      setUpdateProcesses = setUpdateProcesses.filter(e => e !== process);
    else { //reponse.source === "delete"
      toastedProcesses = toastedProcesses.filter(e => e !== process);
      setDeleteProcesses = setDeleteProcesses.filter(e => e !== process);
    }
  });

  if (response.source === "import") {
    setTimeout(function() {
      setDeleteDropwdown();
      setImportDropwdown();
    }, 1000);
  }
  else if (response.source === "update") {
    setTimeout(function() {
      setDeleteDropwdown();
      setUpdateDropwdown();
    }, 1000);
  }
  else { //reponse.source === "delete"
    setTimeout(function() {
      setDeleteDropwdown();
      setImportDropwdown();
    }, 1000);
  }
}

// BESCHREIBUNG
function handle_error(error) {
  $('#' + error.responseJSON.source + 'Spinner').addClass("hidden");
  $.toast({
    title: 'Error process ' + error.responseJSON.source + '!',
    // subtitle: '11 mins ago', // könnte man noch berechnen!!!!
    content: error.responseJSON.message,
    type: 'danger',
    delay: '10000'
  });
}

// ******************************************
// ************* Import SECTION ************* 
// ******************************************

// BESCHREIBUNG
function bpmnImport(e) {  
  $('#importSpinner').removeClass("hidden");
  
  $.post($SCRIPT_ROOT + '/import_process_select', {processName: e.target.id})
  .done(handle_response_select)
  .fail(handle_error)
}

function bpmnImportAll() {
  $('#importSpinner').removeClass("hidden");

  $.post($SCRIPT_ROOT + '/import_process_all', $.param({ processList: setImportProcesses },true))
  .done(handle_response_all)
  .fail(handle_error)  
}

// BESCHREIBUNG
function setImportDropwdown() {
  $.post($SCRIPT_ROOT + '/get_all_import_processes', function(data) {
    
    if (data.imports.length !== 0) {

      $("#importBadge").html(data.imports.length)
      $("#importAllButton").removeClass("hidden");
      $("#importDropdownText").addClass("hidden");

      data.imports.forEach(function(process) {
        if (!setImportProcesses.includes(process)) {
          $("#dropdown-menu-proceses-import").prepend(
            '<div class="row h-100" id="' + process.replace(/\s+/g, '') + '_row_import" style="margin: 5px 10px 6px 10px; border-bottom: 1px solid #eee; padding: 5px 0 10px 0;">' +
            '<div class="col-8">' +
              '<a class="align-middle">' + process + '</a>' +
            '</div>' +
            '<div class="col-4 text-center" style="margin-top: auto;margin-bottom: auto;">' +
              '<button class="btn btn-sm btn-info" id="' + process + '" onclick="bpmnImport(event)" type="submit">Import</button>' +
            '</div>' +
          '</div>'
          )

          $.toast({
            title: 'New process!',
            // subtitle: '11 mins ago', // könnte man noch berechnen!!!!
            content: 'You can now import the process <b id="processName">' + process + '</b>.',
            type: 'info',
            delay: '5000'
          });
          toastedProcesses.push(process);
          setImportProcesses.push(process);
        }
      })
    }

    else {
      $("#importBadge").html("")
      $("#importAllButton").addClass("hidden");
      $("#importDropdownText").removeClass("hidden");
    }

  });
}


// ******************************************
// ************* Update SECTION ************* 
// ******************************************

function bpmnUpdate(e) {  
  $('#updateSpinner').removeClass("hidden");
  
  $.post($SCRIPT_ROOT + '/update_process_select',{ processName: e.target.id })
  .done(handle_response_select)
  .fail(handle_error)
}

function bpmnUpdateAll(e) {  
  $('#updateSpinner').removeClass("hidden");
  
  $.post($SCRIPT_ROOT + '/update_process_all', $.param({ processList: setUpdateProcesses },true))
  .done(handle_response_all)
  .fail(handle_error)
}

// BESCHREIBUNG
function setUpdateDropwdown() {
  $.post($SCRIPT_ROOT + '/get_all_update_processes', function(data) {
    
    if (data.updates.length !== 0) {

      $("#updateBadge").html(data.updates.length)
      $("#updateAllButton").removeClass("hidden");
      $("#updateDropdownText").addClass("hidden");
    }

    else {
      $("#updateBadge").html("")
      $("#updateAllButton").addClass("hidden");
      $("#updateDropdownText").removeClass("hidden");
    }

  });
}

// ******************************************
// ************* Delete SECTION ************* 
// ******************************************

// BESCHREIBUNG
function bpmnDelete(e) {
  $('#deleteSpinner').removeClass("hidden");

  $.post($SCRIPT_ROOT + '/delete_database_select', { processName: e.target.id })
    .done(handle_response_select)
    .fail(handle_error)
};  

// BESCHREIBUNG
function bpmnDeleteAll() {
  $('#deleteSpinner').removeClass("hidden");

  $.post($SCRIPT_ROOT + '/delete_database_all')
  .done(handle_response_all)
  .fail(handle_error)
};

// BESCHREIBUNG
function setDeleteDropwdown() {

  $.post($SCRIPT_ROOT + '/get_all_processes', function(data) {
    
    if (data.length !== 0) {

      $("#deleteAllButton").removeClass("hidden");
      $("#deleteDropdownText").addClass("hidden");

      data.forEach(function(process) {
        if (!setDeleteProcesses.includes(process)) {
          $("#dropdown-menu-proceses-delete").prepend(
            '<div class="row h-100" id="' + process.replace(/\s+/g, '') + '_row_delete" style="margin: 5px 10px 6px 10px; border-bottom: 1px solid #eee; padding: 5px 0 10px 0;">' +
            '<div class="col-8">' +
              '<a class="align-middle">' + process + '</a>' +
            '</div>' +
            '<div class="col-4 text-center" style="margin-top: auto;margin-bottom: auto;">' +
              '<button class="btn btn-sm btn-danger" id="' + process + '" onclick="bpmnDelete(event)" type="submit">Delete</button>' +
            '</div>' +
          '</div>'
          )

          setDeleteProcesses.push(process)
        }
      })
    }

    else {
      $("#deleteAllButton").addClass("hidden");
      $("#deleteDropdownText").removeClass("hidden");
    }

  });
}