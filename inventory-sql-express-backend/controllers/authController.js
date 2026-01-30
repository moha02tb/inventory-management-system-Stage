const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Define a secret key for JWT (must be provided in .env)
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not set. Please configure it in your .env file.');
}

const pickFirst = (req, keys) => {
    for (const key of keys) {
        if (req.body[key] !== undefined && req.body[key] !== null && `${req.body[key]}`.trim() !== '') {
            return req.body[key];
        }
    }
    return undefined;
};

// =======================================================
// 1. REGISTER USER (Inscription)
// =======================================================
exports.registerUser = async (req, res) => {
    const nom = pickFirst(req, ['nom', 'name']);
    const email = pickFirst(req, ['email']);
    const motDePasse = pickFirst(req, ['motDePasse', 'password']);
    const { role } = req.body;

    if (!nom || !email || !motDePasse) {
        return res.status(400).json({ msg: 'Name, email, and password are required.' });
    }

    try {
        // 1. Check if user already exists
        // FIX: Changed $1 to ? for mysql2 compatibility
        const [userExists] = await db.query('SELECT * FROM utilisateur WHERE email = ?', [email]);
        if (userExists.length > 0) { // Check length property of the rows array
            return res.status(400).json({ msg: 'User already exists' });
        }

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(motDePasse, salt);

        // 3. Insert user into the database
        // FIX: Changed $1, $2, $3, $4 to ?, ?, ?, ? for mysql2 compatibility.
        // NOTE: MySQL does not support 'RETURNING', so we only insert.
        const [insertResult] = await db.query(
            'INSERT INTO utilisateur (nom, email, motDePasse, role) VALUES (?, ?, ?, ?)',
            [nom, email, hashedPassword, role || 'staff'] // Default role is 'staff'
        );

        // To get the inserted user data, you can look up by email again or use the insertId.
        // For simplicity, we just confirm success.
        
        res.status(201).json({ 
            msg: 'User registered successfully', 
            // In a real app, you would fetch the full user record here or return a subset.
            // For now, we return a basic structure.
            user: { id: insertResult.insertId, nom, email, role: role || 'staff' }
        });

    } catch (err) {
        console.error('Registration error:', err.message);
        res.status(500).send('Server error');
    }
};

// =======================================================
// 2. LOGIN USER (Connexion)
// =======================================================
exports.loginUser = async (req, res) => {
    const email = pickFirst(req, ['email']);
    const motDePasse = pickFirst(req, ['motDePasse', 'password']);

    if (!email || !motDePasse) {
        return res.status(400).json({ msg: 'Email and password are required.' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM utilisateur WHERE email = ?', [email]);
        const user = rows[0];

        // *** STEP 1: Check if user was found ***
        console.log('--- LOGIN DEBUG START ---');
        if (!user) {
            console.log('DEBUG: User not found in DB.');
            console.log('--- LOGIN DEBUG END ---'); // End log here for clarity
            return res.status(400).json({ msg: 'Invalid credentials (Email)' });
        }
        
        console.log('DEBUG: User FOUND. Email:', user.email, 'ID:', user.id);

        // 2. Compare Password (unhash and check)
        const dbHash = user.motDePasse;
        
        console.log('DEBUG: Incoming Plain Password:', motDePasse);
        console.log('DEBUG: Stored DB Hash Value:', dbHash);

        // Check for empty or malformed hash before calling bcrypt
        if (!dbHash || typeof dbHash !== 'string' || dbHash.length < 50) {
            console.error('DEBUG ERROR: Stored hash is invalid or missing.');
            console.log('--- LOGIN DEBUG END ---'); // End log here for clarity
            return res.status(500).json({ msg: 'Server error: Invalid password data stored.' });
        }

        const isMatch = await bcrypt.compare(motDePasse, dbHash);

        // *** STEP 2: Check the comparison result ***
        console.log('DEBUG: bcrypt.compare result:', isMatch);
        

        if (!isMatch) {
            console.log('--- LOGIN DEBUG END ---'); // End log here for clarity
            return res.status(400).json({ msg: 'Invalid credentials (Password)' });
        }

        console.log('DEBUG: Password is a match. Generating token.');
        console.log('--- LOGIN DEBUG END ---');
        
        // 3. Generate JWT Token
        const payload = {
            user: {
                id: user.id,
                role: user.role, // Crucial for authorization checks later!
                name: user.nom
            }
        };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '1h' }, // Token expires in 1 hour
            (err, token) => {
                if (err) throw err;
                res.json({ token }); // Send the token back to the client
            }
        );
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).send('Server error');
    }
};

// =======================================================
// 3. GET ALL EMPLOYEES (Admin only)
// =======================================================
exports.getAllEmployees = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, nom, email, role FROM utilisateur WHERE role IN (?, ?) ORDER BY id DESC',
            ['employee', 'staff']
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ msg: 'Error fetching employees' });
    }
};

// =======================================================
// 4. CREATE EMPLOYEE (Admin only)
// =======================================================
exports.createEmployee = async (req, res) => {
    const { nom, email, motDePasse, role } = req.body;

    try {
        // Validate required fields
        if (!nom || !email || !motDePasse) {
            return res.status(400).json({ msg: 'All fields are required' });
        }

        // Check if email already exists
        const [userExists] = await db.query(
            'SELECT id FROM utilisateur WHERE email = ?',
            [email]
        );
        if (userExists.length > 0) {
            return res.status(400).json({ msg: 'Email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(motDePasse, salt);

        // Insert employee
        const [result] = await db.query(
            'INSERT INTO utilisateur (nom, email, motDePasse, role) VALUES (?, ?, ?, ?)',
            [nom, email, hashedPassword, role || 'employee']
        );

        res.status(201).json({
            msg: 'Employee created successfully',
            employee: { id: result.insertId, nom, email, role: role || 'employee' }
        });
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({ msg: 'Error creating employee' });
    }
};

// =======================================================
// 5. UPDATE EMPLOYEE (Admin only)
// =======================================================
exports.updateEmployee = async (req, res) => {
    const { id } = req.params;
    const { nom, email, motDePasse, role } = req.body;

    try {
        // Validate required fields
        if (!nom || !email) {
            return res.status(400).json({ msg: 'Name and email are required' });
        }

        // Check if email is taken by another user
        const [emailCheck] = await db.query(
            'SELECT id FROM utilisateur WHERE email = ? AND id != ?',
            [email, id]
        );
        if (emailCheck.length > 0) {
            return res.status(400).json({ msg: 'Email already in use' });
        }

        // If password is provided, hash it; otherwise, don't update it
        if (motDePasse) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(motDePasse, salt);
            await db.query(
                'UPDATE utilisateur SET nom = ?, email = ?, motDePasse = ?, role = ? WHERE id = ?',
                [nom, email, hashedPassword, role || 'employee', id]
            );
        } else {
            await db.query(
                'UPDATE utilisateur SET nom = ?, email = ?, role = ? WHERE id = ?',
                [nom, email, role || 'employee', id]
            );
        }

        res.json({ msg: 'Employee updated successfully' });
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ msg: 'Error updating employee' });
    }
};

// =======================================================
// 6. DELETE EMPLOYEE (Admin only)
// =======================================================
exports.deleteEmployee = async (req, res) => {
    const { id } = req.params;

    try {
        // Prevent deletion of admin accounts
        const [user] = await db.query(
            'SELECT role FROM utilisateur WHERE id = ?',
            [id]
        );

        if (user.length === 0) {
            return res.status(404).json({ msg: 'Employee not found' });
        }

        if (user[0].role === 'admin') {
            return res.status(403).json({ msg: 'Cannot delete admin accounts' });
        }

        // Delete the employee
        const [result] = await db.query(
            'DELETE FROM utilisateur WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Employee not found' });
        }

        res.json({ msg: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ msg: 'Error deleting employee' });
    }
};
