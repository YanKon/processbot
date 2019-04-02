# https://stackoverflow.com/questions/5033547/sqlalchemy-cascade-delete

import os, time, datetime
import psycopg2
import xml.etree.ElementTree as ET
import psycopg2.extras

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
    path = "/Users/yannick/Desktop/Process_1_new.bpmn"

    tree = ET.parse(path)
    root = tree.getroot()
    
    processId = root[0].attrib['id']
    processName = path_base_name(path)
    procsesDetailInstruction = ""
    procsesGeneralInstruction = ""
    modifiedDate = os.stat(path)[-2]

    for attribute in root[0].attrib.items():
        attributeType = attribute[0].split("}")
        if len(attributeType) == 2:
            if (attributeType[1] == "detailInstruction"):
                procsesDetailInstruction = attribute[1]
            elif (attributeType[1] == "instruction"):
                procsesGeneralInstruction = attribute[1]

    try:
        connection = psycopg2.connect(user = "yannick",
                                        password = "postgres",
                                        host = "localhost",
                                        port = "5432",
                                        database = "processbottest")
        cursor = connection.cursor()

        nodes = []
        edges = []
        generalInstructions = []
        detailInstructions = []

        for actor in root[0].iter():
            tagType = actor.tag.split("}")[1]

            if (tagType == "task"):
                for attribute in actor.attrib.items():
                    attributeType = attribute[0].split("}")
                    if len(attributeType) == 2:
                        if (attributeType[1] == "detailInstruction"):
                            detailInstructions.append((attribute[1],actor.attrib['id']))
                        elif (attributeType[1] == "instruction"):
                            generalInstructions.append((attribute[1],actor.attrib['id']))
                nodes.append((actor.attrib['id'],actor.attrib['name'],'task',processId))

            elif (tagType == "startEvent"):
                nodes.append((actor.attrib['id'],actor.attrib['id'],'startEvent',processId))

            elif (tagType == "endEvent"):
                nodes.append((actor.attrib['id'],actor.attrib['id'],'endEvent',processId))

            elif (tagType == "sequenceFlow"):
                edges.append((actor.attrib['id'],processId,actor.attrib['sourceRef'],actor.attrib['targetRef']))

        # print(nodes)
        # print(edges)
        # print(generalInstructions)
        # print(detailInstructions)


        #   
        # FÜGT ALLES IN DIE DATENBANK EIN 
        #
        cursor.execute("INSERT INTO process VALUES (%s, %s, %s)",(processId, processName, modifiedDate))
        
        insert_query = 'INSERT INTO node (id, name, type, processId) VALUES %s'
        psycopg2.extras.execute_values (
            cursor, insert_query, nodes, template=None, page_size=100
        )

        insert_query = 'INSERT INTO edge (id, processid, sourceid, targetid) VALUES %s'
        psycopg2.extras.execute_values (
            cursor, insert_query, edges, template=None, page_size=100
        )

        insert_query = 'INSERT INTO general_instruction (text, nodeid) VALUES %s'
        psycopg2.extras.execute_values (
            cursor, insert_query, generalInstructions, template=None, page_size=100
        )

        insert_query = 'INSERT INTO detail_instruction (text, nodeid) VALUES %s'
        psycopg2.extras.execute_values (
            cursor, insert_query, detailInstructions, template=None, page_size=100
        )

        connection.commit()

        # Print PostgreSQL Connection properties
        # print ( connection.get_dsn_parameters(),"\n")
        # Print PostgreSQL version
        cursor.execute("SELECT version();")
        record = cursor.fetchone()
        print("\nConnected to -", record,"\n")

    except (Exception, psycopg2.Error) as error :
        print ("Error while connecting to PostgreSQL", error)
    
    finally:
        #closing database connection.
            if(connection):
                cursor.close()
                connection.close()
                print("PostgreSQL connection is closed","\n")
