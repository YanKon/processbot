from app.utils.intentFunctions import triggerButtonFunction

STANDARD_PROCESS_BUTTONS = [
    {
        "text": "Yes",
        "value": "Process_pressed_yes",
        # "icon": "check"

    },
    {
        "text": "Help",
        "value": "Process_pressed_help",
        # "icon": "question"
    },
    {
        "text": "Cancel",
        "value": "Process_pressed_cancel",
        "cssClass": 'cancelButton',
        # "icon": "times"
    }
]

REDUCED_PROCESS_BUTTONS = [
    {
        "text": "Yes",
        "value": "Process_pressed_yes",
        # "icon": "check"
    },
    {
        "text": "Cancel",
        "value": "Process_pressed_cancel",
        "cssClass": 'cancelButton',
        # "icon": "times"
    }
]

CANCEL_PROCESS_BUTTON = [
     {
        "text": "Cancel",
        "value": "Process_pressed_cancel",
        "cssClass": 'cancelButton',
        # "icon": "times"
    }
]

def createCustomButtonList(buttonTextList):

    buttons = []
    for buttonText in buttonTextList:
        button = {
            "text": buttonText,
            "value": "Button_pressed_" + buttonText
            }
        buttons.append(button)
    return buttons

def createCustomButtonWithValue(buttonText, buttonValue):
    button = {
        "text": buttonText,
        "value": buttonValue
        }
    return button
