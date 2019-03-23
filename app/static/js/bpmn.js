// BpmnJS is the BPMN viewer instance
var viewer = new BpmnJS({ container: "#canvas" });

function loadBPMN(uri) {
    
  let modelLoadPromise = new Promise (function(resolve,reject){
    var bpmnXML;
    $.ajax({
      url: "/static/resources/" + uri + ".bpmn",
      success: function(data) {
        bpmnXML = data;
        viewer.importXML(bpmnXML, function(err) {
          if (err) {
            reject(err);
          } else {
            var overlays = viewer.get("overlays");
            overlays.add('Task_0roorh4', 'note', {
              position: {
                bottom: 0,
                right: 0
              },
              html: '<div class="diagram-note">Mixed up the labels?</div>'
            });
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
