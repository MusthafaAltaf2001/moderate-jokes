const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Constants = require('./Constants')

// Dummy user credentials (admin)
const admin = {
    email: 'admin@admin.com',
    hashedPassword: '$2a$10$.rmcDQEYzJqu5LGskbIgD.f9hqtzsMnxKMYPRhjgbO5L8ExNAQ8xW',
};

const saltRounds = 10; // Number of salt rounds for password hashing

exports.login = async (req, res) => {
    const { email, password } = req.body;
    // const hashedPassword = await bcrypt.hash(admin.password, saltRounds);
    // console.log(hashedPassword)

    // Check if email matches the admin's email
    if (email !== admin.email) return res.status(400).send('Invalid email.');


    // Check if password matches the admin's password
    const isPasswordValid = await bcrypt.compare(password, admin.hashedPassword);
    if (!isPasswordValid) return res.status(400).send('Invalid password.');

    // Generate JWT token
    const token = jwt.sign({ email: admin.email }, Constants.JWT_SECRET, { expiresIn: '1h' });
    res.header('authorization', token).send({ message: 'Logged in successfully', token });
};
