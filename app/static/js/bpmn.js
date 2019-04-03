// BpmnJS is the BPMN viewer instance
var viewer = new BpmnJS({ container: "#canvas" });
var elementRegistry;
var overlays;
var eventBus;
var activateOverlay = false;

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

function loadBPMN(uri, bpmnViewer) {
    
  let modelLoadPromise = new Promise (function(resolve,reject){
    var bpmnXML;
    $.ajax({
      url: "/static/resources/Process_1_new.bpmn",
      // url: "/static/resources/" + uri + ".bpmn",
      success: function(data) {
        bpmnXML = data;
        bpmnViewer.importXML(bpmnXML, function(err) {
          if (err) {
            reject(err);
          } else {
            $("body").css("background-image","none")
            overlays = bpmnViewer.get("overlays");
            elementRegistry = bpmnViewer.get('elementRegistry');
            eventBus = bpmnViewer.get('eventBus');

            // you may hook into any of the following events
            var events = [
              'element.hover',
              'element.out',
            ];
          
            // var elements = elementRegistry.getAll();
            events.forEach(function(event) {

              eventBus.on(event, function(e) {
                if ($("#overlaySwitch").prop('checked')) {
                  if (event === "element.hover") {
                    if (e.element.type === "bpmn:Task") {
                      if (!bpmnViewer.get('canvas').hasMarker(e.element.id, "highlight")) {
                        
                        var instruction = elementRegistry.get(e.element.id).businessObject.get("chatbot:instruction");
                        var detailInstruction= elementRegistry.get(e.element.id).businessObject.get("chatbot:detailInstruction");
                        var $overlayHtml = 
                          $('<div class="arrow_box">'+
                              '<p class="pheader1">general instruction</p>' +
                              '<div class="node-instruction-current">'+ instruction + '</div>'+
                              '<p class="pheader2">detail instruction</p>' +
                              '<div class="node-instruction-current">'+ detailInstruction + '</div>'+
                            '</div>').css({
                            width: elementRegistry.get(e.element.id).width * 2,
                          });

                        overlays.add(e.element.id, 'note', {
                          position: {
                            bottom: -7,
                            left: -(elementRegistry.get(e.element.id).width / 2)
                          },
                          html: $overlayHtml
                        });

                      } 
                    }
                  }
                }
                if (event === "element.out") {
                  if (!viewer.get('canvas').hasMarker(e.element.id, "highlight")) {
                    overlays.remove({ element: e.element.id });
                  }
                }
              });
            });
            
            // elements.forEach(function(element) {
            //   if (element.type === "bpmn:Task") {
            //     var instruction = elementRegistry.get(element.id).businessObject.get("chatbot:instruction");
            //     var detailInstruction= elementRegistry.get(element.id).businessObject.get("chatbot:instruction");
            //     overlays.add(element.id, 'note', {
            //       position: {
            //         bottom: 3,
            //         left: -5
            //       },
            //       html: '<div class="node-instruction">'+detailInstruction+'</div>'
            //     });
                
            //   }            
            // });
            resolve();
          }
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
