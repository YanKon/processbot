// BpmnJS is the BPMN viewer instance
var viewer = new BpmnJS({ container: "#canvas" });
var elementRegistry;
var overlays;
var eventBus;

function loadBPMN(uri) {
    
  let modelLoadPromise = new Promise (function(resolve,reject){
    var bpmnXML;
    $.ajax({
      url: "/static/resources/Process_1_new.bpmn",
      // url: "/static/resources/" + uri + ".bpmn",
      success: function(data) {
        bpmnXML = data;
        viewer.importXML(bpmnXML, function(err) {
          if (err) {
            reject(err);
          } else {
            overlays = viewer.get("overlays");
            elementRegistry = viewer.get('elementRegistry');
            eventBus = viewer.get('eventBus');

            // you may hook into any of the following events
            var events = [
              'element.hover',
              'element.out',
            ];
          
            // var elements = elementRegistry.getAll();
            events.forEach(function(event) {

              eventBus.on(event, function(e) {
                if (event === "element.hover") {
                  if (e.element.type === "bpmn:Task") {
                    
                    var instruction = elementRegistry.get(e.element.id).businessObject.get("chatbot:instruction");
                    var detailInstruction= elementRegistry.get(e.element.id).businessObject.get("chatbot:instruction");
                    overlays.add(e.element.id, 'note', {
                      position: {
                        bottom: -5,
                        left: -2
                      },
                      html: '<div class="node-instruction">'+detailInstruction+'</div>'
                    });
                  }
                }
                if (event === "element.out") {
                  overlays.remove({ element: e.element.id });
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
      async: false // <- this turns it into synchronous
    });
  });
  return modelLoadPromise;
}

function unloadBPMN() {
  viewer.clear();
  delete viewer.get("canvas")['_rootElement'];
}
