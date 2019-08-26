# pylint: disable=no-member

import os, time, datetime, sys
import config as con
import psycopg2
import xml.etree.ElementTree as ET
import psycopg2.extras
from app import db
import app.models as models

# liest ein BPMN ein und speichert es in der Prozessatenbank
def readBpmn(processName):
    
    bpmnResourcesFolder = con.basedir + "/app/static/resources/bpmn/"
    filename = processName + ".bpmn"
    path = bpmnResourcesFolder + filename

    # Versucht die Prozess Metadaten zu lesen und in Datenbank zu committen.
    try:
        tree = ET.parse(path)
        root = tree.getroot()
        
        processId = root[0].attrib['id']
        importDate = os.stat(path)[-2]

        # Process in Datenbank
        process = models.Process(id = processId, processName = processName, importDate = importDate)
        db.session.add(process)
        db.session.commit()

    except:
        # print("Error occured while trying to read the meta data (processId, processName and importDate) or commit the process to the database")    
        # return
        raise Exception("Error occured while trying to read the meta data (processId, processName and importDate) or commit the process to the database")

        
    # Versucht die Prozess Elemente zu lesen und in die Datenbank zu committen.    
    try:
        #ProcessDoc in Datenbank, hier keine ID übergeben, weil Autoincrement
        procsesDoc = models.ProcessDoc(description = root[0][0].text, processId = processId)
        db.session.add(procsesDoc)

        sequenceFlows = []
        detailInstructions = []
        instructions = []
        splitQuestions = []
        detailDescriptions = []
        buttonNames = []
        
        # iteriert über jedes Element und speichert die entsprechenden Eigenschaften eines Element
        # wie id, name und chatbot-spezifische Attribute
        for actor in root[0].iter():
            tagType = actor.tag.split("}")[1]

            # Element ist ein Task
            if (tagType == "task"):
                for attribute in actor.attrib.items():
                    attributeType = attribute[0].split("}")
                    if len(attributeType) == 2:
                        if (attributeType[1] == "detailInstruction"):
                            detailInstruction = models.DetailInstruction(text = attribute[1], nodeId = actor.attrib['id'])
                            detailInstructions.append(detailInstruction)
                        elif (attributeType[1] == "instruction"):
                            instruction = models.GeneralInstruction(text = attribute[1], nodeId = actor.attrib['id'])
                            instructions.append(instruction)
                node = models.Node(id = actor.attrib['id'], name = actor.attrib['name'], type = 'task', processId = processId)
                db.session.add(node)

            # Element ist ein StartEvent
            elif (tagType == "startEvent"):
                node = models.Node(id = actor.attrib['id'], name = actor.attrib['name'], type = 'startEvent', processId = processId)
                db.session.add(node)
            
            # Element ist ein exclusiveGateway
            elif (tagType == "exclusiveGateway"):
                # wenn exlusiveGateway kein Name hat <=> exclusiveGateway ist ein join
                if "name" not in actor.attrib:
                    node = models.Node(id = actor.attrib['id'], type = 'exclusiveGateway', processId = processId)
                    db.session.add(node)

                else:
                    node = models.Node(id = actor.attrib['id'], name = actor.attrib['name'], type = 'exclusiveGateway', processId = processId)
                    db.session.add(node)

                    for attribute in actor.attrib.items():
                        attributeType = attribute[0].split("}")
                        if len(attributeType) == 2:
                            if (attributeType[1] == "splitQuestion"):
                                splitQuestion = models.SplitQuestion(text = attribute[1], nodeId = actor.attrib['id'])
                                splitQuestions.append(splitQuestion)

            # Element ist ein intermediateThrowEvent
            elif (tagType == "intermediateThrowEvent"):
                node = models.Node(id = actor.attrib['id'], name = actor.attrib['name'], type = 'intermediateThrowEvent', processId = processId)
                db.session.add(node)

                for attribute in actor.attrib.items():
                    attributeType = attribute[0].split("}")
                    if len(attributeType) == 2:
                        print(attributeType[1])
                        if (attributeType[1] == "detailDescription"):
                            detailDescription = models.DetailDescription(text = attribute[1], nodeId = actor.attrib['id'])
                            detailDescriptions.append(detailDescription)
                        elif (attributeType[1] == "button"):
                            buttonName = models.ButtonName(text = attribute[1], nodeId = actor.attrib['id'])
                            buttonNames.append(buttonName)

            # Element ist ein endEvent 
            elif (tagType == "endEvent"):
                node = models.Node(id = actor.attrib['id'], name = actor.attrib['name'], type = 'endEvent', processId = processId)
                db.session.add(node)

            # Element ist ein sequenceFlow => spiechert die Verbindungen zu den Elementen
            elif (tagType == "sequenceFlow"):
                edge = models.Edge(id = actor.attrib['id'], processId = processId, sourceId = actor.attrib['sourceRef'], targetId = actor.attrib['targetRef'])
                sequenceFlows.append(edge)
            
        # ist nötig, weil bei jedem db.session.add() geprüft wird ob es die entsprechenden foreignkeys existieren!
        # da ein Sequenceflow insbesondere aus einer sourceId und targetId besteht müsssen erste alle Nodes in der 
        # Datenbank exisiteren, daher werden die Sequeneces in einer Liste zwischengespeichert und erst am Ende 
        # wird über diese Liste nochmal itertiert => dann alle adden und committen        
        def addToSession(elements):
            for element in elements:
                db.session.add(element)

        db.session.commit()
                
        addToSession(sequenceFlows)    
        addToSession(instructions)  
        addToSession(detailInstructions)
        addToSession(splitQuestions)
        addToSession(detailDescriptions)
        addToSession(buttonNames)  

        db.session.commit()

    # wenn es Probleme beim Import geben, Mitteilung senden    
    except:
        e = sys.exc_info()[0]
        # print("This error occured while trying to read a process Element or committing to the database:\n" + e)
        db.session.delete(process)
        db.session.commit()
        raise Exception("This error occured while trying to read a process Element or committing to the database:" + str(e))
        # return

    