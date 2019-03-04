import sys
import json
from google.protobuf.json_format import MessageToJson
from app.models import Process,Edge

def run(dialogflowResponse):
    # print("####################### process_run start")
    
    # NOCH NICHT GANZ KLAR! MESSAGETOJSON
    parameters_json = json.loads(MessageToJson(dialogflowResponse.query_result.parameters))
    processName = parameters_json['process_name_parameter']

    process = Process.query.filter_by(processName=processName).first()
    print(process.id)
    edges = Edge.query.filter_by(processId=process.id).all()
    print(edges)
    return ""