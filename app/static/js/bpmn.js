// BPMNio script
// the diagram you are going to display
var bpmnXML;

$.ajax({
  url: "/static/resources/testProcess.bpmn",
  success: function (data) {
    bpmnXML = data
  },
  async: false // <- this turns it into synchronous
})      

// BpmnJS is the BPMN viewer instance
var viewer = new BpmnJS({ container: '#canvas' });

// import a BPMN 2.0 diagram
viewer.importXML(bpmnXML, function(err) {
  if (err) {
    return console.error('could not import BPMN 2.0 diagram', err);
  } else {
    console.log("BPMN successfully imported")
    var canvas = viewer.get('canvas');
    // canvas.zoom('fit-viewport');

    // add color
    // canvas.addMarker('Task_03duqqg', 'highlight');
    
  }
});