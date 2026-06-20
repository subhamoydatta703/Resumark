import fs from 'node:fs/promises';
import { PDFParse } from 'pdf-parse';
import path from 'node:path';

export async function extractPDFText(filePath: string): Promise<string> {
  let parser;
  try {
    const fullPath = path.join(process.cwd(), "./public/data", filePath);
    console.log("pdf file pathshowing in utils pdf parser: ", fullPath)
    const dataBuffer = await fs.readFile(fullPath);
    
    // Instantiate using v2 structure
    parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    
    console.log('--- Parsed PDF Text ---');
    console.log(result.text);
    return result.text;
    
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw error;
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
}


