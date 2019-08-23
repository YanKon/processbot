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

RESUME_RUN_BUTTONS = [
    {
        "text": "Yes",
        "value": "process_run_resume"
    },
    {
        "text": "No",
        "value": "process_run_no"

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

STANDARD_STEP_BUTTONS = [
    {
        "text": "Previous Step",
        "value": "process_step_previous"
        # "icon": "check"
    },
    {
        "text": "Next Step",
        "value": "process_step_next",
        # "icon": "times"
    },
    {
        "text": "Cancel",
        "value": "process_step_cancel",
        "cssClass": 'cancelButton'
        # "icon": "times"
    }
]

NEXT_STEP_BUTTONS = [
    {
        "text": "Next Step",
        "value": "process_step_next",
        # "icon": "times"
    },
    {
        "text": "Cancel",
        "value": "process_step_cancel",
        "cssClass": 'cancelButton'
        # "icon": "times"
    }
]

PREVIOUS_STEP_BUTTONS = [
    {
        "text": "Previous Step",
        "value": "process_step_previous"
        # "icon": "check"
    },
    {
        "text": "Cancel",
        "value": "process_step_cancel",
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

def createCustomButton(buttonText, intent, value):
    button = {
        "text": buttonText,
        "value": intent + "$customButton$" + value
        }
    return button
