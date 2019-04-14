import json
from google.protobuf.json_format import MessageToJson
from app.models import Process, Edge, Node, GeneralInstruction, DetailDescription
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
        return responseHelper.createResponseObject([message1],[],"","","","")
    
    message1 = dialogflowResponse.query_result.fulfillment_text
    message2 = GeneralInstruction.query.filter_by(nodeId=taskId).first().text # Generelle Anweisungen für gewünschten Schritt
    messages = [message1,message2]

    return responseHelper.createResponseObject(messages,buttons.STANDARD_STEP_BUTTONS,processId, processName,taskId,"")


# Weg: man kommt hier her über submit_button(JS) --> send_button(PY Route) --> triggerButtonFunction (ButtonDict)
def button_run(pressedButtonValue, currentProcess, currentProcessName, currentProcessStep, previousProcessStep):
    #TODO: Check if next Node is task!!
    # TODO: Oder ab hier mit Steps, damit auch Splits erläutert werden

    if (pressedButtonValue == "process_step_previous"):
        previousStepId = Edge.query.filter(Edge.processId == currentProcess).filter(Edge.targetId == currentProcessStep).first().sourceId
        previousStep = Node.query.filter(Node.id == previousStepId).first()

        if previousStep.type == "startEvent":
            message1 = "There is no previous step. You have reached the start of the process."
            messages = [message1]
            return responseHelper.createResponseObject(messages,buttons.NEXT_STEP_BUTTONS,currentProcess,currentProcessName,currentProcessStep,"")

        elif (previousStep.type == "task"):
            try: #Beschreibung holen
                message1 = "Alright, the previous step is: \"" + previousStep.name +"\". This is the documentation:"
                message2 = GeneralInstruction.query.filter_by(nodeId=previousStep.id).first().text # Generelle Anweisungen für vorherigen Schritt
                messages = [message1,message2]
                return responseHelper.createResponseObject(messages,buttons.STANDARD_STEP_BUTTONS,currentProcess,currentProcessName,previousStepId,"")
            except:
                message1 = "There is no documentation for this step."
                messages = [message1]
                return responseHelper.createResponseObject(messages,buttons.STANDARD_STEP_BUTTONS,currentProcess,currentProcessName,previousStepId,"")
        
        elif (previousStep.type == "exclusiveGateway"):
                message1 = "There is no documentation for this step, as this is a gateway."
                messages = [message1]
                return responseHelper.createResponseObject(messages,buttons.STANDARD_STEP_BUTTONS,currentProcess,currentProcessName,previousStepId,"")
        
        elif (previousStep.type == "intermediateThrowEvent"):
                message1 =  DetailDescription.query.filter_by(nodeId=previousStep.id).first().text
                messages = [message1]
                return responseHelper.createResponseObject(messages,buttons.STANDARD_STEP_BUTTONS,currentProcess,currentProcessName,previousStepId,"")
    
    elif (pressedButtonValue == "process_step_next"):
        nextStepId = Edge.query.filter(Edge.processId == currentProcess).filter(Edge.sourceId == currentProcessStep).first().targetId
        nextStep = Node.query.filter(Node.id == nextStepId).first()

        if nextStep.type == "endEvent":
            message1 = "There is no next step. You have reached the end of the process."
            messages = [message1]
            return responseHelper.createResponseObject(messages,buttons.PREVIOUS_STEP_BUTTONS,currentProcess,currentProcessName,currentProcessStep,"")

        elif (nextStep.type == "task"):
            try: #Beschreibung holen
                message1 = "Alright, the next step is: \"" + nextStep.name +"\". This is the documentation:"
                message2 = GeneralInstruction.query.filter_by(nodeId=nextStep.id).first().text # Generelle Anweisungen für vorherigen Schritt
                messages = [message1,message2]
                return responseHelper.createResponseObject(messages,buttons.STANDARD_STEP_BUTTONS,currentProcess,currentProcessName,nextStepId,"")
            except:
                message1 = "There is no documentation for this step."
                messages = [message1]
                return responseHelper.createResponseObject(messages,buttons.STANDARD_STEP_BUTTONS,currentProcess,currentProcessName,nextStepId,"")
        
        elif (nextStep.type == "exclusiveGateway"):
                # Was machen hier? Welchen Pfal auswählen und gehen?
                message1 = "There is no documentation for this step, as this is a gateway."
                messages = [message1]
                return responseHelper.createResponseObject(messages,buttons.STANDARD_STEP_BUTTONS,currentProcess,currentProcessName,nextStepId,"")
        
        elif (nextStep.type == "intermediateThrowEvent"):
                message1 =  DetailDescription.query.filter_by(nodeId=nextStep.id).first().text
                messages = [message1]
                return responseHelper.createResponseObject(messages,buttons.STANDARD_STEP_BUTTONS,currentProcess,currentProcessName,nextStepId,"")
    
    else: #"process_step_cancel"
        print ("end")
        message = "Alright, the request will be canceled."
        return responseHelper.createResponseObject([message],[],"","","","")


# Weg: man kommt hier her über submit_button(JS) --> send_button(PY Route) --> triggerButtonFunction (customButtonDict)
def customButton_run(pressedButtonValue, currentProcess, currentProcessName, currentProcessStep, previousProcessStep):
    pass