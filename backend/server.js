const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000', 
             'https://app-dev-assignment-5.vercel.app',
             'https://app-dev-assignment-5-m4ukyptzv-basel118200s-projects.vercel.app']
}));

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const getLastStudentID = async () => {
    const result = await db.query('SELECT MAX(id) AS lastID FROM student');
    return result.rows[0].lastid || 0;
};

const getLastteacherID = async () => {
    const result = await db.query('SELECT MAX(id) AS lastID FROM teacher');
    return result.rows[0].lastid || 0;
};

app.get('/', async (req, res) => {
    try {
        const data = await db.query("SELECT * FROM student");
        return res.json({ message: "From Backend!!!", studentData: data.rows });
    } catch (error) {
        console.error('Error fetching student data:', error);
        return res.status(500).json({ error: 'Error fetching student data' });
    }
});

app.get('/student', async (req, res) => {
    const data = await db.query("SELECT * FROM student");
    return res.json(data.rows);
});

app.get('/teacher', async (req, res) => {
    const data = await db.query("SELECT * FROM teacher");
    return res.json(data.rows);
});

app.post('/addstudent', async (req, res) => {
    try {
        const lastStudentID = await getLastStudentID();
        const nextStudentID = lastStudentID + 1;
        const sql = `INSERT INTO student (id, name, roll_number, class) VALUES ($1, $2, $3, $4)`;
        await db.query(sql, [nextStudentID, req.body.name, req.body.rollNo, req.body.class]);
        return res.json({ message: 'Data inserted successfully' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Error inserting data' });
    }
});

app.post('/addteacher', async (req, res) => {
    try {
        const lastteacherID = await getLastteacherID();
        const nextteacherID = lastteacherID + 1;
        const sql = `INSERT INTO teacher (id, name, subject, class) VALUES ($1, $2, $3, $4)`;
        await db.query(sql, [nextteacherID, req.body.name, req.body.subject, req.body.class]);
        return res.json({ message: 'Data inserted successfully' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Error inserting data' });
    }
});

app.delete('/student/:id', async (req, res) => {
    const studentId = req.params.id;
    try {
        await db.query('DELETE FROM student WHERE id = $1', [studentId]);
        const rows = await db.query('SELECT id FROM student ORDER BY id');
        for (let i = 0; i < rows.rows.length; i++) {
            await db.query('UPDATE student SET id = $1 WHERE id = $2', [i + 1, rows.rows[i].id]);
        }
        return res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Error deleting student' });
    }
});

app.delete('/teacher/:id', async (req, res) => {
    const teacherID = req.params.id;
    try {
        await db.query('DELETE FROM teacher WHERE id = $1', [teacherID]);
        const rows = await db.query('SELECT id FROM teacher ORDER BY id');
        for (let i = 0; i < rows.rows.length; i++) {
            await db.query('UPDATE teacher SET id = $1 WHERE id = $2', [i + 1, rows.rows[i].id]);
        }
        return res.json({ message: 'Teacher deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Error deleting teacher' });
    }
});

app.listen(3500, () => {
    console.log("listening on Port 3500");
});