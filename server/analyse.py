import sys
from appwrite.client import Client
from appwrite.services.databases import Databases
from fastapi import Query
import google.generativeai as genai

# Appwrite setup
client = Client()
client.set_endpoint("https://cloud.appwrite.io/v1")
client.set_project("67d5bc1d002708a5e2b8")
client.set_key("standard_849d30cfda41bec486c6cc6abbbffa650686f26fd69e3e76e6a8ebcea3cc02df1ed74daec826e4e5cc3eccb438be781f8e751ad7fad17074222134d9a8ed15c155f5beed2a68a9282d2bea4435683fe5dd4887b79bd0e264880a1b1b8d8b328746cded7335cf8a8247c4cd01a5fd07c10ee60cce46dd0317874f6ce26e6b97c9")
databases = Databases(client)

genai.configure(api_key="AIzaSyCbzwmZgzmrz_YajlMLXOhTc-GvVo6FfYI")  # Set your Gemini API key

def run_analysis(student_id, collection_id):
    try:
        # 1. Retrieve transcription from Appwrite
        student = databases.list_documents(
            "67d5be53002f133cb332",
            collection_id,
            queries=[Query.equal("$id", student_id)]
        )

        if not student["documents"]:
            print("Student not found.")
            return

        transcription_text = student["documents"][0].get("transcribe_txt", "")
        if not transcription_text:
            print("No transcription found.")
            return

        # 2. Generate vocabulary suggestions using Gemini
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = (
            "The transcript given is a transcript of a speaker who knows only basic English, "
            "so I need you to give some words that can be used instead of others. "
            "Don't give any other content.\n\n"
            f"Text: {transcription_text}"
        )

        response = model.generate_content(prompt)
        suggestion = response.text

        # 3. Update Appwrite with suggestions
        databases.update_document(
            "67d5be53002f133cb332",
            collection_id,
            student_id,
            { "vocab_suggestion": suggestion }
        )

        print("Vocabulary suggestion updated.")

    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    # Retrieve student_id and collection_id from command line arguments
    if len(sys.argv) != 3:
        print("Usage: analyse.py <student_id> <collection_id>")
        sys.exit(1)

    student_id = sys.argv[1]
    collection_id = sys.argv[2]

    run_analysis(student_id, collection_id)

