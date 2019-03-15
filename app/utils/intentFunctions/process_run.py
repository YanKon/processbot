import sys
import json
from google.protobuf.json_format import MessageToJson
from app.models import Process, Edge, GeneralInstruction, DetailInstruction
from app.utils import responseHelper, buttons

# Weg: man kommt hier her über submit_message(JS) --> send_userText(PY Route)
def run(dialogflowResponse):

    # NOCH NICHT GANZ KLAR! MESSAGETOJSON
    # TODO: Error wenn kein Parameter vorhanden!! --> zB. bei der Anfrage: "start process"
    parameters_json = json.loads(MessageToJson(
        dialogflowResponse.query_result.parameters))
    processName = parameters_json['process_name_parameter']

    # Aktuellen Prozess holen
    process = Process.query.filter_by(processName=processName).first()
    processId = process.id

    # TODO: Mehrere Startevents
    # erste Aktivität im Prozess nehmen
    firstActivityId = Edge.query.filter(Edge.sourceId.like(
        'StartEvent_%')).filter_by(processId=process.id).first().targetId

   
    message1 = dialogflowResponse.query_result.fulfillment_text # Okay, let's start process "Entity".
    message2 = GeneralInstruction.query.filter_by(nodeId=firstActivityId).first().text # Generelle Anweisungen für ersten Schritt
    message3 = "When you are done press \"Yes\", should you need further assistance press \"Help\"." # TODO: Besser machen bzw. irgendwoanders hinschreiben
    messages = [message1, message2, message3]
    
    currentProcess = processId
    currentProcessStep = firstActivityId

    print(currentProcessStep)

    return responseHelper.createResponseObject(messages, buttons.STANDARD_PROCESS_BUTTONS,currentProcess, currentProcessStep)


# Weg: man kommt hier her über submit_button(JS) --> send_button(PY Route)
def button_run(pressedButtonValue, currentProcess, currentProcessStep):
    
    processName = Process.query.filter_by(id=currentProcess).first().processName

    # Aktueller Prozesslauf abrechen
    if pressedButtonValue == "Process_pressed_cancel":
        message = "Okay, the current process instance of process \"" + processName + "\" will be canceled."
        return responseHelper.createResponseObject([message],[],"","")
    
    # Gebe die DetailInstruction aus
    elif pressedButtonValue == "Process_pressed_help":
      
        message = DetailInstruction.query.filter_by(nodeId=currentProcessStep).first().text # Detail Anweisungen für aktuellen Schritt
        return responseHelper.createResponseObject([message],buttons.REDUCED_PROCESS_BUTTONS,currentProcess, currentProcessStep)
    
    else: # Nächster Schritt --> "Process_pressed_yes"

        nextActivityId = Edge.query.filter(Edge.sourceId == currentProcessStep).filter_by(processId=currentProcess).first().targetId
        
        # Wenn ein Fehler fliegt, dann gibt es keine Anweisung mehr für die Activity --> Ende erreicht
        try:
            message = GeneralInstruction.query.filter_by(nodeId=nextActivityId).first().text # Generelle Anweisungen für den nächsten Schritt
        except:
            print("End of process reached")
            message = "You have successfully gone through the process \"" + processName + "\"."
            return responseHelper.createResponseObject([message], [], "", "")

        return responseHelper.createResponseObject([message], buttons.STANDARD_PROCESS_BUTTONS, currentProcess, nextActivityId)
