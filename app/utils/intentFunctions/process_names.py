import sys
from app.models import Process

def run(dialogflowResponse):
    message = "There is:"
    for process in Process.query.all():
        message = message + " \"" + process.processName + "\","
    message = message.replace(message[len(message)-1], '.')
    return message