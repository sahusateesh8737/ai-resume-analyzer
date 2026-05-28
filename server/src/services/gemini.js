import { GoogleGenAI } from '@google/genai';

const cleanJson = (text) => {
  return text.replace(/^```json/g, '').replace(/^```/g, '').replace(/```$/g, '').trim();
};

export const analyzeResume = async (resumeText, jobDescription) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const prompt = `
    Act as an expert ATS (Applicant Tracking System) and professional recruiter.
    Analyze the following resume against the provided job description.
    
    Job Description:
    ${jobDescription}
    
    Resume Text:
    ${resumeText}
    
    Provide a detailed analysis and return the result STRICTLY as a JSON object with the following schema:
    {
      "atsScore": number (0-100),
      "matchedKeywords": [array of strings],
      "missingKeywords": [array of strings],
      "feedback": string (actionable feedback on how to improve the resume for this specific JD)
    }
    
    Do not include any markdown formatting like \`\`\`json or \`\`\` in your response. Return ONLY valid JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const textResult = cleanJson(response.text);
    return JSON.parse(textResult);
  } catch (error) {
    console.error('Error in Gemini API:', error);
    throw new Error('Failed to analyze resume with AI');
  }
};

export const generateCoverLetter = async (resumeText, jobDescription) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const prompt = `
    Act as an expert career coach and professional copywriter.
    Draft a highly personalized, professional cover letter based on the applicant's resume and the target job description.
    
    Job Description:
    ${jobDescription}
    
    Resume Text:
    ${resumeText}
    
    The cover letter should:
    1. Have a strong opening hook.
    2. Highlight relevant experience from the resume that matches the job description.
    3. Be concise, engaging, and professional.
    4. End with a strong call to action.
    
    Return ONLY the text of the cover letter. Do not include placeholders like [Your Name] if the information is available in the resume. If not available, use standard placeholders.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw new Error('Failed to generate cover letter');
  }
};

export const generateInterviewQuestions = async (resumeText, jobDescription) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const prompt = `
    Act as a senior technical recruiter and hiring manager.
    Based on the applicant's resume and the job description, generate 5 highly targeted interview questions. Focus specifically on bridging the gap between the applicant's current skills and the job's requirements, or probing deeper into relevant experiences.
    
    Job Description:
    ${jobDescription}
    
    Resume Text:
    ${resumeText}
    
    Return the result STRICTLY as a JSON array of objects with the following schema:
    [
      {
        "question": "The interview question",
        "context": "Why this question is being asked based on the resume/JD gap",
        "suggestedAnswer": "Key points the applicant should cover in their answer"
      }
    ]
    
    Do not include any markdown formatting. Return ONLY valid JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const textResult = cleanJson(response.text);
    return JSON.parse(textResult);
  } catch (error) {
    console.error('Error generating interview questions:', error);
    throw new Error('Failed to generate interview questions');
  }
};

export const checkGrammarTone = async (resumeText) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const prompt = `
    Act as an expert resume writer and editor.
    Review the following resume text specifically for tone, passive voice, weak action verbs, and grammar issues.
    
    Resume Text:
    ${resumeText}
    
    Provide a detailed critique. Highlight specific examples of passive voice or weak verbs used in the text, and suggest stronger, impact-driven alternatives. Point out any repetitive words or grammatical errors.
    Return ONLY the feedback text. Use clear paragraphs or bullet points.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error('Error checking grammar and tone:', error);
    throw new Error('Failed to check grammar and tone');
  }
};

export const auditLinkedInProfile = async (aboutText, jobDescription) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const prompt = `
    Act as an expert career coach and LinkedIn profile optimizer.
    Review the following LinkedIn "About" section against the target job description.
    
    Job Description:
    ${jobDescription}
    
    LinkedIn About Section:
    ${aboutText}
    
    Provide a detailed analysis and return the result STRICTLY as a JSON object with the following schema:
    {
      "score": number (0-100),
      "feedback": "Overall impression and specific actionable advice on how to rewrite or structure the About section to better attract recruiters for this role.",
      "missingKeywords": ["keyword1", "keyword2"]
    }
    
    Do not include any markdown formatting like \`\`\`json. Return ONLY valid JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const textResult = cleanJson(response.text);
    return JSON.parse(textResult);
  } catch (error) {
    console.error('Error auditing LinkedIn profile:', error);
    throw new Error('Failed to audit LinkedIn profile');
  }
};

export const parseToJSONResume = async (resumeText) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const prompt = `
    Extract the following resume text into a strict JSON object adhering to the open-source JSON Resume standard schema.
    If a field is not present in the text, omit it or leave it as an empty array/string. Do not invent information.
    
    Resume Text:
    ${resumeText}
    
    Required JSON Schema structure:
    {
      "basics": {
        "name": "", "label": "", "email": "", "phone": "", "url": "", "summary": "",
        "location": { "city": "", "region": "", "countryCode": "" },
        "profiles": [ { "network": "", "username": "", "url": "" } ]
      },
      "work": [ { "name": "", "position": "", "startDate": "", "endDate": "", "summary": "", "highlights": [""] } ],
      "education": [ { "institution": "", "area": "", "studyType": "", "startDate": "", "endDate": "", "score": "" } ],
      "skills": [ { "name": "", "level": "", "keywords": [""] } ],
      "projects": [ { "name": "", "description": "", "highlights": [""], "url": "" } ]
    }
    
    Return STRICTLY valid JSON without markdown tags like \`\`\`json.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Using flash instead of pro to avoid strict rate limits
      contents: prompt,
    });
    const textResult = cleanJson(response.text);
    return JSON.parse(textResult);
  } catch (error) {
    console.error('Error parsing to JSON Resume:', error);
    throw new Error('Failed to parse resume into structured data');
  }
};

export const tailorResume = async (resumeJSON, jobDescription) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const prompt = `
    Act as an expert ATS optimizer and resume writer. 
    You are given a JSON Resume object and a Target Job Description. 
    Your goal is to suggest tailored modifications to the resume to better match the job description.
    
    Target Job Description:
    ${jobDescription}
    
    Current JSON Resume:
    ${JSON.stringify(resumeJSON)}
    
    Generate a list of specific changes (diffs) to the JSON structure. 
    Only suggest changes that re-prioritize skills, rewrite the professional summary, or tweak action verbs in the work/project highlights.
    DO NOT invent fake experience or skills that the user does not have.
    
    Return STRICTLY a JSON array of diff objects with the following schema:
    [
      {
        "path": "path to the modified field (e.g., 'basics.summary' or 'work[0].highlights[1]')",
        "oldValue": "the original text",
        "newValue": "the improved, tailored text",
        "reason": "why this change improves the match for the JD"
      }
    ]
    
    Do not include markdown tags. Return ONLY valid JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const textResult = cleanJson(response.text);
    return JSON.parse(textResult);
  } catch (error) {
    console.error('Error generating AI tailored diffs:', error);
    throw new Error('Failed to tailor resume');
  }
};
