from flask import jsonify


def createResponseObject(messages, buttons, currentProcess, currentProcessStep):

    responseObject = {
            "messages": messages,
            "buttons": buttons,
            "currentProcess": currentProcess,
            "currentProcessStep": currentProcessStep
       }

    return jsonify(responseObject)

