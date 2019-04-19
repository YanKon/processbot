// BpmnJS is the BPMN viewer instance
var viewer = new BpmnJS({ container: "#canvas" });

var elementRegistry;
var overlays;
var eventBus;

$("#overlaySwitch").click(function(){
  var check = $("#overlaySwitch").prop('checked');
  if(check == true) {
    $('.arrow_box_highlight').removeClass("hidden");
    $('.checkbox').prop('checked', true);
  } else {
    $('.arrow_box_highlight').addClass("hidden");
    $('.checkbox').prop('checked', false);
  }
});

function loadBPMN(processName) {
  let modelLoadPromise = new Promise(function (resolve, reject) {
    var bpmnXML;
    $.ajax({
      url: "/static/resources/bpmn/" + processName + ".bpmn",
      success: function (data) {
        bpmnXML = data;
        viewer.importXML(bpmnXML, function (err) {
          if (err)
            reject(err);
          else
            $("body").css("background-image", "none")

          overlays = viewer.get("overlays");
          elementRegistry = viewer.get('elementRegistry');
          eventBus = viewer.get('eventBus');

          viewer.get("canvas").zoom('fit-viewport');
          // you may hook into any of the following events
          var events = [
            'element.hover',
            'element.out',
          ];

          // var elements = elementRegistry.getAll();
          events.forEach(function (event) {
            eventBus.on(event, function (e) {
              if ($("#overlaySwitch").prop('checked')) {
                if (event === "element.hover") {
                  if (e.element.type === "bpmn:Task") {
                    if (!viewer.get('canvas').hasMarker(e.element.id, "highlight")) {

                      var instruction = elementRegistry.get(e.element.id).businessObject.get("chatbot:instruction");
                      var detailInstruction = elementRegistry.get(e.element.id).businessObject.get("chatbot:detailInstruction");
                      var $overlayHtml =
                        $('<div class="arrow_box">' +
                          '<p class="pheader1">general instruction</p>' +
                          '<div class="node-instruction-current">' + instruction + '</div>' +
                          '<p class="pheader2">detail instruction</p>' +
                          '<div class="node-instruction-current">' + detailInstruction + '</div>' +
                          '</div>').css({
                            width: elementRegistry.get(e.element.id).width * 2,
                          });
                    }
                  }
                  else if (e.element.type === "bpmn:ExclusiveGateway" && elementRegistry.get(e.element.id).businessObject.get("chatbot:splitQuestion") !== undefined) {
                    var splitQuestion = elementRegistry.get(e.element.id).businessObject.get("chatbot:splitQuestion");

                    var $overlayHtml =
                      $('<div class="arrow_box">' +
                        '<p class="pheader1">split question</p>' +
                        '<div class="node-instruction-current">' + splitQuestion + '</div>' +
                        '</div>').css({
                          width: elementRegistry.get(e.element.id).width * 2,
                        });
                  }
                  // wenn type nicht Task oder ExlusiveGateway ist sollen keine Overlays angezeigt werden 
                  else
                    return;

                  overlays.add(e.element.id, 'note', {
                    position: {
                      bottom: -7,
                      left: -(elementRegistry.get(e.element.id).width / 2)
                    },
                    html: $overlayHtml
                  });

                }
              }
              if (event === "element.out") {
                if (!viewer.get('canvas').hasMarker(e.element.id, "highlight")) {
                  overlays.remove({ element: e.element.id });
                }
              }
            });
          });
          resolve();
        
        });
  },
    async: true // <- this turns it into synchronous
    });
  });
return modelLoadPromise;
}

function unloadBPMN() {
  viewer.clear();
  $("body").css("background-image","url('/static/resources/icon/background-trans-20.png')")
  delete viewer.get("canvas")['_rootElement'];
}


var elementRegistryDialog;
var overlaysDialog;
var eventBusDialog;

function loadSecondBPMN(processName, bpmnViewer) {
  let modelLoadPromise = new Promise(function (resolve, reject) {
    var bpmnXML;
    $.ajax({
      url: "/static/resources/bpmn/" + processName + ".bpmn",
      success: function (data) {
        bpmnXML = data;
        bpmnViewer.importXML(bpmnXML, function (err) {
          if (err)
            reject(err);
          else
            $("body").css("background-image", "none")
          overlaysDialog = bpmnViewer.get("overlays");
          elementRegistryDialog = bpmnViewer.get('elementRegistry');
          eventBusDialog = bpmnViewer.get('eventBus');

          bpmnViewer.get("canvas").zoom('fit-viewport');
          // you may hook into any of the following events
          var events = [
            'element.hover',
            'element.out',
          ];

          // var elements = elementRegistry.getAll();
          events.forEach(function (event) {
            eventBusDialog.on(event, function (e) {
              if ($("#overlaySwitch").prop('checked')) {
                if (event === "element.hover") {
                  if (e.element.type === "bpmn:Task") {
                    if (!bpmnViewer.get('canvas').hasMarker(e.element.id, "highlight")) {

                      var instruction = elementRegistryDialog.get(e.element.id).businessObject.get("chatbot:instruction");
                      var detailInstruction = elementRegistryDialog.get(e.element.id).businessObject.get("chatbot:detailInstruction");
                      var $overlayHtml =
                        $('<div class="arrow_box">' +
                          '<p class="pheader1">general instruction</p>' +
                          '<div class="node-instruction-current">' + instruction + '</div>' +
                          '<p class="pheader2">detail instruction</p>' +
                          '<div class="node-instruction-current">' + detailInstruction + '</div>' +
                          '</div>').css({
                            width: elementRegistryDialog.get(e.element.id).width * 2,
                          });
                    }
                  }
                  else if (e.element.type === "bpmn:ExclusiveGateway" && elementRegistryDialog.get(e.element.id).businessObject.get("chatbot:splitQuestion") !== undefined) {
                    var splitQuestion = elementRegistryDialog.get(e.element.id).businessObject.get("chatbot:splitQuestion");

                    var $overlayHtml =
                      $('<div class="arrow_box">' +
                        '<p class="pheader1">split question</p>' +
                        '<div class="node-instruction-current">' + splitQuestion + '</div>' +
                        '</div>').css({
                          width: elementRegistryDialog.get(e.element.id).width * 2,
                        });
                  }
                  // wenn type nicht Task oder ExlusiveGateway ist sollen keine Overlays angezeigt werden 
                  else
                    return;

                  overlaysDialog.add(e.element.id, 'note', {
                    position: {
                      bottom: -7,
                      left: -(elementRegistryDialog.get(e.element.id).width / 2)
                    },
                    html: $overlayHtml
                  });

                }
              }
              if (event === "element.out") {
                if (!bpmnViewer.get('canvas').hasMarker(e.element.id, "highlight")) {
                  overlaysDialog.remove({ element: e.element.id });
                }
              }
            });
          });
          resolve();

        });
      },
      async: true // <- this turns it into synchronous
    });
  });
  return modelLoadPromise;
}
