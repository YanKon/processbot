import os
from app.utils import responseHelper, dialogflowHelper
from app.utils.intentFunctions import process_run, process_show

PROJECT_ID = os.environ.get("PROJECT_ID")

# Weg: man kommt hier her über submit_button(JS) --> send_button(PY Route) 
# Nur bei CustomButtons
# --> gebe ButtonText an Dialogflow
def button_run(pressedButtonValue, currentProcess, currentProcessStep, previousProcessStep):
    
    if (pressedButtonValue.startswith("Run_CustomButton_")):
        buttonText = pressedButtonValue[18:]
        dialogflowResponse = dialogflowHelper.detect_intent_texts(buttonText)
        return process_run.run(dialogflowResponse)
    
    elif(pressedButtonValue.startswith("Show_CustomButton_")):
        buttonText = pressedButtonValue[19:]
        dialogflowResponse = dialogflowHelper.detect_intent_texts(buttonText)
        return process_show.run(dialogflowResponse)
    else:
        return responseHelper.createResponseObject(["Error: Button does not exist, please add it to the customButtonDict!"],[],"","","")


    