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
    },
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
    },
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
    }, {
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

def addCustomButtons(buttonTextList):
    
    buttons = []
    for buttonText in buttonTextList:
        buttons.append({"text": buttonText, "value" : "pressed_" + buttonText})
    return buttons