# pylint: disable=no-member
# https://stackoverflow.com/questions/5033547/sqlalchemy-cascade-delete

import os, time, datetime
import psycopg2
import xml.etree.ElementTree as ET
import psycopg2.extras
from app import db as db
import app.models as models

# tree = ET.parse('app/static/resources/testProcess.bpmn')
# root = tree.getroot()

# for child in root[0]:
#     print(child.tag, child.attrib)


# https://stackoverflow.com/a/46811091
def file_base_name(file_name):
    if '.' in file_name:
        separator_index = file_name.index('.')
        base_name = file_name[:separator_index]
        return base_name
    else:
        return file_name

def path_base_name(path):
    file_name = os.path.basename(path)
    return file_base_name(file_name)

def readBpmn():
    filename = "Order Pizza"
    # path = "/Users/wizzy/Development/processbot/app/static/resources/bpmn/" + filename +".bpmn"
    path = "/Users/yannick/Developer/Projects/processbot/app/static/resources/bpmn/" + filename +".bpmn"

    tree = ET.parse(path)
    root = tree.getroot()
    
    processId = root[0].attrib['id']
    processName = root[0].attrib['name']
    importDate = os.stat(path)[-2]
    
    # Process in Datenbank
    process = models.Process(id = processId, processName = processName, importDate = importDate)
    db.session.add(process)
    db.session.commit()
    
    #ProcessDoc in Datenbank
    procsesDoc = models.ProcessDoc(description = root[0][0].text, processId = processId)
    db.session.add(procsesDoc)
    db.session.commit()
    
    for actor in root[0].iter():
        tagType = actor.tag.split("}")[1]

        if (tagType == "task"):
            for attribute in actor.attrib.items():
                attributeType = attribute[0].split("}")
                if len(attributeType) == 2:
                    if (attributeType[1] == "detailInstruction"):
                        detailInstruction = models.DetailInstruction(text = attribute[1], nodeId = actor.attrib['id'])
                    elif (attributeType[1] == "instruction"):
                        instruction = models.GeneralInstruction(text = attribute[1], nodeId = actor.attrib['id'])
            node = models.Node(id = actor.attrib['id'], name = actor.attrib['name'], type = 'task', processId = processId)
            db.session.add(node)
            db.session.commit()
            db.session.add(detailInstruction)
            db.session.add(instruction)
            db.session.commit()

        elif (tagType == "startEvent"):
            node = models.Node(id = actor.attrib['id'], name = actor.attrib['name'], type = 'startEvent', processId = processId)
            db.session.add(node)
            db.session.commit()
        
        elif (tagType == "exclusiveGateway"):
            # wenn exlusiveGateway kein Name hat <=> exclusiveGateway ist ein join
            if "name" not in actor.attrib:
                node = models.Node(id = actor.attrib['id'], type = 'exclusiveGateway', processId = processId)
                db.session.add(node)
                db.session.commit()

            else:
                node = models.Node(id = actor.attrib['id'], name = actor.attrib['name'], type = 'exclusiveGateway', processId = processId)
                db.session.add(node)
                db.session.commit()

                for attribute in actor.attrib.items():
                    attributeType = attribute[0].split("}")
                    if len(attributeType) == 2:
                        if (attributeType[1] == "splitQuestion"):
                            splitQuestion = models.SplitQuestion(text = attribute[1], nodeId = actor.attrib['id'])
                            db.session.add(splitQuestion)
                db.session.commit()

        elif (tagType == "intermediateThrowEvent"):
            node = models.Node(id = actor.attrib['id'], name = actor.attrib['name'], type = 'intermediateThrowEvent', processId = processId)
            db.session.add(node)
            db.session.commit()

            for attribute in actor.attrib.items():
                attributeType = attribute[0].split("}")
                if len(attributeType) == 2:
                    print(attributeType[1])
                    if (attributeType[1] == "detailDescription"):
                        detailDescription = models.DetailDescription(text = attribute[1], nodeId = actor.attrib['id'])
                        db.session.add(detailDescription)
                    elif (attributeType[1] == "button"):
                        buttonName = models.ButtonName(text = attribute[1], nodeId = actor.attrib['id'])
                        db.session.add(buttonName)
            db.session.commit()
                    
        elif (tagType == "endEvent"):
            node = models.Node(id = actor.attrib['id'], name = actor.attrib['name'], type = 'endEvent', processId = processId)
            db.session.add(node)
            db.session.commit()

        elif (tagType == "sequenceFlow"):
            edge = models.Edge(id = actor.attrib['id'], processId = processId, sourceId = actor.attrib['sourceRef'], targetId = actor.attrib['targetRef'])
            db.session.add(edge)
            db.session.commit()

    # except (Exception, psycopg2.Error) as error :
    #     print ("Error while connecting to PostgreSQL", error)
    
    # finally:
    #     #closing database connection.
    #         if(connection):
    #             cursor.close()
    #             connection.close()
    #             print("PostgreSQL connection is closed","\n")
