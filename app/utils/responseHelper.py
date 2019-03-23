from flask import jsonify


def createResponseObject(messages, buttons, currentProcess, currentProcessStep, previousProcessStep):

    responseObject = {
            "messages": messages,
            "buttons": buttons,
            "currentProcess": currentProcess,
            "currentProcessStep": currentProcessStep,
            "previousProcessStep": previousProcessStep
       }

    return jsonify(responseObject)

# TODO createErrorResponseObject