import axios from 'axios';

class PDFService {
    constructor() {
        this.pdfParser = null;
    }

    /**
     * Load pdf-parse dynamically
     */
    async loadPdfParser() {
        if (!this.pdfParser) {
            const module = await import('pdf-parse');
            console.log('📦 Module loaded, keys:', Object.keys(module));
            console.log('📦 module.default type:', typeof module.default);
            console.log('📦 module type:', typeof module);
            // Try different ways to access the parser
            this.pdfParser = module.default || module || (typeof module === 'function' ? module : null);
            console.log('📦 Final parser type:', typeof this.pdfParser);
        }
        return this.pdfParser;
    }

    /**
     * Extract text from PDF buffer
     */
    async extractTextFromPDF(buffer) {
        try {
            console.log('📖 Extracting text from PDF, size:', buffer.length, 'bytes');
            const parser = await this.loadPdfParser();
            console.log('📖 Parser type before call:', typeof parser);

            // If parser is still not a function, try calling it directly
            let pdfData;
            if (typeof parser === 'function') {
                pdfData = await parser(buffer);
            } else if (parser && typeof parser.default === 'function') {
                pdfData = await parser.default(buffer);
            } else {
                throw new Error('Parser is not a function: ' + typeof parser);
            }

            console.log('✅ PDF text extracted, length:', pdfData.text.length);
            return pdfData.text;
        } catch (error) {
            console.error('PDF extraction error:', error);
            throw new Error('Failed to extract text from PDF');
        }
    }

    /**
     * Extract disease from PDF text with enhanced detection
     */
    async extractDisease(text) {
        try {
            console.log('🔍 Extracting disease from text...');
            const lowerText = text.toLowerCase();

            // Check for cancer-related terms FIRST
            if (lowerText.includes('cancer') || lowerText.includes('malignancy') ||
                lowerText.includes('tumor') || lowerText.includes('carcinoma') ||
                lowerText.includes('oncology') || lowerText.includes('neoplasm')) {
                console.log('✅ Disease extracted: Cancer');
                return 'Cancer';
            }

            // Check for other diseases
            const diseaseMap = {
                'diabetes': 'Diabetes',
                'diabetic': 'Diabetes',
                'hypertension': 'Hypertension',
                'heart disease': 'Heart Disease',
                'cardiac': 'Heart Disease',
                'asthma': 'Asthma',
                'arthritis': 'Arthritis',
                'kidney disease': 'Kidney Disease',
                'renal': 'Kidney Disease',
                'liver disease': 'Liver Disease',
                'hepatic': 'Liver Disease',
                'thyroid': 'Thyroid',
                'stroke': 'Stroke',
                'pneumonia': 'Pneumonia',
                'tuberculosis': 'Tuberculosis',
                'tb': 'Tuberculosis'
            };

            for (const [keyword, disease] of Object.entries(diseaseMap)) {
                if (lowerText.includes(keyword)) {
                    console.log('✅ Disease extracted:', disease);
                    return disease;
                }
            }

            console.log('✅ Using default: General consultation');
            return 'General consultation';
        } catch (error) {
            console.error('Disease extraction error:', error);
            return 'General consultation';
        }
    }

    /**
     * Find top hospitals for a disease
     */
    async findTopHospitals(disease, city = null, limit = 5) {
        try {
            console.log('🏥 Finding hospitals for:', disease);

            // Mock hospital data
            const mockHospitals = [
                {
                    name: 'Apollo Hospitals',
                    city: 'Chennai',
                    rating: 4.8,
                    specialty: disease,
                    match_score: 0.95
                },
                {
                    name: 'Fortis Healthcare',
                    city: 'Delhi',
                    rating: 4.7,
                    specialty: disease,
                    match_score: 0.92
                },
                {
                    name: 'Max Healthcare',
                    city: 'Delhi',
                    rating: 4.6,
                    specialty: disease,
                    match_score: 0.90
                },
                {
                    name: 'Manipal Hospitals',
                    city: 'Bangalore',
                    rating: 4.5,
                    specialty: disease,
                    match_score: 0.88
                },
                {
                    name: 'Medanta - The Medicity',
                    city: 'Gurgaon',
                    rating: 4.9,
                    specialty: disease,
                    match_score: 0.87
                }
            ];

            console.log('✅ Found', mockHospitals.length, 'hospitals');
            return mockHospitals.slice(0, limit);
        } catch (error) {
            console.error('Hospital recommendation error:', error);
            return [];
        }
    }
}

export default new PDFService();
