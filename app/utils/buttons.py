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

CANCEL_PROCESS_BUTTON = [
     {
        "text": "Cancel",
        "value": "Process_pressed_cancel"
    }
]

def addCustomButtons(buttonTextList):

    buttons = []
    for buttonText in buttonTextList:
        button = {
            "text": buttonText,
            "value": "Button_pressed_" + buttonText
            }
        buttons.append(button)
    return buttons