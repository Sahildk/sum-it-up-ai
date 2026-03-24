# SumItUp AI - Backend Architecture

The backend of SumItUp AI is built using **Python (FastAPI)** and relies entirely on **NLTK (Natural Language Toolkit)** to perform classical Extractive Summarization.

This means it doesn't use massive, resource-heavy LLMs (like OpenAI/ChatGPT) to generate new sentences (abstractive summarization). Instead, it uses pure mathematical algorithms to extract the most objectively critical sentences that already exist within the source text.

Here is the step-by-step breakdown of how the NLP engine processes the text:

## 1. The API Endpoint & Setup
The API exposes a `POST /summarize` route. When the frontend sends a body of text, it's captured using the `SummaryRequest` Pydantic model (which ensures the text is a valid string).

```python
sentences = sent_tokenize(text)
```
The very first action the script takes is calling NLTK’s `sent_tokenize`. This automatically breaks the massive block of text into a list of individual, distinct sentences based on punctuation structure (periods, question marks, structure, etc.).

## 2. Preprocessing & Stop Words
We don't care about grammatical filler words like "the", "and", "is", or "of." They don't carry the actual *meaning* or *subject matter* of the text.

```python
stop_words = set(stopwords.words('english')).union(set(punctuation))
```
We combine NLTK's built-in English stop words list with standard punctuation (commas, exclamation marks). We will ignore these entirely during our statistical analysis.

## 3. Word Frequency Analysis (The Core Math)
This is where the mathematical extraction begins. We loop through every single sentence, break the sentence down into individual meaningful words (`word_tokenize`), and count how many times each word appears across the entire document.

```python
word_frequencies = defaultdict(int)
for sentence in sentences:
    words = word_tokenize(sentence.lower())
    for word in words:
        if word not in stop_words:
            word_frequencies[word] += 1
```
For example, if the text is about space, the word "telescope" might appear 15 times, while the word "launched" might only appear 2 times. 

We then **normalize** these scores by dividing every word's count by the count of the *most frequent word*. This limits and scales every word to a decimal value between `0.0` and `1.0`.

## 4. Sentence Scoring
Now we run through the separated sentences one more time. During this pass, we calculate a total score for each sentence by adding up the frequency decimal values of all the words inside it.

```python
sentence_scores = defaultdict(float)
for i, sentence in enumerate(sentences):
    words = word_tokenize(sentence.lower())
    for word in words:
        if word in word_frequencies:
            # Accumulate the word's statistical value to the sentence's total score
            sentence_scores[(i, sentence)] += word_frequencies[word]
```
A sentence packed densely with "high-value" subject words (like "James Webb Space Telescope NASA") will earn a massive score, while a filler sentence (like "It is very cool to look at.") will get a very low score.

## 5. Summary Generation & Final Output
We sort the sentences by their total score from highest to lowest and extract the top `N` sentences requested.

```python
# Sort from highest score to lowest 
sorted_sentences = sorted(sentence_scores.items(), key=lambda x: x[1], reverse=True)
top_sentences = sorted_sentences[:request.sentences_count]

# Re-order chronologically based on their original index
top_sentences = sorted(top_sentences, key=lambda x: x[0][0])
```
Because the highest-scoring sentences might have been scattered randomly throughout the text (e.g., sentence 12, then sentence 2, then sentence 50), we perform a final sort based on their **original index (`i`)**. This reorganizes the extracted, high-value sentences so they read logically in the chronological order the original human author intended. 

Finally, we join the sentences together with spaces and return the final `JSON` string sequence to the frontend interface.
