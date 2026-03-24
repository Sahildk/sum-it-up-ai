from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from string import punctuation
from collections import defaultdict

# Need to ensure datasets are downloaded
try:
    nltk.download('punkt', quiet=True)
    nltk.download('punkt_tab', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('averaged_perceptron_tagger', quiet=True)
except Exception as e:
    print(f"Error downloading NLTK datasets: {e}")

app = FastAPI(title="AI Text Summarizer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SummaryRequest(BaseModel):
    text: str
    sentences_count: int = 3

class SummaryResponse(BaseModel):
    summary: str
    original_length: int
    summary_length: int

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Text Summarizer API. Use POST /summarize"}

@app.post("/summarize", response_model=SummaryResponse)
def summarize_text(request: SummaryRequest):
    text = request.text
    if not text or len(text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    # Step 1: Tokenization
    sentences = sent_tokenize(text)
    if len(sentences) <= request.sentences_count:
        return SummaryResponse(
            summary=text,
            original_length=len(sentences),
            summary_length=len(sentences)
        )

    # Step 2: Preprocessing - Lowercase and Stopword Removal
    stop_words = set(stopwords.words('english')).union(set(punctuation))
    
    # Step 3: Word Frequency Analysis
    word_frequencies = defaultdict(int)
    for sentence in sentences:
        words = word_tokenize(sentence.lower())
        for word in words:
            if word not in stop_words:
                word_frequencies[word] += 1

    # Normalize frequencies relative to the most frequent word
    if not word_frequencies:
        return SummaryResponse(
            summary=text,
            original_length=len(sentences),
            summary_length=len(sentences)
        )
    max_frequency = max(word_frequencies.values())
    for word in word_frequencies.keys():
        word_frequencies[word] = word_frequencies[word] / max_frequency

    # Step 4: Sentence Scoring
    sentence_scores = defaultdict(float)
    for i, sentence in enumerate(sentences):
        words = word_tokenize(sentence.lower())
        for word in words:
            if word in word_frequencies:
                # We also keep track of the sentence index to retain chronological order
                sentence_scores[(i, sentence)] += word_frequencies[word]

    # Step 5: Summary Generation
    # Sort sentences by their score in descending order
    sorted_sentences = sorted(sentence_scores.items(), key=lambda x: x[1], reverse=True)
    
    # Pick the top N sentences
    top_sentences = sorted_sentences[:request.sentences_count]
    
    # Re-order the top sentences chronologically (by their original index)
    top_sentences = sorted(top_sentences, key=lambda x: x[0][0])
    
    # Construct the final summary
    final_summary = " ".join([item[0][1] for item in top_sentences])

    return SummaryResponse(
        summary=final_summary,
        original_length=len(sentences),
        summary_length=len(top_sentences)
    )
