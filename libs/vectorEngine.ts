
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Client-Side Vector Search Engine
 * Implements TF-IDF (Term Frequency - Inverse Document Frequency) 
 * and Cosine Similarity for intelligent text retrieval.
 */

interface VectorDocument {
    id: string;
    text: string;
    metadata: any;
    vector: Record<string, number>;
}

const STOP_WORDS = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'to', 'in', 'of', 'for', 'with', 'by', 'that', 'this', 'it', 'or', 'as', 'be', 'are', 'i', 'me', 'my']);

export class VectorEngine {
    private documents: VectorDocument[] = [];
    private idfCache: Record<string, number> = {};
    private isDirty: boolean = false;

    constructor() {}

    /**
     * Tokenizes text into normalized terms
     */
    private tokenize(text: string): string[] {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, '') // Remove punctuation
            .split(/\s+/)
            .filter(w => w.length > 2 && !STOP_WORDS.has(w));
    }

    /**
     * Calculates Term Frequency (TF) for a document
     */
    private calculateTF(terms: string[]): Record<string, number> {
        const tf: Record<string, number> = {};
        const totalTerms = terms.length;
        
        if (totalTerms === 0) return {};

        terms.forEach(term => {
            tf[term] = (tf[term] || 0) + 1;
        });

        // Normalize
        Object.keys(tf).forEach(term => {
            tf[term] = tf[term] / totalTerms;
        });

        return tf;
    }

    /**
     * Recalculates Inverse Document Frequency (IDF) for the corpus
     */
    private calculateIDF() {
        const idf: Record<string, number> = {};
        const totalDocs = this.documents.length;
        const allTerms = new Set<string>();

        this.documents.forEach(doc => {
            Object.keys(doc.vector).forEach(term => allTerms.add(term));
        });

        allTerms.forEach(term => {
            const docsWithTerm = this.documents.filter(doc => doc.vector[term] > 0).length;
            idf[term] = Math.log(totalDocs / (1 + docsWithTerm)); // +1 smoothing
        });

        this.idfCache = idf;
        this.isDirty = false;
    }

    /**
     * Adds a document to the index
     */
    add(id: string, text: string, metadata: any = {}) {
        const terms = this.tokenize(text);
        const tf = this.calculateTF(terms);
        
        // Store TF temporarily in vector field, will apply IDF during query or bulk build
        this.documents.push({ id, text, metadata, vector: tf });
        this.isDirty = true;
    }

    /**
     * Clears the index
     */
    clear() {
        this.documents = [];
        this.idfCache = {};
        this.isDirty = false;
    }

    /**
     * Searches the index using Cosine Similarity
     */
    search(query: string, limit: number = 3): { item: VectorDocument, score: number }[] {
        if (this.documents.length === 0) return [];
        if (this.isDirty) this.calculateIDF();

        const queryTerms = this.tokenize(query);
        const queryTF = this.calculateTF(queryTerms);
        
        // Generate Query Vector (TF-IDF)
        const queryVector: Record<string, number> = {};
        let queryMagnitude = 0;

        Object.keys(queryTF).forEach(term => {
            const idf = this.idfCache[term] || 0;
            const val = queryTF[term] * idf;
            queryVector[term] = val;
            queryMagnitude += val * val;
        });
        queryMagnitude = Math.sqrt(queryMagnitude);

        if (queryMagnitude === 0) return []; // Query terms not in corpus

        // Score Documents
        const results = this.documents.map(doc => {
            let dotProduct = 0;
            let docMagnitude = 0;

            // Calculate Doc Vector (TF-IDF) on the fly for efficiency or pre-calc
            // Here we use the stored TF and cached IDF
            Object.keys(doc.vector).forEach(term => {
                const idf = this.idfCache[term] || 0;
                const val = doc.vector[term] * idf;
                docMagnitude += val * val;

                if (queryVector[term]) {
                    dotProduct += val * queryVector[term];
                }
            });
            docMagnitude = Math.sqrt(docMagnitude);

            const similarity = (docMagnitude * queryMagnitude) > 0 
                ? dotProduct / (docMagnitude * queryMagnitude) 
                : 0;

            return { item: doc, score: similarity };
        });

        // Sort by score desc
        return results
            .filter(r => r.score > 0.01) // Lower threshold for short queries
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(r => r); 
    }
}

export const vectorEngine = new VectorEngine();

/**
 * Generates a mock embedding for vector compatibility.
 * In a real backend, this would call 'text-embedding-004'.
 */
export const generateEmbedding = async (text: string): Promise<number[] | null> => {
    // Basic simulation for the vector engine interface
    return new Array(768).fill(0).map(() => Math.random());
};
