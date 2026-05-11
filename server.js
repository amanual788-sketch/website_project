const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname)));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

// FIXED: Properly encoded MongoDB connection string
const username = encodeURIComponent('irelandembassy');
const password = encodeURIComponent('aye@#.com');
const uri = `mongodb+srv://${username}:${password}@irelandembassy.zil0sky.mongodb.net/?retryWrites=true&w=majority&appName=irelandembassy`;

const client = new MongoClient(uri);
let database;
let registrationsCollection;

async function connectDB() {
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB successfully!');
        database = client.db('ireland_embassy_db');
        registrationsCollection = database.collection('applications');
        await registrationsCollection.createIndex({ "applicant.fullName": 1 });
        await registrationsCollection.createIndex({ "applicant.phone": 1 });
        console.log('✅ Database ready');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        console.error('Please check your MongoDB Atlas IP whitelist and credentials');
    }
}

app.post('/api/register', upload.single('photo'), async (req, res) => {
    try {
        if (!registrationsCollection) {
            throw new Error('Database not connected yet');
        }
        
        const formData = JSON.parse(req.body.formData);
        
        // Convert height and weight to numbers (double)
        const heightNum = parseFloat(formData.applicant.height);
        const weightNum = parseFloat(formData.applicant.weight);
        const ageNum = parseInt(formData.applicant.age);
        
        const registration = {
            applicationId: 'IRE-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
            applicant: {
                fullName: formData.applicant.fullName || '',
                address: formData.applicant.address || '',
                nationality: formData.applicant.nationality || 'ኢትዮጵያዊ | Ethiopian',
                age: isNaN(ageNum) ? null : ageNum,
                dateOfBirth: formData.applicant.dateOfBirth || '',
                placeOfBirth: formData.applicant.placeOfBirth || '',
                occupation: formData.applicant.occupation || '',
                idNumber: formData.applicant.idNumber || '',
                formDate: formData.applicant.formDate || '',
                weight: isNaN(weightNum) ? null : weightNum,
                height: isNaN(heightNum) ? null : heightNum,
                phone: formData.applicant.phone || ''
            },
            nextOfKin: {
                name: formData.nextOfKin.name || '',
                address: formData.nextOfKin.address || '',
                region: formData.nextOfKin.region || '',
                subcity: formData.nextOfKin.subcity || '',
                nationality: formData.nextOfKin.nationality || '',
                idNumber: formData.nextOfKin.idNumber || '',
                phone: formData.nextOfKin.phone || ''
            },
            signature: {
                applicantSignature: formData.signature.applicantSignature || '',
                witnessSignature: formData.signature.witnessSignature || ''
            },
            photo: req.file ? { 
                data: req.file.buffer.toString('base64'), 
                contentType: req.file.mimetype 
            } : null,
            status: 'pending',
            createdAt: new Date()
        };
        
        const result = await registrationsCollection.insertOne(registration);
        console.log(`✅ Registration saved: ${registration.applicationId}`);
        res.json({ success: true, applicationId: registration.applicationId });
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/registrations', async (req, res) => {
    try {
        if (!registrationsCollection) {
            throw new Error('Database not connected yet');
        }
        const registrations = await registrationsCollection.find({}).sort({ createdAt: -1 }).toArray();
        res.json({ success: true, data: registrations });
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/registration/:id', async (req, res) => {
    try {
        if (!registrationsCollection) {
            throw new Error('Database not connected yet');
        }
        await registrationsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        if (!registrationsCollection) {
            throw new Error('Database not connected yet');
        }
        const total = await registrationsCollection.countDocuments();
        res.json({ success: true, stats: { total } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n🚀 Server running on http://localhost:${PORT}`);
        console.log(`📍 Registration: http://localhost:${PORT}`);
        console.log(`📍 Admin: http://localhost:${PORT}/admin\n`);
    });
}).catch(err => {
    console.error('Failed to connect to database:', err);
    // Start server even if DB fails (will show error to users)
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n⚠️ Server running without database connection on port ${PORT}`);
    });
});