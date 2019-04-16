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

        showButtons = []
        for process in Process.query.all():
            button = buttons.createCustomButton(process.processName,"process_show",process.processName)
            showButtons.append(button)
        showButtons.extend(buttons.CANCEL_SHOW_BUTTON)


        return responseHelper.createResponseObject([message1, message2],showButtons,"", "","","")
    
    message1 = dialogflowResponse.query_result.fulfillment_text
    currentProcess = processId
    currentProcessName = processName 

    message2 = '<div id="processSVG" style="cursor:pointer;padding: 5px 0 5px 0;">![BPMN Model](http://127.0.0.1:5000/get_image/' + currentProcessName + '.html)</div>'

    return responseHelper.createResponseObject([message1, message2],[],currentProcess, currentProcessName, "","")

# Weg: man kommt hier her über submit_button(JS) --> send_button(PY Route) --> triggerButtonFunction (ButtonDict)
def button_run(pressedButtonValue, currentProcess, currentProcessName, currentProcessStep, previousProcessStep):
    if pressedButtonValue == "process_show_cancel":
        message = "Alright, the request will be canceled."
        return responseHelper.createResponseObject([message],[],"","","","")

# Weg: man kommt hier her über submit_button(JS) --> send_button(PY Route) --> triggerButtonFunction (customButtonDict)
def customButton_run(pressedButtonValue, currentProcess, currentProcessName, currentProcessStep, previousProcessStep):
    # zB. CustomButtonValue = "process_show$customButton$Reisekosten"
    entity = pressedButtonValue[26:]
    dialogflowResponse = dialogflowHelper.detect_intent_texts(entity)
    return run(dialogflowResponse)