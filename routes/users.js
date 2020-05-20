//REQUIRED PACKAGES
const express = require('express');
const bcrypt = require('bcryptjs')
const { check } = require("express-validator");
const { asyncHandler, handleValidationErrors } = require("../utils");
const { getUserToken, requireAuth } = require("../auth");
const { User } = require("../db/models");

const router = express.Router();

const validateName = [
    check("fullName")
        .exists({ checkFalsy: true })
        .withMessage("Please provide your full name"),
    handleValidationErrors,
];
const validateEmailAndPassword = [
    check("email")
        .exists({ checkFalsy: true })
        .isEmail()
        .withMessage("Please provide a valid email."),
    check("password")
        .exists({ checkFalsy: true })
        .withMessage("Please provide a password.")
        .isLength({ max: 50 })
        .withMessage('Password must not be more than 50 characters long'),
    handleValidationErrors,
];
//CREATE BEW USER ROUTE
router.post(
    "/", 
    validateName,
    validateEmailAndPassword,
    asyncHandler(async(req, res, next)=> {
        const { fullName, email, cashBalance, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ fullName, email, cashBalance, hashedPassword });

        const token = getUserToken(user);
        res.status(201).json({
            user: { id: user.id },
            token,
        });
}));

//USER LOGIN ROUTE
router.post(
    "/token",
    validateEmailAndPassword,
    asyncHandler(async (req, res, next) => {
        const { email, password } = req.body;
        const user = await User.findOne({
            where: {
                email,
            },
        });

    if (!user || !user.validatePassword(password)) {
        const err = new Error("Login failed");
        err.status = 401;
        err.title = "Login failed";
        err.errors = ["The provided credentials were invalid."];
        return next(err);
    }
    const token = getUserToken(user);
    res.json({ token, user: { id: user.id } });
    })
);  

//GUEST USER LOGIN ROUTE
router.post(
    "/guest",
    asyncHandler(async (req, res, next) => {
        const email = "guest@guest.com";
        const user = await User.findOne({
            where: {
                email,
            },
        });

        if (!user || !user.validatePassword(password)) {
            const err = new Error("Login failed");
            err.status = 401;
            err.title = "Login failed";
            err.errors = ["The provided credentials were invalid."];
            return next(err);
        }
        const token = getUserToken(user);
        res.json({ token, user: { id: user.fullName } });
    })
);  



//  update user info route router.put("/:id");

//  delete user route router.delete('/:id');

module.exports = router;