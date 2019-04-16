import sys
from app.utils.intentFunctions import process_names, process_run, process_show, process_doc, process_step, chatbot_help
from app.utils import responseHelper

# Mapt alle Button Values einer entsprechenden Button-Funktion
buttonDict = {
    # Process Fälle zusammenfassen
    "process_run_yes": process_run,
    "process_run_resume": process_run,
    "process_run_no": process_run,
    "process_run_help": process_run,
    "process_run_cancel": process_run,
    "process_show_cancel": process_show,
    "process_names_cancel": process_names,
    "process_doc_cancel": process_doc,
    "process_step_previous": process_step,
    "process_step_next": process_step,
    "process_step_cancel": process_step
}

customButtonDict = {
    "process_run": process_run,
    "process_names": process_names,
    "process_show": process_show,
    "process_doc": process_doc,
    "process_step": process_step,
    "chatbot_help": chatbot_help
}

# Führt die jeweiligen Button-Funktion aus
# Input: pressedButtonValue, currentProcess, currentProcessName, currentProcessStep, previousProcessStep
# Ouput: ResponseObject
def run(pressedButtonValue, currentProcess, currentProcessName, currentProcessStep, previousProcessStep):
    
    if pressedButtonValue in buttonDict:
        return buttonDict.get(pressedButtonValue).button_run(pressedButtonValue, currentProcess, currentProcessName, currentProcessStep, previousProcessStep)
    else:  # Button nicht im Dict --> customButton
        try: #Intent und Value aus Button holen (vgl. buttons.createCustomButton(text,intent,value))
            customButtonIntent = pressedButtonValue.split("$")[0]
        except:
            raise ValueError("Button wrong format!")

        if customButtonIntent in customButtonDict:
            return customButtonDict.get(customButtonIntent).customButton_run(pressedButtonValue, currentProcess, currentProcessName, currentProcessStep, previousProcessStep)

    #TODO Message ausgeben (Falscher Button) oder HTML Alert Fehler
    # neuer response Object Typ = Error und dann in index.js prüfen und Error anzeigen
        
    