const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ============================================
// UPDATE YOUR MONGODB PASSWORD HERE
// ============================================
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD || 'aye@#.com';

const uri = `mongodb+srv://irelandembassy:aye@#.com@irelandembassy.zil0sky.mongodb.net/?appName=irelandembassy`;

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
    }
}

app.post('/api/register', upload.single('photo'), async (req, res) => {
    try {
        const formData = JSON.parse(req.body.formData);
        const registration = {
            applicationId: 'IRE-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
            applicant: {
                fullName: formData.applicant.fullName,
                address: formData.applicant.address,
                nationality: formData.applicant.nationality,
                age: formData.applicant.age,
                dateOfBirth: formData.applicant.dateOfBirth,
                placeOfBirth: formData.applicant.placeOfBirth,
                occupation: formData.applicant.occupation,
                idNumber: formData.applicant.idNumber,
                formDate: formData.applicant.formDate,
                weight: formData.applicant.weight,
                height: formData.applicant.height,
                phone: formData.applicant.phone
            },
            nextOfKin: {
                name: formData.nextOfKin.name,
                address: formData.nextOfKin.address,
                region: formData.nextOfKin.region,
                subcity: formData.nextOfKin.subcity,
                nationality: formData.nextOfKin.nationality,
                idNumber: formData.nextOfKin.idNumber,
                phone: formData.nextOfKin.phone
            },
            signature: {
                applicantSignature: formData.signature.applicantSignature,
                witnessSignature: formData.signature.witnessSignature
            },
            photo: req.file ? { data: req.file.buffer.toString('base64'), contentType: req.file.mimetype } : null,
            status: 'pending',
            createdAt: new Date()
        };
        const result = await registrationsCollection.insertOne(registration);
        res.json({ success: true, applicationId: registration.applicationId });
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/registrations', async (req, res) => {
    try {
        const registrations = await registrationsCollection.find({}).sort({ createdAt: -1 }).toArray();
        res.json({ success: true, data: registrations });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/registration/:id', async (req, res) => {
    try {
        await registrationsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/stats', async (req, res) => {
    const total = await registrationsCollection.countDocuments();
    res.json({ success: true, stats: { total } });
});

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`\n🚀 Server running on http://localhost:${PORT}`);
        console.log(`📍 Registration: http://localhost:${PORT}`);
        console.log(`📍 Admin: http://localhost:${PORT}/admin\n`);
    });
});