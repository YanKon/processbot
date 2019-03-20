import os
from app.utils import responseHelper, dialogflowHelper
from app.utils.intentFunctions import process_run

PROJECT_ID = os.environ.get("PROJECT_ID")

# Weg: man kommt hier her über submit_button(JS) --> send_button(PY Route) 
# Nur bei CustomButtons
# --> gebe ButtonText an Dialogflow
def button_run(pressedButtonValue, currentProcess, currentProcessStep, previousProcessStep):
    if (pressedButtonValue.startswith("Button_pressed_")):
        selectedProcess = pressedButtonValue[16:]
        dialogflowResponse = dialogflowHelper.detect_intent_texts(PROJECT_ID, "unique", selectedProcess, 'en')
        return process_run.run(dialogflowResponse)
    else:
        return responseHelper.createResponseObject(["Error: Button does not exist, please add it to the buttonDict!"],[],"","","")


    