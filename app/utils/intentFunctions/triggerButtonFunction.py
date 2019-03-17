import sys
from app.utils.intentFunctions import process_names, process_run
from app.utils import responseHelper

# Mapt alle Buttons einer entsprechenden Button-Funktion
# TODO: Hier eventuell andere Lösung anstatt Dict
buttonDict = {
    # Process Fälle zusammenfassen
    "Process_pressed_yes": process_run,
    "Process_pressed_help": process_run,
    "Process_pressed_cancel": process_run
}

# Führt die jeweiligen Button-Funktion aus
# Input: pressedButtonValue, currentProcess, currentProcessStep, previousProcessStep
# Ouput: ResponseObject
def run(pressedButtonValue, currentProcess, currentProcessStep, previousProcessStep):
    
    if pressedButtonValue in buttonDict:
        # print("button exists")
        return buttonDict.get(pressedButtonValue).button_run(pressedButtonValue, currentProcess, currentProcessStep, previousProcessStep)
    else:  
        # print ("button does not exist, add it to the ButtonDict!")
        # TODO: Output überlegen, dürfte aber eigentlich nie passieren.
        return responseHelper.createResponseObject(["Error: Button does not exist, please add it to the buttonDict!"],[],"","","")

