STANDARD_BUTTONS = [
    {
        "text": "Yes",
        "value": "pressed_yes"
    },
    {
        "text": "Cancel",
        "value": "pressed_cancel"
    },
    {
        "text": "Help",
        "value": "pressed_help"
    }
]

def addCustomButtons(buttonTextList):
    
    buttons = []
    for buttonText in buttonTextList:
        buttons.append({"text": buttonText, "value" : "pressed_" + buttonText})
    return buttons