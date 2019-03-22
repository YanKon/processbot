import os

from flask import render_template, request, jsonify
from app import app
from app.models import Process, Node

import app.utils.dialogflowHelper as dialogflowHelper
import app.utils.intentFunctions.triggerIntentFunction as triggerIntentFunction
import app.utils.intentFunctions.triggerButtonFunction as triggerButtonFunction

PROCESS_NAME_ENTITY_TYPE_ID = os.environ.get("PROCESS_NAME_ENTITY_TYPE_ID")
TASK_NAME_ENTITY_TYPE_ID = os.environ.get("TASK_NAME_ENTITY_TYPE_ID")

# Standard Route zum Anzeigen der Index.html
@app.route("/")
def index():
    return render_template("index.html")


# Route um Dialogflow zu initialisieren
@app.route("/init")
def initDialogflow():

    for process in Process.query.all():
        processName = process.processName
        # print(processName)
        dialogflowHelper.create_entity(PROCESS_NAME_ENTITY_TYPE_ID, processName, [])

    for task in Node.query.filter_by(type="task"):
        taskName = task.name
        print(taskName)
        dialogflowHelper.create_entity(TASK_NAME_ENTITY_TYPE_ID, taskName, [])

    return render_template("index.html")

# Route um eine Nachricht des Nutzers an Dialogflow zu schicken und dann die Bearbeitung für den Intent zu starten
@app.route('/send_userText', methods=["POST"])
def send_userText():
    userText = request.form["userText"]
    print(userText)
    dialogflowResponse = dialogflowHelper.detect_intent_texts(userText)

    responseObject = triggerIntentFunction.run(dialogflowResponse)

    return responseObject

# Route um einen gedrückten Button zu verarbeiten
@app.route('/send_button', methods=["POST"])
def send_button():
    pressedButtonValue = request.form["pressedButtonValue"]
    currentProcess = request.form["currentProcess"]
    previousProcessStep = request.form["previousProcessStep"]
    currentProcessStep = request.form["currentProcessStep"]
    
    responseObject = triggerButtonFunction.run(pressedButtonValue, currentProcess, currentProcessStep, previousProcessStep)

    return responseObject
 
