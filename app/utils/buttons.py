STANDARD_RUN_BUTTONS = [
    {
        "text": "Yes",
        "value": "process_run_yes"
        # "icon": "check"

    },
    {
        "text": "Help",
        "value": "process_run_help"
        # "icon": "question"
    },
    {
        "text": "Cancel",
        "value": "process_run_cancel",
        "cssClass": 'cancelButton'
        # "icon": "times"
    }
]

REDUCED_RUN_BUTTONS = [
    {
        "text": "Yes",
        "value": "process_run_yes"
        # "icon": "check"
    },
    {
        "text": "Cancel",
        "value": "process_run_cancel",
        "cssClass": 'cancelButton'
        # "icon": "times"
    }
]

CANCEL_RUN_BUTTON = [
     {
        "text": "Cancel",
        "value": "process_run_cancel",
        "cssClass": 'cancelButton'
    }
]

CANCEL_SHOW_BUTTON = [
    {
        "text": "Cancel",
        "value": "process_show_cancel",
        "cssClass": 'cancelButton'
    }
]

CANCEL_NAMES_BUTTON = [
    {
        "text": "Cancel",
        "value": "process_names_cancel",
        "cssClass": 'cancelButton'
    }
]

CANCEL_DOC_BUTTON = [
    {
        "text": "Cancel",
        "value": "process_doc_cancel",
        "cssClass": 'cancelButton'
    }
]

# INTENT IMMER OHNE "process_"
def createCustomButton(buttonText, intent, value):
    button = {
        "text": buttonText,
        "value": intent + "$customButton$" + value
        }
    return button
