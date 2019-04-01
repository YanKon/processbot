import os

import threading
import time

from app.models import Process
import config as con

processGlobal= ["Reisekosten","Test"]

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
            bpmnResourcesFolder = con.basedir + "/app/static/resources"
            processesList = []
            for process in Process.query.all():
                processesList.append((process.processName, process.importDate))
            # processGlobal = processesList

            for process in processesList:
                if (process[1] == None):
                    print(process[0] + " importDate: none")
                else:
                    print(process[0] + " importDate: " + process[1])

            for filename in os.listdir(bpmnResourcesFolder):
                if filename.endswith(".bpmn"):
                    print((os.path.join(bpmnResourcesFolder, filename)))
                else:
                    continue

            time.sleep(self.interval)

# example = ThreadingExample()
# time.sleep(3)
# print('Checkpoint')
# time.sleep(2)
# print('Bye')