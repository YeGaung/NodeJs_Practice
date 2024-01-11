const util = require('util');
const loDash = require('lodash')
const fs = require('fs');
const validator = require('validator');
const superagent = require('superagent');
const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AppError = require('./../utils/appError')


const userDataPath = `${__dirname}/../data/users.json`

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

exports.validateSignUpUser = async(req, resp, next) => {
    const signUpUser = req.body;

    if(signUpUser.password !== signUpUser.confirmedPassword) {
        return next(new AppError('Confirm password', 400));
    }

    const userId = crypto.randomUUID();
    console.log(`auto generated user id : ${userId}`);
    console.log(`signUpUser : ${JSON.stringify(signUpUser)}`)

    const hashedPassword = await bcrypt.hash(signUpUser.password, 13);

    req.signUpUser = {
        _id: userId,
        name: signUpUser.name,
        email: signUpUser.email,
        password: hashedPassword
    };

    next();
}

exports.signUpUser = async(req, resp) => {
    const newUserData = req.signUpUser;
    const users = await readFile(userDataPath);
    const userList = JSON.parse(users);
    console.log(`Number of existing user ${userList.length}`);
    userList.push(newUserData);
    console.log(`Number of user after signUp : ${userList.length}`);
    await writeFile(userDataPath, JSON.stringify(userList));

    resp.status(201).json({
        status: 'success',
        data: {
            signUpUser: newUserData
        }
    })
};

exports.getAllUsers = async(req,resp)=>{
    console.log(req.query)

    const users = await readFile(userDataPath);
    const userList = JSON.parse(users);
    console.log(userList);
    resp.status(200).json({
        status: 'success',
        data: {
            users: userList
        }
    })
};

exports.checkLoggedInUser = async (req,resp,next,id)=>{
    const identity = id;
    if(Number.isInteger(id)) {
        console.log('ID is Integer');
    } else {
        console.log('ID is not Integer')
    }
    if (!validator.isUUID(id))
        return resp.status(400).json({
            status: 'failed',
            message: 'Wrong user id format.'
        });
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }
    const decoded = await promisify(jwt.verify)(token, 'MyVerySecrectiveSecret');
    if(decoded.id != id) {
        return next(
          new AppError(`You are not allowed to access the user ${id} information.`, 403)
        );
    }
    req.userId = id;
    
    next();
}
;

exports.getUserById = async(req,resp)=>{
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
      ) {
        const jwt = req.headers.authorization;
        console.log(`Header Jwt : ${jwt}`)
      }

      if (req.cookies) {
        console.log(`cookies ${req.cookies}`);
        const jwt = req.cookies.jwt;
        console.log(`Cookie Jwt : ${jwt}`)

      }
    const userIdParam = req.params.id;
    const userDataPath = `${__dirname}/../data/users.json`
    const users = await readFile(userDataPath);
    const userList = JSON.parse(users);

    const user = userList.find(user=>user._id === userIdParam);
    console.log(`user : ${user}`);

    resp.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
}
;

exports.getUserFavGotCharacter = async(req, resp) => {
    const userIdParam = req.userId;

    const userDataPath = `${__dirname}/../data/users_fav_GOT_character.json`
    const userGotCharacterRawList = await readFile(userDataPath);
    const userGotFavCharacterList = JSON.parse(userGotCharacterRawList);

    const userXFavCharacter = userGotFavCharacterList.find(userFavGotCharacter => userFavGotCharacter.userId === userIdParam);
    const userFavGotCharacterDetails = userXFavCharacter.favGotCharacter;
    console.log(`User's fav GOT character: ${userFavGotCharacterDetails}`);
    const gotCharacterId = 583;
    const characterIdResponse = await superagent.get(`https://anapioficeandfire.com/api/characters/${gotCharacterId}`);

    console.log(`User's fav GOT character by id 583 ${JSON.stringify(characterIdResponse._body)}`)
    const characterResponse = await superagent.get(`https://anapioficeandfire.com/api/characters`).query({name: userFavGotCharacterDetails.name});
    console.log(`User's fav GOT character ${JSON.stringify(characterResponse._body)}`)
    const gotCharacter = characterResponse._body[0];
    const getAllegiancesUrl = gotCharacter.allegiances[0];
    const gotHouse = await superagent.get(`${getAllegiancesUrl}`);

    resp.status(200).json({
        status: 'success',
        userFavGotCharacterDetails
    });
};

exports.postUserFavGotCharacter = async(req,resp)=>{
    const userIdParam = req.params.id;
    const userDataPath = `${__dirname}/../data/users.json`
    const users = await readFile(userDataPath);
    const userList = JSON.parse(users);

    const user = userList.find(user=>user._id === userIdParam);
    console.log(`user : ${user}`);
    const userFavGotCharacterName = user.favGotCharacter;
    console.log(`user fav character id ${userFavGotCharacterName}`);

    const characterIdResponse = await superagent.get(`https://anapioficeandfire.com/api/characters/${userIdParam}`);
    const characterResponse = await superagent.get(`https://anapioficeandfire.com/api/characters`).query({name: userFavGotCharacterName});
    console.log(`User's fav GOT character ${JSON.stringify(characterResponse._body)}`)
    const gotCharacter = characterResponse._body[0];
    const getAllegiancesUrl = gotCharacter.allegiances[0];
    const gotHouse = await superagent.get(`${getAllegiancesUrl}`);
}
;
