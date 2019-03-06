import sys
from app.models import Process
from flask import jsonify
from app.utils import responseHelper


def run(dialogflowResponse):

    message = "There is:"
    for process in Process.query.all():
        message = message + " \"" + process.processName + "\","
    message = message.replace(message[len(message)-1], '.')

    return responseHelper.createResponseObject([message])
