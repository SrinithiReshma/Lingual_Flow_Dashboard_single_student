from flask import Flask, request, jsonify
from flask_cors import CORS
import math
from appwrite.client import Client
from appwrite.query import Query
from appwrite.services.databases import Databases
import datetime
import tempfile
import requests
import whisper
import os
import nltk
import google.generativeai as genai
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk import pos_tag
import re
from bs4 import BeautifulSoup
from googlesearch import search
from sentence_transformers import SentenceTransformer
from scipy.spatial.distance import cosine
from pydub import AudioSegment, silence
from gtts import gTTS
from fastdtw import fastdtw
from scipy.spatial.distance import euclidean
import speech_recognition as sr
import librosa
import spacy
nlp = spacy.load("en_core_web_sm")

embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
# One-time downloads
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('averaged_perceptron_tagger') 
nltk.download('punkt_tab')
nltk.download('averaged_perceptron_tagger_eng')
app = Flask(__name__)
CORS(app)


genai.configure(api_key="AIzaSyCbzwmZgzmrz_YajlMLXOhTc-GvVo6FfYI")



# ✅ Custom temp directory (to avoid permission issues in admin mode)
custom_temp_dir = "C:\\Temp"
os.makedirs(custom_temp_dir, exist_ok=True)
tempfile.tempdir = custom_temp_dir  # override default temp dir

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')  # For dev only
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS')
    return response

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
    
    collection_name = f"{custom_name}"

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
    
@app.route('/collection/<collection_id>', methods=['GET'])
def get_collection_data(collection_id):
    try:
        response = databases.list_documents(
            database_id="67d5be53002f133cb332",
            collection_id=collection_id
        )
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    


@app.route('/get-collections', methods=['GET'])
def get_collections():
    try:
        response = databases.list_collections(database_id)
        collections = response["collections"]
        EXCLUDED_COLLECTION_ID = "67f3ae5300238195f90b"

        result = [
            {"id": col["$id"], "name": col["name"]}
            for col in collections if col["$id"] != EXCLUDED_COLLECTION_ID
        ]

        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/students/<document_id>', methods=['PATCH'])
def update_student_audio_url(document_id):
    data = request.get_json()
    audio_url = data.get('audio_url')
    collection_id = data.get('collectionId')

    if not collection_id or not audio_url:
        return jsonify({"error": "collectionId and audio_url are required"}), 400

    try:
        databases.update_document(
            database_id=database_id,
            collection_id=collection_id,
            document_id=document_id,
            data={"audio_url": audio_url}
        )
        return jsonify({"message": "Audio URL updated successfully."}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def transcribe_audio(file_path):
    print("🧠 Transcribing audio with Whisper...")
    model = whisper.load_model("medium.en")  # Use "base", "small", etc., for lighter model
    result = model.transcribe(file_path)
    return result["text"]
def generate_vocabulary_suggestions(transcript: str) -> str:
    model = genai.GenerativeModel("gemini-1.5-flash")
    prompt = (
        "The transcript given is a transcript of a speaker who knows only basic English, "
        "so I need you to give some words that can be used instead of others. "
        "Don't give any other content."
        f"\n\nText: {transcript}"
    )
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print("❌ Error generating vocabulary suggestions:", e)
        return ""
def load_standard_vocab():
    try:
        with open("words_alpha.txt", "r", encoding="utf-8") as f:
            return set(word.strip().lower() for word in f)
    except FileNotFoundError:
        print("Error: words_alpha.txt not found.")
        return set()
def calculate_fluency_score(audio_file_path: str) -> float:
    audio = AudioSegment.from_wav(audio_file_path)
    silent_ranges = silence.detect_silence(
        audio,
        min_silence_len=200,
        silence_thresh=-45
    )
    # convert ms to s
    timestamps = [(start/1000, end/1000) for start, end in silent_ranges]

    fluency_scores = {
        "Native-like fluency (micro-pause)": 5,
        "Mild hesitation (acceptable)": 4,
        "Noticeable hesitation (possible disfluency)": 3,
        "Fluency breakdown (disrupts communication)": 2,
        "Major hesitation (fluency issue)": 1,
    }

    score_list = []
    for start, end in timestamps:
        dur = end - start
        if   dur <= 0.3:  level = "Native-like fluency (micro-pause)"
        elif dur <= 0.7:  level = "Mild hesitation (acceptable)"
        elif dur <= 1.0:  level = "Noticeable hesitation (possible disfluency)"
        elif dur <= 1.5:  level = "Fluency breakdown (disrupts communication)"
        else:             level = "Major hesitation (fluency issue)"
        score_list.append(fluency_scores[level])

    # average, or perfect 5 if no silences detected
    avg = sum(score_list)/len(score_list) if score_list else 5
    # map from 1–5 into 0–100
    return round(((avg - 1) / 4) * 100, 1)


def preprocess_text(text):
    tokens = word_tokenize(text.lower())
    words = [word for word in tokens if word.isalpha()]
    
    stop_words = set(stopwords.words("english"))
    filtered_words = [word for word in words if word not in stop_words]

    # Remove proper nouns (NNP, NNPS)
    tagged = pos_tag(filtered_words)
    clean_words = [word for word, tag in tagged if tag not in ("NNP", "NNPS")]
    
    return clean_words

def calculate_standard_scores(total_words, unique_words):
    if total_words == 0:
        return {"TTR": 0, "Lexical Density": 0, "Herdan’s C": 0, "Guiraud’s Index": 0}

    ttr = unique_words / total_words
    lexical_words = total_words * 0.6
    lexical_density = (lexical_words / total_words) * 100
    herdans_c = math.log(unique_words) / math.log(total_words) if total_words > 1 else 0
    guiraud_index = unique_words / math.sqrt(total_words)

    return {
        "TTR": round(ttr, 4),
        "Lexical Density (%)": round(lexical_density, 2),
        "Herdan’s C": round(herdans_c, 4),
        "Guiraud’s Index": round(guiraud_index, 4)
    }

def calculate_final_score(metrics):
    ttr_score = metrics["TTR"] * 30
    lexical_density_score = metrics["Lexical Density (%)"] * 0.3
    herdans_score = metrics["Herdan’s C"] * 20
    guiraud_score = metrics["Guiraud’s Index"] * 5
    return round(ttr_score + lexical_density_score + herdans_score + guiraud_score, 2)

def categorize_errors(analysis_result: str):
    minor, moderate, major = 0, 0, 0
    for line in analysis_result.split("\n"):
        if "->" in line:
            error, _ = line.split("->", 1)
            error = error.strip().lower()
            if any(k in error for k in [" is ", " was ", " did ", " has ", " have ", " in ", " on ", " at "]):
                minor += 1
            elif len(error.split()) == 2:
                moderate += 1
            elif len(error.split()) > 2:
                major += 1
    return minor, moderate, major

def calculate_grammar_score(transcript: str, minor: int, moderate: int, major: int) -> float:
    total_words = len(transcript.split())
    if total_words == 0:
        return 100.0
    raw = 100 - (minor * 1) - (moderate * 3) - (major * 5)
    return round(max(10.0, raw), 1)

def grammar_suggestions_only(transcript: str) -> str:
    model = genai.GenerativeModel("gemini-1.5-flash")
    prompt = (
        "Identify incorrect words/phrases and suggest corrections in this transcript.\n"
        "Output format: 'Incorrect -> Correct'.\n\n"
        f"Transcript:\n{transcript}"
    )
    try:
        return model.generate_content(prompt).text.strip()
    except Exception as e:
        print("❌ Error generating grammar suggestions:", e)
        return ""
def google_search(topic, num_results=5):
    return list(search(topic, num_results=num_results, lang="en"))

def scrape_text(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        resp = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(resp.text, "html.parser")
        for tag in soup(["script", "style"]):
            tag.extract()
        text = soup.get_text(separator=" ")
        return re.sub(r'\s+', ' ', text).strip()[:2000]
    except Exception as e:
        print(f"Failed to scrape {url}: {e}")
        return ""

def compute_similarity(text1, text2):
    emb1 = embedding_model.encode(text1, convert_to_numpy=True)
    emb2 = embedding_model.encode(text2, convert_to_numpy=True)
    return 1 - cosine(emb1, emb2)

def compare_with_online_sources(topic, transcript):
    urls = google_search(topic)
    sims = []
    for url in urls:
        txt = scrape_text(url)
        if txt:
            sims.append((url, compute_similarity(transcript, txt)))
    return sims

def calculate_top_score(similarity_scores):
    if not similarity_scores:
        return 0.0
    top = max(score for _, score in similarity_scores)
    return round(top * 100, 1)

def vocabulary_analysis(text):
    words = preprocess_text(text)
    total_words = len(words)
    unique_words = len(set(words))
    standard_vocab = load_standard_vocab()
    valid_unique_words = len(set(words).intersection(standard_vocab))
    metrics = calculate_standard_scores(total_words, valid_unique_words)
    vocab_score = min(100,calculate_final_score(metrics))

    return {
        "Total Words (after stopwords & proper nouns removed)": total_words,
        "Unique Words (in Standard Vocabulary)": valid_unique_words,
        **metrics,
        "Vocabulary Score (out of 100)": vocab_score
    }

def generate_reference_audio(text, filename="reference.wav"):
    tts = gTTS(text=text, lang='en')
    tts.save(filename)
    return filename

def extract_mfcc(audio_path):
    try:
        y, sr = librosa.load(audio_path, sr=16000)
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        return mfcc.T
    except Exception as e:
        print(f"❌ Error extracting MFCC: {str(e)}")
        return None

def remove_proper_nouns(text):
    doc = nlp(text)
    return " ".join([token.text for token in doc if token.pos_ != "PROPN"])

def filter_words(word):
    doc = nlp(word)
    for token in doc:
        if token.is_stop or token.pos_ == "PROPN":
            return False
    if re.search(r'\d', word):
        return False
    return True

def compare_audio(reference_audio, user_audio, reference_text):
    ref_mfcc = extract_mfcc(reference_audio)
    user_mfcc = extract_mfcc(user_audio)

    if ref_mfcc is None or user_mfcc is None:
        return 0, []

    distance, _ = fastdtw(ref_mfcc, user_mfcc, dist=euclidean)
    print(f"📏 DTW Distance: {distance}")

    # Shorter scoring range
    if distance < 250000:
        pronunciation_score = 100
    elif distance < 300000:
        pronunciation_score = 85
    elif distance < 450000:
        pronunciation_score = 75
    elif distance < 560000:
        pronunciation_score = 60
    elif distance < 650000:
        pronunciation_score = 40
    else:
        pronunciation_score = 20

    

    return pronunciation_score

def calculate_cefr_score(fluency, pronunciation, grammar, vocabulary, context):
    # Define weightage
    weightage = {
        "fluency": 0.30,
        "pronunciation": 0.25,
        "grammar": 0.20,
        "vocabulary": 0.15,
        "context": 0.10
    }

    # Calculate weighted score
    total_score = (
        fluency * weightage["fluency"] +
        pronunciation * weightage["pronunciation"] +
        grammar * weightage["grammar"] +
        vocabulary * weightage["vocabulary"] +
        context * weightage["context"]
    )

    # Map score to CEFR Level
    if total_score >= 90:
        cefr_level = "C2 (Proficient)"
    elif total_score >= 80:
        cefr_level = "C1 (Advanced)"
    elif total_score >= 70:
        cefr_level = "B2 (Upper-Intermediate)"
    elif total_score >= 60:
        cefr_level = "B1 (Intermediate)"
    elif total_score >= 50:
        cefr_level = "A2 (Elementary)"
    else:
        cefr_level = "A1 (Beginner)"

    return total_score, cefr_level

# Assign grade based on CEFR Level
def assign_grade(cefr_level):
    grade_mapping = {
        "C2 (Proficient)": "A",
        "C1 (Advanced)": "A",
        "B2 (Upper-Intermediate)": "B",
        "B1 (Intermediate)": "C",
        "A2 (Elementary)": "D",
        "A1 (Beginner)": "F"
    }
    return grade_mapping.get(cefr_level, "F")




# ✅ Transcribe route
@app.route("/transcribe", methods=["POST"])
def transcribe():
    data = request.get_json()
    student_id = data.get("studentId")
    audio_url = data.get("audioURL")
    collection_id = data.get("collectionId")

    if not student_id or not audio_url or not collection_id:
        return jsonify({"error": "studentId, audioURL, and collectionId are required"}), 400

    try:
        # ✅ Download the audio file
        response = requests.get(audio_url)
        response.raise_for_status()

        # ✅ Use fixed temp directory
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False, dir=custom_temp_dir) as temp_audio:
            temp_audio.write(response.content)
            temp_audio.flush()
            audio_path = temp_audio.name

        # ✅ Transcribe the audio
        transcription = transcribe_audio(audio_path)
        vocab_results = vocabulary_analysis(transcription)
        vocab_score = vocab_results["Vocabulary Score (out of 100)"]
        suggestions = generate_vocabulary_suggestions(transcription)
        grammar_sugg = grammar_suggestions_only(transcription)
        minor, moderate, major = categorize_errors(grammar_sugg)
        grammar_score = calculate_grammar_score(transcription, minor, moderate, major)
        grammar_score_int = int(grammar_score) 
        topic = data.get("topic") or transcription.split(".")[0]
        sims = compare_with_online_sources(topic, transcription)
        context_score = int(calculate_top_score(sims))
        fluency_score = calculate_fluency_score(audio_path)
        fluency_int   = int(fluency_score)
        reference_audio_path = generate_reference_audio(transcription)
        print(reference_audio_path)
        pronunciation_score = compare_audio(reference_audio_path, audio_path, transcription)
        total_score, cefr_level=calculate_cefr_score(fluency_score, pronunciation_score, grammar_score, vocab_score, context_score)
        grade = assign_grade(cefr_level)


        # ✅ Remove temp file after transcription
        if os.path.exists(audio_path):
            os.remove(audio_path)

        # ✅ Update student's document in Appwrite
        databases.update_document(
            database_id=database_id,
            collection_id=collection_id,
            document_id=student_id,
            data={
                "transcribe_txt": transcription,
                "vocab_score": int(vocab_score),
                "vocab_suggestion": suggestions,
                "grammar_score":    grammar_score,
                "grammar_suggestion": grammar_sugg,
                "context_score":        context_score,
                "fluency_score":       fluency_int,
                "pronunciation_score": int(pronunciation_score),
                "total_score":int(total_score),
                "grade":grade

            }
        )

        return jsonify({"message": "Transcription saved.", "transcription": transcription,"vocab_analysis": vocab_results}), 200

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
