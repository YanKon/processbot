import sys
import json
from google.protobuf.json_format import MessageToJson
from app.models import Process, Edge, GeneralInstruction
from app.utils import responseHelper, buttons


def run(dialogflowResponse):

    # Okay, let's start process "Entity".
    message1 = dialogflowResponse.query_result.fulfillment_text

    # NOCH NICHT GANZ KLAR! MESSAGETOJSON
    parameters_json = json.loads(MessageToJson(
        dialogflowResponse.query_result.parameters))
    processName = parameters_json['process_name_parameter']

    # Aktuellen Prozess holen
    process = Process.query.filter_by(processName=processName).first()

    # TODO: Mehrere Startevents
    # erste Aktivität im Prozess nehmen
    firstActivityId = Edge.query.filter(Edge.sourceId.like(
        'StartEvent_%')).filter_by(processId=process.id).first().targetId

    # Generelle Anweisungen für ersten Schritt
    message2 = GeneralInstruction.query.filter_by(
        nodeId=firstActivityId).first().text

    # TODO: Besser machen bzw. irgendwoanders hinschreiben
    message3 = "When you are done press \"Yes\", should you need further assistance press \"Help\"."

    messages = [message1, message2, message3]
    return responseHelper.createResponseObject(messages, buttons.STANDARD_BUTTONS)


# TODO Chris: Hier kommt Funktion hin, die aufgerufen wird, wenn man von Buttons (Routing: Submit Button) kommt
def button_run(parameter_list):
    pass