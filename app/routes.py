import os

from flask import render_template, request, jsonify
from app import app
from app.models import Process, Node

import app.utils.dialogflowHelper as dialogflowHelper
import app.utils.intentFunctions.triggerIntentFunction as triggerIntentFunction

PROJECT_ID = os.environ.get("PROJECT_ID")
PROCESS_NAME_ENTITY_TYPE_ID = os.environ.get("PROCESS_NAME_ENTITY_TYPE_ID")
TASK_NAME_ENTITY_TYPE_ID = os.environ.get("TASK_NAME_ENTITY_TYPE_ID")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/init")
def initDialogflow():

    for process in Process.query.all():
        processName = process.processName
        #print(processName)
        dialogflowHelper.create_entity(PROJECT_ID,PROCESS_NAME_ENTITY_TYPE_ID,processName,[])

    for task in Node.query.filter_by(type="task"):
        taskName = task.name
        print(taskName)
        dialogflowHelper.create_entity(PROJECT_ID,TASK_NAME_ENTITY_TYPE_ID,taskName,[])
    
    return render_template("index.html")

@app.route('/send_message', methods=["POST"])
def send_message():
    message = request.form["message"]
    response = dialogflowHelper.detect_intent_texts(PROJECT_ID, "unique", message, 'en')
    
    text = triggerIntentFunction.main(response)
    # text = execIntentFunc(response.query_result.intent.display_name)
    if (text == ""):
        responseMessage = {"responseMessage": response.query_result.fulfillment_text}
    else:
        responseMessage = {"responseMessage": text}

    return jsonify(responseMessage)

