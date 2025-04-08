from flask import Flask, request, jsonify
from flask_cors import CORS
from appwrite.client import Client
from appwrite.services.databases import Databases
import datetime

app = Flask(__name__)
CORS(app)

client = Client()
client.set_endpoint("https://cloud.appwrite.io/v1")
client.set_project("67d5bc1d002708a5e2b8")
client.set_key("standard_849d30cfda41bec486c6cc6abbbffa650686f26fd69e3e76e6a8ebcea3cc02df1ed74daec826e4e5cc3eccb438be781f8e751ad7fad17074222134d9a8ed15c155f5beed2a68a9282d2bea4435683fe5dd4887b79bd0e264880a1b1b8d8b328746cded7335cf8a8247c4cd01a5fd07c10ee60cce46dd0317874f6ce26e6b97c9")

databases = Databases(client)
database_id = "67d5be53002f133cb332"
student_collection_id = "67f3ae5300238195f90b"

@app.route('/create-test', methods=['POST'])
def create_test():
    data = request.get_json()
    custom_name = data.get('collectionName', '')
    if not custom_name:
        return jsonify({"error": "Collection name is required"}), 400

    # Append timestamp to ensure uniqueness
    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    collection_name = f"{custom_name}_{timestamp}"

    try:
        response = databases.create_collection(
            database_id=database_id,
            collection_id="unique()",
            name=collection_name,
            permissions=[],
            document_security=True
        )
        new_collection_id = response["$id"]
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # Add attributes
    try:
        databases.create_string_attribute(database_id, new_collection_id, "student_id", 20, True)
        databases.create_string_attribute(database_id, new_collection_id, "name", 50, True)
        databases.create_string_attribute(database_id, new_collection_id, "transcribe_txt", 10000, False)
        databases.create_string_attribute(database_id, new_collection_id, "vocab_suggestion", 1000, False)
        databases.create_string_attribute(database_id, new_collection_id, "grammar_suggestion", 1000, False)
        databases.create_string_attribute(database_id, new_collection_id, "mispronounced_words", 1000, False)
        databases.create_string_attribute(database_id, new_collection_id, "grade", 10, False)
        databases.create_string_attribute(database_id, new_collection_id, "audio_url", 500, False)
        databases.create_integer_attribute(database_id, new_collection_id, "vocab_score", False)
        databases.create_integer_attribute(database_id, new_collection_id, "pronunciation_score", False)
        databases.create_integer_attribute(database_id, new_collection_id, "fluency_score", False)
        databases.create_integer_attribute(database_id, new_collection_id, "context_score", False)
        databases.create_integer_attribute(database_id, new_collection_id, "grammar_score", False)
        databases.create_integer_attribute(database_id, new_collection_id, "total_score", False)
    except Exception as e:
        return jsonify({"error": f"Collection created, but attribute creation failed: {str(e)}"}), 500

    # Fetch students
    try:
        student_docs = databases.list_documents(database_id=database_id, collection_id=student_collection_id)
        students = student_docs["documents"]
    except Exception as e:
        return jsonify({"error": f"Collection created, but failed to fetch students: {str(e)}"}), 500

    # Insert student records
    for student in students:
        try:
            databases.create_document(
                database_id=database_id,
                collection_id=new_collection_id,
                document_id="unique()",
                data={
                    "student_id": student["student_id"],
                    "name": student["name"]
                }
            )
        except:
            continue  # skip errors silently

    return jsonify({"message": f"Collection '{collection_name}' created and students added."})
@app.route('/get-student-names', methods=['POST'])
def get_student_names():
    data = request.get_json()
    collection_id = data.get('collectionId', '')

    if not collection_id:
        return jsonify({"error": "Collection ID is required"}), 400

    try:
        response = databases.list_documents(database_id=database_id, collection_id=collection_id)
        students = response["documents"]
        names = [student.get("name") for student in students if "name" in student]
        return jsonify({"students": names})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
