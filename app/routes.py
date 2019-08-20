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

# Standard Route zum Anzeigen der Index.html
@app.route("/")
def index():
    threadingBpmn.ThreadingBpmn()
    return render_template("index.html")

# Route checkt ob es neue Imports/Updates gibt
@app.route("/get_status_bpmnDir", methods=["POST"])
def get_status_bpmnDir():
    response = {
        "imports": threadingBpmn.processGlobalImport,
        "updates": threadingBpmn.processGlobalUpdate
    }
    return jsonify(response)

# Route läd Prozessmodell aus Prozessrepository
@app.route("/get_image/<process>.html")
def get_image(process):
    return send_file('./static/resources/bpmn/'+process+'.svg', mimetype='image/svg+xml')

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
    dialogflowResponse = dialogflowHelper.detect_intent_texts(userText)
    responseObject = triggerIntentFunction.run(dialogflowResponse)

    return responseObject

# Route um einen gedrückten Button zu verarbeiten
@app.route('/send_button', methods=["POST"])
def send_button():
    pressedButtonValue = request.form["pressedButtonValue"]
    currentProcess = request.form["currentProcess"]
    currentProcessName = request.form["currentProcessName"]
    previousProcessStep = request.form["previousProcessStep"]
    currentProcessStep = request.form["currentProcessStep"]
    
    responseObject = triggerButtonFunction.run(pressedButtonValue, currentProcess, currentProcessName, currentProcessStep, previousProcessStep)

    return responseObject

# Route um ausgewählte Prozesse zu löschen
@app.route("/delete_database_select", methods=["POST"])
def delete_database_select():
    processName = request.form["processName"]

    try: 
        process = Process.query.filter_by(processName=processName).first()
        delete_all_entities(process.processName)
        db.session.delete(process)
        db.session.commit()
    
        response = {
            "processName": process.processName,
            "source": "delete"
        }
        return jsonify(response)
    
    except Exception as e:
        response = {
            "message": str(e),
            "source": "import"
        }
        return jsonify(response),500
    
# Route um alle Prozesse zu löschen
@app.route("/delete_database_all", methods=["POST"])
def delete_database_all():
    deletedProcesses = []
    
    try:
        for process in Process.query.all():
            delete_all_entities(process.processName)
            db.session.delete(process)
            db.session.commit()
            deletedProcesses.append(process.processName)
            

        response = {
            "processList": deletedProcesses,
            "source": "delete"
        }
        return jsonify(response)

    except Exception as e:
        response = {
            "message": str(e),
            "source": "import"
        }
        return jsonify(response),500

# Route liefert alle Prozesse
@app.route("/get_all_processes", methods=["POST"])
def get_all_processes():
    processList = []
    for process in Process.query.all():
        processList.append(process.processName)
    return jsonify(processList)

# Route importiert die ausgewählen Prozesse
@app.route("/import_process_select", methods=["POST"])
def import_process_select():
    processName = request.form["processName"]
    try:
        bpmnReader.readBpmn(processName)
        create_all_entities(processName)
        response = {
            "processName": processName,
            "source": "import"
        }
        return jsonify(response)

    except Exception as e:
        response = {
            "message": str(e),
            "source": "import"
        }
        return jsonify(response),500

# Route importiert alle neuen Prozesse
@app.route("/import_process_all", methods=["POST"])
def import_process_all():
    processList = request.form.getlist('processList')

    try:
        for processName in processList:
            bpmnReader.readBpmn(processName)
            create_all_entities(processName)   
        response = {
            "processList": processList,
            "source": "import"
        }
        return jsonify(response)
    except Exception as e:
        response = {
            "message": str(e),
            "source": "import"
        }
        return jsonify(response),500

# Route liefert alle importierten Prozesse
@app.route("/get_all_import_processes", methods=["POST"])
def get_all_import_processes():
    response = {
        "imports": threadingBpmn.processGlobalImport,
    }
    return jsonify(response)

# Route updatet die ausgewählten Prozesse
@app.route("/update_process_select", methods=["POST"])
def update_process_select():
    processName = request.form["processName"]

    try:
        process = Process.query.filter_by(processName=processName).first()
        delete_all_entities(process.processName)
        db.session.delete(process)
        db.session.commit()
   
        bpmnReader.readBpmn(processName)
        create_all_entities(processName)

        response = {
            "processName": processName,
            "source": "update"
        }
        return jsonify(response)

    except Exception as e:
        response = {
            "message": str(e),
            "source": "update"
        }
        return jsonify(response),500

# Route updatet alle Prozesse
@app.route("/update_process_all", methods=["POST"])
def update_process_all():
    processList = request.form.getlist('processList')

    try:
        for processName in processList:
            process = Process.query.filter_by(processName=processName).first()
            delete_all_entities(process.processName)
            db.session.delete(process)
            db.session.commit()
            

        for processName in processList:
            bpmnReader.readBpmn(processName)
            create_all_entities(processName)
            
        response = {
            "processList": processList,
            "source": "update"
        }

        return jsonify(response)
    
    except Exception as e:
        response = {
            "message": str(e),
            "source": "update"
        }
        return jsonify(response),500

# Route liefert alle geupdateten Prozesse
@app.route("/get_all_update_processes", methods=["POST"])
def get_all_update_processes():
    response = {
        "updates": threadingBpmn.processGlobalUpdate,
    }
    return jsonify(response)

# Route legt in Dialogflow alle Entitys eines Prozesses an. (Schnittstelle zwischen Dialogflow & Prozessdatenbank)
def create_all_entities(processName):
    dialogflowHelper.create_entity(PROCESS_NAME_ENTITY_TYPE_ID, processName, [])

    for task in Node.query.filter_by(type="task"):
        entityName = task.name
        synonmys = [task.name]
        dialogflowHelper.create_entity(TASK_NAME_ENTITY_TYPE_ID, entityName, synonmys)
    return

# Route löscht in Dialogflow alle Entitys eines Prozesses. (Schnittstelle zwischen Dialogflow & Prozessdatenbank)
def delete_all_entities(processName):
    processId = Process.query.filter_by(processName = processName).first().id
    dialogflowHelper.delete_entity(PROCESS_NAME_ENTITY_TYPE_ID, processName)

    for task in Node.query.filter(Node.type == "task").filter_by(processId=processId):
        queryResult = Node.query.filter_by(name = task.name)
        # Wenn in unserer Datenbank ein Prozess mehrfach vorkommt, dann lösche das Entity nicht, da in Dialogflow nur eine Instanz für mehrere Prozesse
        if queryResult.count() == 1:
            dialogflowHelper.delete_entity(TASK_NAME_ENTITY_TYPE_ID, task.name)   
    return