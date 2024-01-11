const fs = require('fs');
const util = require('util');
const AppError = require('./../utils/appError');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const userDataPath = `${__dirname}/../data/users.json`

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const generateJwt = (user) => {
    const payload = {
        id: user._id,
        name: user.name,
        email: user.email
    };
    const signOptions = {
        expiresIn: '90d'
    };
    return jwt.sign(payload, 'MyVerySecrectiveSecret', signOptions)
}

exports.loginPrerequistieCheck = (req, resp, next) => {
    const {email, password} = req.body;
    if(!email || !password) {
        return next(new AppError('Please provide login credentials', 400));
    }
    next();
};

exports.login = async(req, resp) => {
    console.log(`attmepted login`);

    const rawUsers = await readFile(userDataPath);
    const registeredUsers = JSON.parse(rawUsers);

    const {email, password} = req.body;
    const user = registeredUsers.find(user => user.email == email);

    if(!user || !(await bcrypt.compare(password, user.password))) {
        return new AppError('Login failed', 401);
    }

    console.log(`Registered user ${user.name} logged in`);

    const loginJwt = generateJwt(user);
    const cookieOptions = {
        expires: new Date(
            Date.now() + 90 * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };
    
    resp.cookie('jwt', loginJwt, cookieOptions);
    resp.status(200).json({
        status: 'success',
        message: 'Login success.'
    });
}