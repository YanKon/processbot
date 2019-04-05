import os

import threading
import time
import config as con

from app.models import Process


processGlobal= []

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
        thread.daemon = True                            # Daemonize thread
        thread.start()                                  # Start the execution

    def run(self):

        """ Method that runs forever """
        while True:
            global processGlobal
            processGlobal = []
            bpmnResourcesFolder = con.basedir + "/app/static/resources/bpmn"
            
            processesList = []
            for process in Process.query.all():
                processesList.append((process.processName, process.importDate))
            # processGlobal = processesList

            for filename in os.listdir(bpmnResourcesFolder):
                if filename.endswith(".bpmn"):
                    processName = filename.split(".")[0]
                    process = Process.query.filter_by(processName = processName).first()

                    if (process == None):
                        print("There is a new process: " + filename)
                        processGlobal.append(processName)
                        continue
                        
                    path = (os.path.join(bpmnResourcesFolder, filename))
                    importDate = os.stat(path)[-2]

                    if (importDate == process.importDate):
                        print("Process '" + process.processName + "' is up-to-date.")
                    else:
                        print("Process '" + process.processName + "' has updates.")
                        processGlobal.append(process.processName)
                    
                else:
                    continue

            time.sleep(self.interval)

# example = ThreadingExample()
# time.sleep(3)
# print('Checkpoint')
# time.sleep(2)
# print('Bye')