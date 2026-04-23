<div align="center">

# ✨ SumItUp AI

A cutting-edge Artificial Intelligence application that automatically extracts the most important sentences from lengthy documents, articles, and research papers using mathematical Natural Language Processing (Extractive Summarization).

[**Backend Documentation**](./backend/README.md) • [**Source Code**](./)
</div>

---

## 🚀 The Tech Stack

This project is divided into two decoupled monolithic layers: a stunning React-based frontend and a high-performance Python analytics backend.

### Frontend
- **<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nextjs/nextjs-original.svg" alt="Next.js" width="20" height="20" /> Next.js 15 (App Router)** - React server framework for optimized performance.
- **<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg" alt="Tailwind CSS" width="20" height="20" /> Tailwind CSS v4** - Incredible utility-first styling for glassmorphism and modern dark aesthetics.
- **<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" alt="Framer Motion" width="20" height="20" /> Framer Motion** - Used for the buttery smooth Chatbot interactions and typing indicator animations.
- **<img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/sparkles.svg" alt="Lucide Icons" width="20" height="20" style="filter: invert(1)" /> Lucide React** - Clean and consistent SVG iconography.

### Backend (NLP Engine)
- **<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg" alt="Python" width="20" height="20" /> Python 3** - The core language driving our NLP algorithms.
- **<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/fastapi/fastapi-original.svg" alt="FastAPI" width="20" height="20" /> FastAPI** - Lightning-fast Python web framework to handle API requests seamlessly.
- **<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/numpy/numpy-original.svg" alt="NLTK" width="20" height="20" /> NLTK (Natural Language Toolkit)** - Performs mathematical operations on raw text (extractive summarization) without needing an active internet connection to an LLM.

---

## 🧠 How the App Works (Extractive Summarization)

Instead of generating entirely new sentences like ChatGPT (Abstractive Summarization), SumItUp AI uses pure **Extractive Summarization**, parsing original documents to find the sentences that carry the highest statistical meaning. Users can toggle between **Word Frequency** and **TF-IDF** methods!

1. **Frontend Interaction**: The user enters a large block of text into the Next.js Chat Interface, selects the NLP method (Word Frequency or TF-IDF), and clicks send.
2. **Text Sent to API**: Axios sends an HTTP POST request to the local FastAPI python server running on port `8000`.
3. **Data Tokenization**: NLTK breaks the giant block of text down into individual sentences, and then further breaks those down into individual words.
4. **Noise Filtering**: Grammatical filler words ("the", "and", "is") and punctuation are stripped out the dataset entirely.
5. **Metric Calculation**: Depending on the approach, the algorithm either counts raw frequencies of subject words (Word Frequency) or evaluates uniqueness using logarithmic penalization on common document words (TF-IDF).
6. **Sentence Scoring**: The algorithm runs through the original sentences and assigns them a "density score" based on how many high-value subject words they contain.
7. **Extraction & Restructuring**: The top scoring sentences are extracted, sorted back into their chronological order, and returned as a JSON object to the beautiful frontend!

---

## 🛠️ Installation & Setup

To run this application locally, you will need to start both the Frontend and the Backend engines.

### 1. Start the API Backend
```bash
cd backend

# Create a python virtual environment
python -m venv venv
# Activate it (Windows)
.\venv\Scripts\Activate

# Install dependencies
pip install fastapi uvicorn nltk pydantic

# Start the Python local server
uvicorn main:app --reload --port 8000
```

### 2. Start the User Interface
```bash
# Open a new terminal
cd frontend

# Install Node dependencies
npm install

# Start the Next.js development server
npm run dev
```

Finally, open [`http://localhost:3000`](http://localhost:3000) in your web browser to test your new Extractive AI application!

---
> *See `/backend/README.md` for a deeper breakdown of the NLTK Math logic.*
