const router = require('express').Router();
const User = require('../models/User');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

// Register
router.post('/register' , async (req,res) => {
    const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        img: req.body.img,
        email: req.body.email,
        password: CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SEC).toString()
    })

try{
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
}catch(err){
    res.status(500).json(err);
}

});


// LOGIN
router.post('/login' , async (req,res)=>{

    try{
        const user = await User.findOne({username: req.body.username});

        if (!user) {
            return res.status(401).json('Wrong Credentials!!');
        }

        const hashedPassword = CryptoJS.AES.decrypt(user.password , process.env.PASS_SEC);
        const userPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

        if (userPassword !== req.body.password) {
            return res.status(401).json('Wrong Credentials!!');
        }

        const accessToken = jwt.sign({
            id: user._id,
            isAdmin: user.isAdmin
        } , 
        process.env.JWT_SEC , {expiresIn:'5d'} );

        const { password , ...others} = user._doc;

        res.status(200).json({...others, accessToken});
    }catch(err){
        res.status(500).json(err);
    }


});


module.exports = router;