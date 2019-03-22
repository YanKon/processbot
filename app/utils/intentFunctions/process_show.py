import json
from google.protobuf.json_format import MessageToJson
from app.models import Process, Edge, GeneralInstruction, DetailInstruction
from app.utils import responseHelper, dialogflowHelper
from app.utils import buttons as buttons

# Weg: man kommt hier her über submit_message(JS) --> send_userText(PY Route)
def run(dialogflowResponse):
    parameters_json = json.loads(MessageToJson(dialogflowResponse.query_result.parameters))
    processName = parameters_json['process_name_parameter']

    try:
        # Aktuellen Prozess holen
        process = Process.query.filter_by(processName=processName).first()
        processId = process.id
    except: #Kein Prozess angegeben, bzw. Prozess nicht gefunden --> alle Prozesse als Button anzeigen
        message1 = dialogflowResponse.query_result.fulfillment_text
        message2 = "These are the processes I can show you a model for:"

        processButtons = []
        for process in Process.query.all():
            button = buttons.createCustomButtonWithValue(process.processName,"Show_Button_" + process.processName)
            processButtons.append(button)
        # TODO: Hier noch ein eigener Cancel Button machen & eigene button_run definieren!
        processButtons.extend(buttons.CANCEL_PROCESS_BUTTON)


        return responseHelper.createResponseObject([message1, message2],processButtons,"","","")
    
    message = dialogflowResponse.query_result.fulfillment_text
    currentProcess = processId

    return responseHelper.createResponseObject([message],[],currentProcess,"","")