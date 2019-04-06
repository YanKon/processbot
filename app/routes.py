# pylint: disable=no-member
import os

from flask import render_template, request, jsonify, send_file
from app import app
from app import db 
from app.models import Process, Node

import app.utils.dialogflowHelper as dialogflowHelper
import app.utils.intentFunctions.triggerIntentFunction as triggerIntentFunction
import app.utils.intentFunctions.triggerButtonFunction as triggerButtonFunction

from app.utils import threadingBpmn
from app.utils import bpmnReader

import json

PROCESS_NAME_ENTITY_TYPE_ID = os.environ.get("PROCESS_NAME_ENTITY_TYPE_ID")
TASK_NAME_ENTITY_TYPE_ID = os.environ.get("TASK_NAME_ENTITY_TYPE_ID")

# bpmnResourcesFolder = con.basedir + "/app/static/resources"
# def checkBpmnFiles(bpmnResourcesFolder):
#     # alle aktuellen Prozessnamen aus der Datenbank laden
#     processesList = []
#     for process in Process.query.all():
#         processesList.append((process.processName, process.importDate))
    
#     for process in processesList:
#         if (process[1] == None):
#             print(process[0] + " importDate: none")
#         else:
#             print(process[0] + " importDate: " + process[1])

#     for filename in os.listdir(bpmnResourcesFolder):
#         if filename.endswith(".bpmn"):
#             print((os.path.join(bpmnResourcesFolder, filename)))
#         else:
#             continue

    # for root, dirnames, filenames in os.walk(path):
    #     for filename in filenames:
    #         process, fileType = filename.split(".")
    #         if (fileType == "bpmn"):
    #             path = os.path.join(root, filename)
    #             print((os.stat(path)[-2]))

# Standard Route zum Anzeigen der Index.html

@app.route("/")
def index():
    threadingBpmn.ThreadingBpmn()
    return render_template("index.html")

#TODO:  sich klassen angucken; => mit getMethoden aus threadingBPMN eine Prozessliste bekommen mit den Prozessen die sich geändert haben 
@app.route("/get_status_bpmnDir", methods=["POST"])
def get_status_bpmnDir():
    response = {
        "imports": threadingBpmn.processGlobalImport,
        "updates": threadingBpmn.processGlobalUpdate
    }
    return jsonify(response)
    # return jsonify([])


#TODO: datenbank mit geänderten Prozessen refreshen => aus frontend Prozess bekommen der aktualisiert werden soll
# @app.route("/update_database", methods=["POST"])
# def update_database():
#     return

@app.route("/get_image/<process>.html")
def get_image(process):
    # TODO: Welcome Messages anzeigen!
    return send_file('./static/resources/svg/'+process+'.svg', mimetype='image/svg+xml')

# Route um Dialogflow zu initialisieren
@app.route("/init")
def initDialogflow():

    processes = []
    tasks = []

    for process in Process.query.all():
        processName = process.processName
        processes.append(processName)
        dialogflowHelper.create_entity(PROCESS_NAME_ENTITY_TYPE_ID, processName, [])

    for task in Node.query.filter_by(type="task"):
        taskName = task.name
        tasks.append(taskName)
        dialogflowHelper.create_entity(TASK_NAME_ENTITY_TYPE_ID, taskName, [])

    return jsonify(processes, tasks)

# Route um eine Nachricht des Nutzers an Dialogflow zu schicken und dann die Bearbeitung für den Intent zu starten
@app.route('/send_userText', methods=["POST"])
def send_userText():
    userText = request.form["userText"]
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

# @app.route("/test")
# def test():
#     bpmnReader.readBpmn()
#     return jsonify("Success")

@app.route("/delete_database_select", methods=["POST"])
def delete_database_select():
    processName = request.form["processName"]
    process = Process.query.filter_by(processName=processName).first()
    db.session.delete(process)
    db.session.commit()
    return jsonify(processName)

@app.route("/delete_database_all", methods=["POST"])
def delete_database_all():
    for process in Process.query.all():
        db.session.delete(process)
        db.session.commit()
    return jsonify("")

@app.route("/get_all_processes", methods=["POST"])
def get_all_processes():
    processList = []
    for process in Process.query.all():
        processList.append(process.processName)
    return jsonify(processList)
    # return jsonify([])

@app.route("/import_process", methods=["POST"])
def import_process():
    processName = request.form["processName"]
    bpmnReader.readBpmn(processName)
    return jsonify(processName)