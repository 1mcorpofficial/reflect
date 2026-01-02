const Response = require('../models/Response');
const ScheduledQuestionnaire = require('../models/ScheduledQuestionnaire');
const Question = require('../models/Question');
const Group = require('../models/Group');
const User = require('../models/User');
const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;
const PDFDocument = require('pdfkit');
const { logAction } = require('../services/auditService');

// Export responses as CSV
const exportCSV = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const schedule = await ScheduledQuestionnaire.findById(scheduleId)
      .populate('questions')
      .populate('groupId');
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    // Check permissions (teacher must own the schedule or be in the group's teacher)
    if (schedule.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Get all responses for this schedule
    const responses = await Response.find({ scheduledQuestionnaireId: scheduleId })
      .populate('studentId', 'name email')
      .sort({ submittedAt: 1 });

    // Get questions in order
    const questions = await Question.find({ _id: { $in: schedule.questions } })
      .sort({ order: 1 });

    // Build CSV headers
    const headers = [
      { id: 'studentName', title: 'Mokinio vardas' },
      { id: 'studentEmail', title: 'El. paštas' },
      { id: 'submittedAt', title: 'Pateikimo data' },
      { id: 'status', title: 'Būsena' },
    ];

    // Add question headers
    questions.forEach((q, idx) => {
      headers.push({ id: `question_${idx}`, title: q.questionText || `Klausimas ${idx + 1}` });
    });

    // Build CSV rows
    const rows = responses.map(response => {
      const row = {
        studentName: response.studentId?.name || 'N/A',
        studentEmail: response.studentId?.email || 'N/A',
        submittedAt: response.submittedAt ? new Date(response.submittedAt).toLocaleString('lt-LT') : 'N/A',
        status: response.status || 'submitted',
      };

      // Map answers by question ID
      const answersByQuestionId = {};
      response.answers.forEach(answer => {
        answersByQuestionId[answer.questionId.toString()] = answer;
      });

      // Add question answers
      questions.forEach((q, idx) => {
        const answer = answersByQuestionId[q._id.toString()];
        if (answer) {
          if (answer.status === 'skip') {
            row[`question_${idx}`] = '[Praleista]';
          } else if (answer.status === 'unknown') {
            row[`question_${idx}`] = '[Nežinau]';
          } else {
            // Format value based on type
            const value = answer.value;
            if (Array.isArray(value)) {
              row[`question_${idx}`] = value.join(', ');
            } else if (typeof value === 'object' && value !== null) {
              row[`question_${idx}`] = JSON.stringify(value);
            } else {
              row[`question_${idx}`] = String(value || '');
            }
          }
        } else {
          row[`question_${idx}`] = '';
        }
      });

      return row;
    });

    // Generate CSV
    const csvWriter = createCsvStringifier({
      header: headers,
    });

    const csvString = csvWriter.getHeaderString() + csvWriter.stringifyRecords(rows);

    // Log audit
    await logAction(req.user.id, 'export', 'ScheduledQuestionnaire', scheduleId, {
      format: 'csv',
      responsesCount: responses.length,
    }, req);

    // Set response headers
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="refleksijos_${scheduleId}_${Date.now()}.csv"`);
    res.send('\ufeff' + csvString); // BOM for Excel UTF-8 support
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Export responses as PDF
const exportPDF = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const schedule = await ScheduledQuestionnaire.findById(scheduleId)
      .populate('questions')
      .populate('groupId');
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    // Check permissions
    if (schedule.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Get all responses
    const responses = await Response.find({ scheduledQuestionnaireId: scheduleId })
      .populate('studentId', 'name email')
      .sort({ submittedAt: 1 });

    // Get questions in order
    const questions = await Question.find({ _id: { $in: schedule.questions } })
      .sort({ order: 1 });

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Log audit
    await logAction(req.user.id, 'export', 'ScheduledQuestionnaire', scheduleId, {
      format: 'pdf',
      responsesCount: responses.length,
    }, req);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="refleksijos_${scheduleId}_${Date.now()}.pdf"`);
    
    doc.pipe(res);

    // Title
    doc.fontSize(20).text(schedule.title, { align: 'center' });
    doc.moveDown();
    if (schedule.description) {
      doc.fontSize(12).text(schedule.description, { align: 'center' });
      doc.moveDown();
    }
    doc.fontSize(10).text(`Grupa: ${schedule.groupId?.name || 'N/A'}`, { align: 'center' });
    doc.text(`Periodas: ${new Date(schedule.startsAt).toLocaleDateString('lt-LT')} - ${new Date(schedule.endsAt).toLocaleDateString('lt-LT')}`, { align: 'center' });
    doc.moveDown(2);

    // Responses
    responses.forEach((response, idx) => {
      if (idx > 0) {
        doc.addPage();
      }

      doc.fontSize(16).text(`Mokinys: ${response.studentId?.name || 'N/A'}`, { underline: true });
      doc.fontSize(10).text(`El. paštas: ${response.studentId?.email || 'N/A'}`);
      doc.text(`Pateikimo data: ${response.submittedAt ? new Date(response.submittedAt).toLocaleString('lt-LT') : 'N/A'}`);
      doc.text(`Būsena: ${response.status || 'submitted'}`);
      doc.moveDown();

      // Map answers by question ID
      const answersByQuestionId = {};
      response.answers.forEach(answer => {
        answersByQuestionId[answer.questionId.toString()] = answer;
      });

      // Questions and answers
      questions.forEach((q, qIdx) => {
        const answer = answersByQuestionId[q._id.toString()];
        
        doc.fontSize(12).text(`${qIdx + 1}. ${q.questionText}`, { continued: false });
        
        if (answer) {
          if (answer.status === 'skip') {
            doc.fontSize(10).fillColor('gray').text('  [Praleista]');
          } else if (answer.status === 'unknown') {
            doc.fontSize(10).fillColor('gray').text('  [Nežinau]');
          } else {
            const value = answer.value;
            let answerText = '';
            if (Array.isArray(value)) {
              answerText = value.join(', ');
            } else if (typeof value === 'object' && value !== null) {
              answerText = JSON.stringify(value);
            } else {
              answerText = String(value || '');
            }
            doc.fontSize(10).fillColor('black').text(`  ${answerText}`, { 
              indent: 20,
              width: 500
            });
          }
        } else {
          doc.fontSize(10).fillColor('gray').text('  [Nėra atsakymo]');
        }
        
        doc.moveDown(0.5);
        doc.fillColor('black'); // Reset color
      });

      // Teacher comment if exists
      if (response.teacherComment?.text) {
        doc.moveDown();
        doc.fontSize(10).fillColor('blue').text('Mokytojo komentaras:', { underline: true });
        doc.text(response.teacherComment.text, { 
          indent: 20,
          width: 500
        });
        doc.fillColor('black');
      }
    });

    doc.end();
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  exportCSV,
  exportPDF,
};

