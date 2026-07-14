import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Resume from '../models/Resume.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const exportPDF = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume || !resume.structuredData) return res.status(404).json({ message: 'Structured resume data not found' });

    const data = resume.structuredData;
    // Generate simple HTML template for PDF
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; line-height: 1.6; padding: 40px; color: #333; }
            h1 { font-size: 24px; text-align: center; margin-bottom: 5px; }
            .contact { text-align: center; font-size: 12px; color: #666; margin-bottom: 20px; }
            h2 { font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 20px; }
            .job-title { font-weight: bold; }
            .date { float: right; color: #666; }
            .company { font-style: italic; }
            ul { margin-top: 5px; padding-left: 20px; }
          </style>
        </head>
        <body>
          <h1>${data.basics?.name || 'Resume'}</h1>
          <div class="contact">
            ${data.basics?.email || ''} | ${data.basics?.phone || ''} | ${data.basics?.location?.city || ''}
          </div>
          
          <h2>Summary</h2>
          <p>${data.basics?.summary || ''}</p>
          
          <h2>Experience</h2>
          ${(data.work || []).map(w => `
            <div>
              <span class="job-title">${w.position}</span>
              <span class="date">${w.startDate} - ${w.endDate}</span>
              <div class="company">${w.name}</div>
              <ul>
                ${(w.highlights || []).map(h => `<li>${h}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
          
          <h2>Education</h2>
          ${(data.education || []).map(e => `
            <div>
              <span class="job-title">${e.institution}</span>
              <span class="date">${e.startDate} - ${e.endDate}</span>
              <div class="company">${e.studyType} in ${e.area}</div>
            </div>
          `).join('')}
          
          <h2>Skills</h2>
          <p>${(data.skills || []).map(s => s.name).join(', ')}</p>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', margin: { top: '20px', bottom: '20px' } });
    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="resume.pdf"',
      'Content-Length': pdfBuffer.length
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Failed to generate PDF' });
  }
};

export const exportDOCX = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume || !resume.structuredData) return res.status(404).json({ message: 'Structured resume data not found' });

    const templateType = req.query.template || 'modern';
    const data = resume.structuredData;

    // Define font family based on template
    let fontFamily = 'Helvetica';
    if (templateType === 'harvard') fontFamily = 'Times New Roman';
    if (templateType === 'developer') fontFamily = 'Courier New';

    const children = [];

    // Header
    children.push(
      new Paragraph({
        text: data.basics?.name || 'Resume',
        heading: HeadingLevel.HEADING_1,
        alignment: templateType === 'harvard' ? AlignmentType.CENTER : AlignmentType.LEFT,
      }),
      new Paragraph({
        text: `${data.basics?.email || ''} | ${data.basics?.phone || ''} | ${data.basics?.location?.city || ''}`,
        alignment: templateType === 'harvard' ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { after: 400 },
      })
    );

    // Summary
    if (data.basics?.summary) {
      children.push(
        new Paragraph({
          text: 'Summary',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } },
        }),
        new Paragraph({
          text: data.basics.summary,
          spacing: { after: 200 },
        })
      );
    }

    // Experience
    if (data.work && data.work.length > 0) {
      children.push(
        new Paragraph({
          text: 'Experience',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } },
        })
      );

      for (const w of data.work) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: w.position || '', bold: true }),
              new TextRun({ text: `\t${w.startDate || ''} - ${w.endDate || ''}` }),
            ],
            tabStops: [{ type: "right", position: 9000 }],
          }),
          new Paragraph({
            children: [new TextRun({ text: w.name || '', italics: true })],
            spacing: { after: 100 },
          })
        );
        for (const h of w.highlights || []) {
          children.push(
            new Paragraph({
              text: h,
              bullet: { level: 0 },
            })
          );
        }
        children.push(new Paragraph({ spacing: { after: 100 } }));
      }
    }

    // Education
    if (data.education && data.education.length > 0) {
      children.push(
        new Paragraph({
          text: 'Education',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } },
        })
      );

      for (const e of data.education) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: e.institution || '', bold: true }),
              new TextRun({ text: `\t${e.startDate || ''} - ${e.endDate || ''}` }),
            ],
            tabStops: [{ type: "right", position: 9000 }],
          }),
          new Paragraph({
            text: `${e.studyType || ''} in ${e.area || ''}`,
            spacing: { after: 200 },
          })
        );
      }
    }

    // Skills
    if (data.skills && data.skills.length > 0) {
      children.push(
        new Paragraph({
          text: 'Skills',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } },
        }),
        new Paragraph({
          text: data.skills.map(s => s.name).join(', '),
        })
      );
    }

    const doc = new Document({
      styles: {
        default: {
          document: { run: { font: fontFamily, size: 22, color: templateType === 'developer' ? "D4D4D4" : "000000" } },
        },
        paragraphStyles: [
          {
            id: "Heading1",
            name: "Heading 1",
            basedOn: "Normal",
            next: "Normal",
            run: { size: 48, bold: true, color: templateType === 'developer' ? "569CD6" : "000000" },
          },
          {
            id: "Heading2",
            name: "Heading 2",
            basedOn: "Normal",
            next: "Normal",
            run: { size: 28, bold: true, color: templateType === 'developer' ? "C586C0" : "000000" },
          }
        ]
      },
      sections: [{
        properties: {
           page: {
             background: templateType === 'developer' ? { color: "1E1E1E" } : { color: "FFFFFF" }
           }
        },
        children,
      }],
    });

    const buf = await Packer.toBuffer(doc);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': 'attachment; filename="resume.docx"',
      'Content-Length': buf.length
    });
    res.send(buf);
  } catch (error) {
    console.error('Error generating DOCX:', error);
    res.status(500).json({ message: 'Failed to generate DOCX' });
  }
};

export const exportLaTeX = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume || !resume.structuredData) return res.status(404).json({ message: 'Structured resume data not found' });

    const data = resume.structuredData;
    
    // Generate LaTeX content
    const latexContent = `
\\documentclass[11pt,a4paper,sans]{moderncv}
\\moderncvstyle{classic}
\\moderncvcolor{blue}
\\usepackage[scale=0.75]{geometry}

\\name{${data.basics?.name?.split(' ')[0] || ''}}{${data.basics?.name?.split(' ').slice(1).join(' ') || ''}}
\\title{Resume}
\\email{${data.basics?.email || ''}}
\\phone[mobile]{${data.basics?.phone || ''}}

\\begin{document}
\\makecvtitle

\\section{Summary}
${data.basics?.summary || ''}

\\section{Experience}
${(data.work || []).map(w => `\\cventry{${w.startDate}--${w.endDate}}{${w.position}}{${w.name}}{}{}{
\\begin{itemize}
${(w.highlights || []).map(h => `\\item ${h.replace(/&/g, '\\&').replace(/%/g, '\\%')}`).join('\n')}
\\end{itemize}
}`).join('\n')}

\\section{Education}
${(data.education || []).map(e => `\\cventry{${e.startDate}--${e.endDate}}{${e.studyType} in ${e.area}}{${e.institution}}{}{}{}`).join('\n')}

\\section{Skills}
\\cvitem{Skills}{${(data.skills || []).map(s => s.name).join(', ')}}

\\end{document}
    `.trim();

    res.set({
      'Content-Type': 'application/x-tex',
      'Content-Disposition': 'attachment; filename="resume.tex"'
    });
    res.send(latexContent);
  } catch (error) {
    console.error('Error generating LaTeX:', error);
    res.status(500).json({ message: 'Failed to generate LaTeX' });
  }
};
