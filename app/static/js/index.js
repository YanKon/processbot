var toastedProcesses = [];
var setImportProcesses = [];
var setUpdateProcesses = [];
var setDeleteProcesses = [];
var loadedProcessModel = "";
var lastHighlighted = "";

// Managet das laden und schließen (unloaden) von BPMN Modellen

function handle_model(responseObject) {
  if (responseObject.currentProcessName !== "") { // CurrentProcess ist gesetzt
    if (loadedProcessModel != "" && loadedProcessModel != responseObject.currentProcessName) { // model ist geladen und das geladene ist ein anderes als ich anzeigen will
      // altes Modell "löschen"
      unloadBPMN();
      loadedProcessModel = "";
      // MODEL LADEN, dann warten, dann Highlighten
      loadBPMN(responseObject.currentProcessName).then(function () { 
        loadedProcessModel = responseObject.currentProcessName;
        highlightStep(responseObject);
      })
      .catch(function(err) {
        console.error("could not import BPMN 2.0 diagram", err);
      });
    }

    else if(!viewer.get("canvas").hasOwnProperty("_rootElement")) { // --> model noch nicht angezeigt)
      // wenn zuvor ein anderes model gestartet wurde muss lastHighlighted zurückgesetzt werden
      lastHighlighted = "";
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
    if(viewer.get("canvas").hasOwnProperty("_rootElement")) // --> model ist angezeigt
      unloadBPMN(viewer);
      loadedProcessModel = "";
  }
}

// Blendet ein Overlays über den aktuell Prozessschritt ein
function showOverlays(processStep) {

  // prüft ob die Overlays angezeigt werden sollen
  if ($("#overlaySwitch").prop('checked')) 
    display = "";
  else 
    display = " hidden";

  var instruction = elementRegistry.get(processStep).businessObject.get("chatbot:instruction");
  var detailInstruction = elementRegistry.get(processStep).businessObject.get("chatbot:detailInstruction");

  // prüft beim Overlay um welches Element es sich handelt (split oder task)
  // events haben noch keine overlays
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

  // bpmn.io spezifisch => positioniert das Overlay letztendlicha an gewünschter Stelle
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

// Highlightet den aktuellen Prozesschritt (grünen Hintergrund)
// und entfernt aus vorherigen Schritt den grünen Hintergrund und macht ihn grau, indem er als "done" gekennzeichnet wird
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

// dient dem Ausgeben aller Messages im Response Objekt
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

// dient dem Ausgeben aller Buttons im Response Objekt
// blendet Buttons, falls vorhanden, ein
// erkennt button klick und führt Funktion aus
function handle_buttons(responseObject) {
  // Buttons --> anzeigen & geklickter Button auslesen

  //  geändert zu length ungleich 0, weil er bei != [] trotz leerer Liste reingegangen ist
  if (responseObject.buttons.length != 0) {
    // deaktivitert das Inputfeld => nur noch Buttons als Antwort erlaubt
    deactivateInput();
    setTimeout(function() {
      // botui spezifische Befehle
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

// Sendet des UserText an das Backend über die route /send_userText in routes.py
function submit_userText(userText) {
  $.post("/send_userText", 
    { 
     userText: userText 
    }, 
    handle_response
  );

  // wenn Antwort erhalten, dann folgende Schritte ausführen
  function handle_response(responseObject) {
        
    // entsprechendes Modell anzeigen
    handle_model(responseObject);
    // Messages ausgeben
    handle_messages(responseObject);
    // Buttons anzeigen, falls vorhande
    handle_buttons(responseObject);

  }
}

// Sendet den value eines buttons an das Backend, falls diese geklickt werden 
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
  
  // wenn Antwort erhalten, dann folgende Schritte ausführen (wie bei send_userText)
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

// Überprüft von Beginn an in regelmäßigen Abstand ob es neues oder veränderte Prozesse gibt
// über ThreadingBpmn.py im Ordner utils
function threadingBPMN() {
  // Warumm $SCRIPT_ROOT ? (siehe http://flask.pocoo.org/docs/0.12/patterns/jquery/)
  $.post($SCRIPT_ROOT + '/get_status_bpmnDir', function (data) {
    
    if (data.updates.length !== 0) {

      $("#updateBadge").html(data.updates.length)
      $("#updateAllButton").removeClass("hidden");
      $("#updateDropdownText").addClass("hidden");

      // itertiert über alle geupdateten Prozesse
      data.updates.forEach(function (process) {
        if (!setUpdateProcesses.includes(process)) {
          // fügt eine Benachrichtigung ein 
          $.toast({
            title: 'Process changed!',
            // subtitle: '11 mins ago', // könnte man noch berechnen!!!!
            content: 'The process <b id="processName">' + process + '</b> has updates.',
            type: 'info',
            delay: '5000'
          });
          setUpdateProcesses.push(process);
          
          // fügt den Prozess in das Dropdown "Update" hinzu
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

      // itertiert über alle importfähigen Prozesse
      data.imports.forEach(function (process) {
        if (!toastedProcesses.includes(process) && !setImportProcesses.includes(process)){
          // fügt eine Benachrichtigung ein 
          $.toast({
            title: 'New process!',
            // subtitle: '11 mins ago', // könnte man noch berechnen!!!!
            content: 'You can now import the process <b id="processName">' + process + '</b>.',
            type: 'info',
            delay: '5000'
          });
          toastedProcesses.push(process);
          setImportProcesses.push(process);
          
          // fügt den Prozess in das Dropdown "Import" hinzu
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

// alles was hier drinnen ist, wird direkt beim Start der Anwendung ausgeführt
$(document).ready(function() {

  // startet den Thread, der prüft ob es zum Start neue oder veränderte Prozesse gibt
  threadingBPMN();
  // fügt alle Prozesse die in der Datenbank sind, in das "Delete" Dropdown 
  setDeleteDropwdown();

  // übergibt den eingegeben Text an die Funktion submit_userText => die es wiederum ans backend sendet
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

  // regisiert ein Klick auf das Senden-Icon und sendet die Nachricht
  $("#chat_send").click(function(e) {
    handleUserInput();
  });

  // regisiert ein Enter klicken und sendet die Nachricht
  $("#InputField").keypress(function(e) {
    if (e.keyCode == 13)
      handleUserInput();
  });

  // schließt das chatbot Fenster
  $(".chat-close").on("click", function(e) {
    e.preventDefault();
    $("#live-chat").fadeOut(300);
    $("#prime").fadeIn(300);
  });
  
  // öffnet das chabot Fenster
  $("#prime").on("click", function(e) {
    e.preventDefault();
    $("#live-chat").fadeIn(300);
    $("#prime").hide(0);
  });  
  
  // erzeugt das Help-Overlay, welches alle verfügbaren Befehle anzeigt
  $('#toggleScreenOverlay').click(function(e) {
    createHelpOverlay();
  });

  // setzt das Interval, wie oft vom Frontend geprüft wird ob es neue Prozesse im backend gibt
  setInterval(function() {
    threadingBPMN();
  }, 10000);
});

// gibt einfach nur eine Popover aus, wenn das Inpurtfeld nicht klickbar ist, weil Buttons eingeblendet sind
function popoverInput() {
  $('[data-toggle="tooltip"]').tooltip({ animation: true })
  if ($("#InputField").hasClass("InputField-inactive"))
    $('[data-toggle="tooltip"]').tooltip('enable');
  else 
    $('[data-toggle="tooltip"]').tooltip('disable');
}

// registiert ein Klick auf ein Prozess-Thumbnail im Chatbot-Fenster und blendet ein Fullscreen-Overlay ein
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

});

// **************************************************************************
// ************* handle_functions für import, update und delete ************* 
// **************************************************************************

// 
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

// registriert den geklicket Prozess, der importiert werden soll und schickt ihn an routes.py
function bpmnImport(e) {  
  $('#importSpinner').removeClass("hidden");
  
  $.post($SCRIPT_ROOT + '/import_process_select', {processName: e.target.id})
  .done(handle_response_select)
  .fail(handle_error)
}

// importiert alle Prozesse die im Import Dropdown vorhanden sind über routes.py
function bpmnImportAll() {
  $('#importSpinner').removeClass("hidden");

  $.post($SCRIPT_ROOT + '/import_process_all', $.param({ processList: setImportProcesses },true))
  .done(handle_response_all)
  .fail(handle_error)  
}

// Zeigt alle Prozesse die importiert werden können im Dropdown "Import"
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

// registriert den geklicket Prozess, der importiert werden soll und schickt ihn an routes.py
function bpmnUpdate(e) {  
  $('#updateSpinner').removeClass("hidden");
  
  $.post($SCRIPT_ROOT + '/update_process_select',{ processName: e.target.id })
  .done(handle_response_select)
  .fail(handle_error)
}

// importiert alle Prozesse die im Update Dropdown vorhanden sind über routes.py
function bpmnUpdateAll(e) {  
  $('#updateSpinner').removeClass("hidden");
  
  $.post($SCRIPT_ROOT + '/update_process_all', $.param({ processList: setUpdateProcesses },true))
  .done(handle_response_all)
  .fail(handle_error)
}

// Zeigt alle Prozesse die geupdatet werden können im Dropdown "Update"
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

// registriert den geklicket Prozess, der gelöscht werden soll und schickt ihn an routes.py
function bpmnDelete(e) {
  $('#deleteSpinner').removeClass("hidden");

  $.post($SCRIPT_ROOT + '/delete_database_select', { processName: e.target.id })
    .done(handle_response_select)
    .fail(handle_error)
};  

// löscht alle Prozesse die im Update Dropdown vorhanden sind über routes.py
function bpmnDeleteAll() {
  $('#deleteSpinner').removeClass("hidden");

  $.post($SCRIPT_ROOT + '/delete_database_all')
  .done(handle_response_all)
  .fail(handle_error)
};

// Zeigt alle Prozesse die in der Datenbank vorhanden sind im Dropdown "Delete" an
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