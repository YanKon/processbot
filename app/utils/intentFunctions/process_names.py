from app.models import Process
from flask import jsonify
from app.utils import responseHelper, dialogflowHelper
from app.utils import buttons as buttons
from app.utils.intentFunctions import process_run


def run(dialogflowResponse):

    message1 = "The buttons below represent the processes I can help you with. To start a process simply press the respective button."
 
    processButtons = []
    for process in Process.query.all():
        button = buttons.createCustomButton(process.processName,"process_names",process.processName)
        processButtons.append(button)
    processButtons.extend(buttons.CANCEL_NAMES_BUTTON)

    return responseHelper.createResponseObject([message1],processButtons,"","","","")

# Weg: man kommt hier her über submit_button(JS) --> send_button(PY Route) --> triggerButtonFunction (ButtonDict)
def button_run(pressedButtonValue, currentProcess, currentProcessName, currentProcessStep, previousProcessStep):
    if pressedButtonValue == "process_names_cancel":
        message = "Alright, the request will be canceled."
        return responseHelper.createResponseObject([message],[],"","","","")   
    else:
        #TODO RAISE ERROR RESPONSEOBJECT 
        pass

# Weg: man kommt hier her über submit_button(JS) --> send_button(PY Route) --> triggerButtonFunction (customButtonDict)
def customButton_run(pressedButtonValue, currentProcess, currentProcessName, currentProcessStep, previousProcessStep):
    # zB. CustomButtonValue = "process_names$customButton$Reisekosten"
    entity = pressedButtonValue[27:]
    # Wenn auf ein ProzessButton geklickt wurde, dann starte den Prozess --> process_run
    dialogflowResponse = dialogflowHelper.detect_intent_texts("run process " + entity)
    return process_run.run(dialogflowResponse)

    
