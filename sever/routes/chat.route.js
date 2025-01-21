const { Router } = require('express');
const multer = require('multer');
const { extractPdfData } = require('../utils/pdf-parse');
const { generateAiResponse } = require('../utils/ai-response');
const fs = require('fs');

const router = Router();

// Multer setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads');
        }
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.pdf');
    }
});

// stick to pdf only
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});


router.post('/ask-question', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'Please provide a PDF file'
            });
        }

        if (!req.body.question) {
            return res.status(400).json({
                error: 'Please provide a question'
            });
        }

        const context = await extractPdfData(req.file.path);

        if (!context) {
            return res.status(400).json({
                error: 'Error extracting data from PDF'
            });
        }

        const response = await generateAiResponse(req.body.question, context.text);


        fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting file:', err);
        });

        res.status(200).json({
            message: 'PDF processed successfully',
            response: response
        });

    } catch (err) {
        // Clean up 
        if (req.file) {
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting file:', unlinkErr);
            });
        }

        res.status(500).json({
            error: err.message || 'Error processing PDF'
        });
    }
});

// // Get all files route
// router.get('/uploads', async (req, res) => {
//     try {
//         const files = fs.readdirSync('uploads');
//         res.status(200).json({
//             message: 'Upload history retrieved',
//             files: files
//         });
//     } catch (err) {
//         res.status(500).json({
//             error: 'Error fetching upload history'
//         });
//     }
// });

module.exports = router;