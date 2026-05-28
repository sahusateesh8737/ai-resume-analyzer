import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse-new');
import mammoth from 'mammoth';

export const parseResume = async (fileBuffer, mimetype) => {
  try {
    if (mimetype === 'application/pdf') {
      const data = await pdf(fileBuffer);
      return data.text;
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return result.value;
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Error parsing file:', error);
    throw new Error(`Failed to parse file: ${error.message}`);
  }
};
