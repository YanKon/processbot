import json
from google.protobuf.json_format import MessageToJson
from app.models import Process, ProcessDoc
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
        print(processId)
    except: #Kein Prozess angegeben, bzw. Prozess nicht gefunden --> alle Prozesse als Button anzeigen
        message1 = dialogflowResponse.query_result.fulfillment_text
        message2 = "These are the processes I have a documentation for:"
        docButtons = []
        for processDocu in ProcessDoc.query.all():
            processId = processDocu.processId
            processName = Process.query.filter_by(id=processId).first().processName
            button = buttons.createCustomButton(processName,"process_doc", processName)
            docButtons.append(button)
        docButtons.extend(buttons.CANCEL_DOC_BUTTON)
        messages = [message1, message2]

        return responseHelper.createResponseObject(messages,docButtons,"","","","")

    try:
        message1 = dialogflowResponse.query_result.fulfillment_text 
        message2 = ProcessDoc.query.filter_by(processId=processId).first().description # Prozessdoku für Prozess
        messages = [message1, message2]
        currentProcess = processId
        return responseHelper.createResponseObject(messages,[],currentProcess,processName,"","")
    except: # Für angegebenen Prozess gibt es keine Doku
        message1 = "Unfortunately there is no documentation for process \"" + processName + "\"."
        return responseHelper.createResponseObject([message1],[],"","","","")


# Weg: man kommt hier her über submit_button(JS) --> send_button(PY Route) --> triggerButtonFunction (ButtonDict)
def button_run(pressedButtonValue, currentProcess, currentProcessName, currentProcessStep, previousProcessStep):
    if pressedButtonValue == "process_doc_cancel":
        message = "Alright, the request will be canceled."
        return responseHelper.createResponseObject([message],[],"","","","")   


# Weg: man kommt hier her über submit_button(JS) --> send_button(PY Route) --> triggerButtonFunction (customButtonDict)
def customButton_run(pressedButtonValue, currentProcess, currentProcessName, currentProcessStep, previousProcessStep):
    # zB. CustomButtonValue = "process_doc$customButton$Reisekosten"
    entity = pressedButtonValue[25:]
    print(entity)
    dialogflowResponse = dialogflowHelper.detect_intent_texts(entity)
    return run(dialogflowResponse)
