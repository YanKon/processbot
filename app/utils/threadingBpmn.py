import os

import threading
import time
import config as con

from app.models import Process


processGlobalImport= []
processGlobalUpdate= []

class ThreadingBpmn(object):
    """ Threading example class
    The run() method will be started and it will run in the background
    until the application exits.
    """

    def __init__(self, interval=10):
        """ Constructor
        :type interval: int
        :param interval: Check interval, in seconds
        """
        self.interval = interval
        thread = threading.Thread(target=self.run, args=())
        thread.daemon = True    # Daemonize thread
        thread.start()          # Start the execution

    def run(self):

        """ Method that runs forever """
        while True:
            global processGlobalImport
            global processGlobalUpdate
            processGlobalImport = []
            processGlobalUpdate = []
            bpmnResourcesFolder = con.basedir + "/app/static/resources/bpmn"

            for filename in os.listdir(bpmnResourcesFolder):
                if filename.endswith(".bpmn"):
                    # TODO: prozessName aus BPMN Datei holen (ReadFileName funktion schreiben)
                    processName = filename.split(".")[0]
                    process = Process.query.filter_by(processName = processName).first()

                    if (process == None):
                        print("There is a new process: " + filename)
                        processGlobalImport.append(processName)
                        continue
                        
                    path = (os.path.join(bpmnResourcesFolder, filename))
                    importDate = os.stat(path)[-2]

                    if (importDate == process.importDate):
                        print("Process '" + process.processName + "' is up-to-date.")
                    else:
                        print("Process '" + process.processName + "' has updates.")
                        processGlobalUpdate.append(process.processName)
                    
                else:
                    continue

            time.sleep(self.interval)

# example = ThreadingExample()
# time.sleep(3)
# print('Checkpoint')
# time.sleep(2)
# print('Bye')