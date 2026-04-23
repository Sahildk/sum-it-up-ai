from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from string import punctuation
from collections import defaultdict
import math
from typing import List

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
    threshold_multiplier: float = 1.2
    method: str = "word_frequency"

class SentenceScoreData(BaseModel):
    sentence: str
    score: float

class SummaryResponse(BaseModel):
    summary: str
    original_length: int
    summary_length: int
    method_used: str
    sentence_scores: List[SentenceScoreData] = []

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Text Summarizer API. Use POST /summarize"}

def extract_top_sentences(sentence_scores, request, sentences):
    # Calculate average score for threshold
    total_score = sum(sentence_scores.values())
    average_score = total_score / len(sentence_scores) if len(sentence_scores) > 0 else 0
    threshold = average_score * request.threshold_multiplier

    # Pick sentences above the threshold
    top_sentences = [item for item in sentence_scores.items() if item[1] >= threshold]

    # Fallback if threshold is too strict (e.g. all sentences are close to average)
    if len(top_sentences) == 0 and len(sentence_scores) > 0:
        sorted_sentences = sorted(sentence_scores.items(), key=lambda x: x[1], reverse=True)
        top_sentences = sorted_sentences[:1]

    # Re-order the top sentences chronologically (by their original index)
    top_sentences = sorted(top_sentences, key=lambda x: x[0][0])
    
    # We still sort all sentences to send back the analytical scores
    sorted_sentences = sorted(sentence_scores.items(), key=lambda x: x[1], reverse=True)
    
    # Construct the final summary
    final_summary = " ".join([item[0][1] for item in top_sentences])

    scores_list = [
        {"sentence": item[0][1], "score": round(float(item[1]), 4)}
        for item in sorted_sentences
    ]
    return final_summary, top_sentences, scores_list

@app.post("/summarize", response_model=SummaryResponse)
def summarize_text(request: SummaryRequest):
    text = request.text
    if not text or len(text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    # Step 1: Tokenization
    sentences = sent_tokenize(text)
    if len(sentences) <= 1:
        return SummaryResponse(
            summary=text,
            original_length=len(sentences),
            summary_length=len(sentences),
            method_used=request.method
        )

    # Step 2: Preprocessing - Lowercase and Stopword Removal
    stop_words = set(stopwords.words('english')).union(set(punctuation))
    
    sentence_scores = defaultdict(float)

    if request.method == "tfidf":
        # TF-IDF Method
        # 1. Calculate Term Frequencies per sentence
        tf_data = [] # List of word counts per sentence
        doc_frequencies = defaultdict(int) # Sentences containing each word
        
        for sentence in sentences:
            words = word_tokenize(sentence.lower())
            word_counts = defaultdict(int)
            unique_words = set()
            for word in words:
                if word not in stop_words:
                    word_counts[word] += 1
                    unique_words.add(word)
            tf_data.append(word_counts)
            for word in unique_words:
                doc_frequencies[word] += 1

        total_sentences = len(sentences)

        # 2. Score sentences with TF-IDF
        for i, sentence in enumerate(sentences):
            word_counts = tf_data[i]
            total_words_in_sentence = sum(word_counts.values())
            for word, count in word_counts.items():
                # Term Frequency (normalized to length of sentence)
                tf = count / total_words_in_sentence if total_words_in_sentence > 0 else 0
                # Inverse Document Frequency (penalizes common words)
                idf = math.log(total_sentences / doc_frequencies[word]) if doc_frequencies[word] > 0 else 0
                sentence_scores[(i, sentence)] += tf * idf
                
    else:
        # Default: Word Frequency Method (Existing logic)
        word_frequencies = defaultdict(int)
        for sentence in sentences:
            words = word_tokenize(sentence.lower())
            for word in words:
                if word not in stop_words:
                    word_frequencies[word] += 1

        if not word_frequencies:
            return SummaryResponse(
                summary=text,
                original_length=len(sentences),
                summary_length=len(sentences),
                method_used=request.method
            )
            
        max_frequency = max(word_frequencies.values())
        for word in word_frequencies.keys():
            word_frequencies[word] = word_frequencies[word] / max_frequency

        for i, sentence in enumerate(sentences):
            words = word_tokenize(sentence.lower())
            for word in words:
                if word in word_frequencies:
                    sentence_scores[(i, sentence)] += word_frequencies[word]

    # Step 5: Extract top sentences
    final_summary, top_sentences, scores_list = extract_top_sentences(sentence_scores, request, sentences)

    return SummaryResponse(
        summary=final_summary,
        original_length=len(sentences),
        summary_length=len(top_sentences),
        method_used=request.method,
        sentence_scores=scores_list
    )