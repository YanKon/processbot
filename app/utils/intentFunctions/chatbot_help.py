from app.utils import responseHelper

# Weg: man kommt hier her über submit_message(JS) --> send_userText(PY Route)
def run(dialogflowResponse):
    # TODO implement a better way to show example commands
    message1 = "These are some commands you could type in, if you need support with your processes:"
    message2 = "Start process \"Reisekosten\""
    message3 = "What do I have to do at step \"Name eintragen\" in process \"Reisekosten\"?"
    message4 = "Which processes can you help me with?"
    messages = [message1,message2,message3,message4]
    return responseHelper.createResponseObject(messages,[],"","","")

# Weg: man kommt hier her über submit_button(JS) --> send_button(PY Route) --> triggerButtonFunction (ButtonDict)
def button_run(pressedButtonValue, currentProcess, currentProcessStep, previousProcessStep):
    pass

# Weg: man kommt hier her über submit_button(JS) --> send_button(PY Route) --> triggerButtonFunction (customButtonDict)
def customButton_run(pressedButtonValue, currentProcess, currentProcessStep, previousProcessStep):
    pass