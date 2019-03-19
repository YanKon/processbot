// BpmnJS is the BPMN viewer instance
var viewer = new BpmnJS({ container: "#canvas" });

function loadBPMN () {
  
  return new Promise((resolve, reject) => {
    
    var bpmnXML;

    $.ajax({
      url: "/static/resources/testProcess.bpmn",
      success: function(data) {
        bpmnXML = data;
        
        viewer.importXML(bpmnXML, function(err) {
          if (err) {
            return console.error("could not import BPMN 2.0 diagram", err);
          } else {
            console.log("BPMN successfully imported");
            var canvas = viewer.get("canvas");
            resolve(canvas);
            // canvas.zoom('fit-viewport');
            // add color
            // canvas.addMarker('Task_03duqqg', 'highlight');
          }
        });
      },
      async: false // <- this turns it into synchronous
    });         
  });
}

function handle_bpmn(responseObject) {


  // Modell ist nicht geladen
  if (!viewer.get("canvas").hasOwnProperty("_rootElement")) {
    // Prozess bereits gestartet
    if (responseObject.currentProcess !== "") {
      loadBPMN();
    }
  }


}


