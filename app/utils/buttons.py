from app.utils.intentFunctions import triggerButtonFunction
STANDARD_PROCESS_BUTTONS = [
    {
        "text": "Yes",
        "value": "Process_pressed_yes"
    },
    {
        "text": "Cancel",
        "value": "Process_pressed_cancel"
    },
    {
        "text": "Help",
        "value": "Process_pressed_help"
    }
]

REDUCED_PROCESS_BUTTONS = [
    {
        "text": "Yes",
        "value": "Process_pressed_yes"
    },
    {
        "text": "Cancel",
        "value": "Process_pressed_cancel"
    }
]

def addCustomButton(buttonText, buttonValue, buttonFunction):
   
    button = {"text": buttonText, "value" : buttonValue}
    triggerButtonFunction.buttonDict[buttonValue] = buttonFunction
    return button