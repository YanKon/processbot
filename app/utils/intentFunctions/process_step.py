import json
from google.protobuf.json_format import MessageToJson
from app.models import Process, Edge, Node, GeneralInstruction
from app.utils import responseHelper, dialogflowHelper
from app.utils import buttons as buttons

# Weg: man kommt hier her über submit_message(JS) --> send_userText(PY Route)
def run(dialogflowResponse):
    
    parameters_json = json.loads(MessageToJson(dialogflowResponse.query_result.parameters))
    processName = parameters_json['process_name_parameter']
    taskName = parameters_json['task_name_parameter']

    try:
        # gewünschten Prozess holen
        process = Process.query.filter_by(processName=processName).first()
        processId = process.id
        # gewünschten Task holen
        task = Node.query.filter_by(name=taskName).filter_by(type="task").filter_by(processId=processId).first()
        taskId = task.id
    except: # Entweder Task oder Process nicht erkannt bzw. angegeben
        message1 = dialogflowResponse.query_result.fulfillment_text
        return responseHelper.createResponseObject([message1],[],"","","")
    
    message1 = dialogflowResponse.query_result.fulfillment_text
    message2 = GeneralInstruction.query.filter_by(nodeId=taskId).first().text # Generelle Anweisungen für gewünschten Schritt
    messages = [message1,message2]
    # TODO: Buttons hinzu für nächsten bzw. vorherigen Schritt bzw. für Prozess starten / anzeigen bzw. generel instruction gewünscht

    return responseHelper.createResponseObject(messages,[],processId,taskId,"")


# Weg: man kommt hier her über submit_button(JS) --> send_button(PY Route) --> triggerButtonFunction (ButtonDict)
def button_run(pressedButtonValue, currentProcess, currentProcessStep, previousProcessStep):
    pass

# Weg: man kommt hier her über submit_button(JS) --> send_button(PY Route) --> triggerButtonFunction (customButtonDict)
def customButton_run(pressedButtonValue, currentProcess, currentProcessStep, previousProcessStep):
    pass