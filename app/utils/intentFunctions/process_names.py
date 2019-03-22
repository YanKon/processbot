import sys
from app.models import Process
from flask import jsonify
from app.utils import responseHelper
from app.utils import buttons as buttons

def run(dialogflowResponse):

    message1 = "The buttons below represent the processes I can help you with. To start a process simply press the respective button."
 
    processButtons = []
    for process in Process.query.all():
        button = buttons.createCustomButtonWithValue(process.processName,"Button_pressed_start process " + process.processName)
        processButtons.append(button)
    processButtons.extend(buttons.CANCEL_PROCESS_BUTTON)

    return responseHelper.createResponseObject([message1],processButtons,"","","")

    
