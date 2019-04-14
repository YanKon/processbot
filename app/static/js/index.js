//$("#live-chat").hide(0);

var toastedProcesses = [];
var setImportProcesses = [];
var setUpdateProcesses = [];
var setDeleteProcesses = [];

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
  shape = elementRegistry.get(processStep)

  if (shape.type = "bmpn:Task") {
    console.log(shape);

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
  
    function handle_response(response) {
      $.toast({
        title: 'Processes deleted!',
        content: "Successfully delete process <b>" + response.deletedProcess + "</b>",
        type: 'success',
        delay: '5000'
      });

      // entfernt den Prozess aus dem delete dropdown
      $("#" + response.deletedProcess.replace(/\s+/g, '') + "_row_delete").remove();

      // löscht den gerade gelöschten Prozess aus den toastedProcess => damit er direkt nochmal importiert werden kann
      toastedProcesses = toastedProcesses.filter(e => e !== response.deletedProcess);
      setDeleteProcesses = setDeleteProcesses.filter(e => e !== response.deletedProcess);

      // updatet das delete und import Dropdown
      setTimeout(function () {
        setDeleteDropwdown();
        setImportDropwdown();
      }, 1000);
    }
};  

// BESCHREIBUNG
function bpmnDeleteAll() {
  $.post($SCRIPT_ROOT + '/delete_database_all',
    handle_response
  );
  
  function handle_response(response) {
    $.toast({
      title: 'Processes deleted!',
      content: "Successfully delete all processes.",
      type: 'success',
      delay: '5000'
    });

    // löscht alle Prozesse aus dem delete dropdown
    response.deletedProcesses.forEach(function(process) {
      $("#" + process.replace(/\s+/g, '') + "_row_delete").remove();
      toastedProcesses = toastedProcesses.filter(e => e !== process);
      setDeleteProcesses = setDeleteProcesses.filter(e => e !== process);
    })



    // setzt die delete und import dropdowns 
    setTimeout(function() {
      setDeleteDropwdown();
      setImportDropwdown();
    }, 1000);
  }
};


// BESCHREIBUNG
function bpmnImport(e) {  
  
  $.post($SCRIPT_ROOT + '/import_process_select',
    { 
      processName: e.target.id 
    },
    handle_response
  );

  function handle_response(response) {
    $.toast({
      title: 'Process imported!',
      // subtitle: '11 mins ago', // könnte man noch berechnen!!!!
      content: "Successfully import the process <b>" + response.processName + "</b>",
      type: 'success',
      delay: '5000'
    });

    $("#" + response.processName.replace(/\s+/g, '') + "_row_import").remove();
    if ((parseInt($("#importBadge").html())-1) === 0) 
      $("#importBadge").html("")
    else
      $("#importBadge").html(parseInt($("#importBadge").html()) - 1)

    setImportProcesses = setImportProcesses.filter(e => e !== response.processName);

    setTimeout(function() {
      setDeleteDropwdown();
      setImportDropwdown();
    }, 1000);

  }
}

function bpmnImportAll() {

  $.post($SCRIPT_ROOT + '/import_process_all', $.param(
    { 
      processList: setImportProcesses
    },
    true),
    handle_response
  );

  function handle_response(response) {
    $.toast({
      title: 'Process imported!',
      // subtitle: '11 mins ago', // könnte man noch berechnen!!!!
      content: "Successfully import all processes",
      type: 'success',
      delay: '5000'
    });

    response.processList.forEach(function(process) {
      $("#" + process.replace(/\s+/g, '') + "_row_import").remove();
      if ((parseInt($("#importBadge").html())-1) === 0) 
        $("#importBadge").html("")
      else
        $("#importBadge").html(parseInt($("#importBadge").html()) - 1)

      setImportProcesses = setImportProcesses.filter(e => e !== process);
    });

    setTimeout(function() {
      setDeleteDropwdown();
      setImportDropwdown();
    }, 1000);

  }
  
}

function bpmnUpdate(e) {  
  
  $.post($SCRIPT_ROOT + '/update_process_select',
    { 
      processName: e.target.id 
    },
    handle_response
  );

  function handle_response(response) {
    $.toast({
      title: 'Process updated!',
      // subtitle: '11 mins ago', // könnte man noch berechnen!!!!
      content: "Successfully update all the processes <b>" + response.processName + "</b>",
      type: 'success',
      delay: '5000'
    });

    $("#" + response.processName.replace(/\s+/g, '') + "_row_update").remove();
    if ((parseInt($("#updateBadge").html())-1) === 0) 
      $("#updateBadge").html("")
    else
      $("#updateBadge").html(parseInt($("#updateBadge").html()) - 1)

      setUpdateProcesses = setUpdateProcesses.filter(e => e !== response.processName);

    setTimeout(function() {
      setDeleteDropwdown();
      setUpdateDropwdown();
    }, 1000);

  }
}

function bpmnUpdateAll(e) {  
  
  $.post($SCRIPT_ROOT + '/update_process_all', $.param(
    { 
      processList: setUpdateProcesses
    },
    true),
    handle_response
  );

  function handle_response(response) {
    $.toast({
      title: 'Process updated!',
      content: "Successfully update all the processes",
      type: 'success',
      delay: '5000'
    });

    response.processList.forEach(function(process) {
      $("#" + process.replace(/\s+/g, '') + "_row_update").remove();
      if ((parseInt($("#updateBadge").html())-1) === 0) 
        $("#updateBadge").html("")
      else
        $("#updateBadge").html(parseInt($("#updateBadge").html()) - 1)

      setUpdateProcesses = setUpdateProcesses.filter(e => e !== process);
    });

    setTimeout(function() {
      setDeleteDropwdown();
      setUpdateDropwdown();
    }, 1000);

  }
}

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