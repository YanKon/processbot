from flask import jsonify


def createResponseObject(messages, buttons = None):

    if buttons is None:
        responseObject = {
        "messages": messages
    }
    else:
        responseObject = {
            "messages": messages,
            "buttons": buttons
       }
    return jsonify(responseObject)

