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
