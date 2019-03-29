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
        message2 = "These are the processes I can help you with:"
        runButtons = []
        for process in Process.query.all():
            button = buttons.createCustomButton(process.processName,"process_run", process.processName)
            runButtons.append(button)
        runButtons.extend(buttons.CANCEL_RUN_BUTTON)
        messages = [message1, message2]
        return responseHelper.createResponseObject(messages,runButtons,"","","")
    
    # erste Aktivität im Prozess nehmen
    firstActivityId = Edge.query.filter(Edge.sourceId.like(
        'StartEvent_%')).filter_by(processId=process.id).first().targetId
    previousStepId = Edge.query.filter(Edge.processId == process.id).filter(Edge.targetId == firstActivityId).first().sourceId

   
    message1 = dialogflowResponse.query_result.fulfillment_text # Okay, let's start process "Entity".
    message2 = GeneralInstruction.query.filter_by(nodeId=firstActivityId).first().text # Generelle Anweisungen für ersten Schritt
    message3 = "When you are done press \"Yes\", should you need further assistance press \"Help\"." # TODO: Besser machen bzw. irgendwoanders hinschreiben
    messages = [message1, message2, message3]
    
    currentProcess = processId
    currentProcessStep = firstActivityId
    previousProcessStep = previousStepId

    return responseHelper.createResponseObject(messages, buttons.STANDARD_RUN_BUTTONS,currentProcess, currentProcessStep,previousProcessStep)


# Weg: man kommt hier her über submit_button(JS) --> send_button(PY Route) --> triggerButtonFunction (ButtonDict)
def button_run(pressedButtonValue, currentProcess, currentProcessStep, previousProcessStep):

    # Aktueller Prozesslauf abrechen
    if pressedButtonValue == "process_run_cancel":
        try:
            processName = Process.query.filter_by(id=currentProcess).first().processName
            message = "Okay, the current process instance of process \"" + processName + "\" will be canceled."
        except: # kein Prozessname
            message = "Alright, the request will be canceled."
        return responseHelper.createResponseObject([message],[],"","","")    
    
    # Gebe die DetailInstruction aus
    elif pressedButtonValue == "process_run_help":
      
        message = DetailInstruction.query.filter_by(nodeId=currentProcessStep).first().text # Detail Anweisungen für aktuellen Schritt
        return responseHelper.createResponseObject([message],buttons.REDUCED_RUN_BUTTONS,currentProcess, currentProcessStep, previousProcessStep)
    
    else: # Nächster Schritt --> "process_run_yes"

        nextActivityId = Edge.query.filter(Edge.sourceId == currentProcessStep).filter_by(processId=currentProcess).first().targetId
        
        # Wenn ein Fehler fliegt, dann gibt es keine Anweisung mehr für die Activity --> Ende erreicht
        try:
            message = GeneralInstruction.query.filter_by(nodeId=nextActivityId).first().text # Generelle Anweisungen für den nächsten Schritt
        except:
            print("End of process reached")
            processName = Process.query.filter_by(id=currentProcess).first().processName
            message = "You have successfully gone through the process \"" + processName + "\"."
            return responseHelper.createResponseObject([message], [], "", "", "")

        return responseHelper.createResponseObject([message], buttons.STANDARD_RUN_BUTTONS, currentProcess, nextActivityId, currentProcessStep)

# Weg: man kommt hier her über submit_button(JS) --> send_button(PY Route) --> triggerButtonFunction (customButtonDict)
def customButton_run(pressedButtonValue, currentProcess, currentProcessStep, previousProcessStep):
     # zB. CustomButtonValue = "process_run$customButton$Reisekosten"
    entity = pressedButtonValue[26:]
    dialogflowResponse = dialogflowHelper.detect_intent_texts(entity)
    return run(dialogflowResponse)
