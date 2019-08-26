from flask import jsonify

# erzeugt ein ResponseObjekt
def createResponseObject(messages, buttons, currentProcess, currentProcessName, currentProcessStep, previousProcessStep):

   responseObject = {
      "messages": messages,
      "buttons": buttons,
      "currentProcess": currentProcess,
      "currentProcessName": currentProcessName,
      "currentProcessStep": currentProcessStep,
      "previousProcessStep": previousProcessStep
   }

   return jsonify(responseObject)
