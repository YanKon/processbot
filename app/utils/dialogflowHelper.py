import os
import dialogflow_v2 as dialogflow

PROJECT_ID = os.environ.get("PROJECT_ID")
SESSION_ID = "unique"
LANGUAGE_CODE = 'en'


def detect_intent_texts(text):
    """Returns the result of detect intent with texts as inputs.

    Using the same `session_id` between requests allows continuation
    of the conversation."""
    session_client = dialogflow.SessionsClient()

    session = session_client.session_path(PROJECT_ID, SESSION_ID)
    print('Session path: {}\n'.format(session))

    if text:
        # pylint: disable=no-member # (ignoriert die warnungen von dialogflow.types)
        text_input = dialogflow.types.TextInput(text=text, language_code=LANGUAGE_CODE)
        query_input = dialogflow.types.QueryInput(text=text_input)
        response = session_client.detect_intent(session=session, query_input=query_input)
        return response

# Insert Entities from DB
def create_entity(entity_type_id, entity_value, synonyms):
    """Create an entity of the given entity type."""
    entity_types_client = dialogflow.EntityTypesClient()

    # Note: synonyms must be exactly [entity_value] if the
    # entity_type's kind is KIND_LIST
    synonyms = synonyms or [entity_value]

    entity_type_path = entity_types_client.entity_type_path(
        PROJECT_ID, entity_type_id)
    
    # pylint: disable=no-member # (ignoriert die warnungen von dialogflow.types)
    entity = dialogflow.types.EntityType.Entity()
    entity.value = entity_value
    entity.synonyms.extend(synonyms)

    response = entity_types_client.batch_create_entities(
        entity_type_path, [entity])

    print('Entity created: {}'.format(response))
