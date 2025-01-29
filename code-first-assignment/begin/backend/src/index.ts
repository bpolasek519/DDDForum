import express, { Request, Response } from "express";
import {generateRandomPassword, parseUserForResponse, Errors, isMissingKeys} from "./utils";
const cors = require("cors");
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors())

// Create a new user
app.post('/users/new', async (req: Request, res: Response) => {
    try {
        const userData = req.body;

        // Make sure all the fields were provided
        if (!userData.userName || !userData.email || !userData.firstName || !userData.lastName) {
            return res.status(400).json({
                errors: Errors.ValidationError,
                data: undefined,
                success: false
            })
        }
        
        // Check if the username is already taken
        const existingUserByUsername = await prisma.user.findFirst({ where: { userName: req.body.userName } });
        if (existingUserByUsername) {
            return res.status(409).json({ 
                error: Errors.UsernameAlreadyTaken, 
                data: undefined, 
                success: false })
        }
        
        // Check if the user exists or not
        const existingUserByEmail = await prisma.user.findFirst({ where: { email: req.body.email } });
        if (existingUserByEmail) {
            return res.status(409).json({ 
                error: Errors.EmailAlreadyInUse, 
                data: undefined, 
                success: false });
        }

        // Create the user
        const user = await prisma.user.create({
            data: { ...userData, password: generateRandomPassword(10) },
        });

        // Respond with success
        return res.status(201).json({
            error: undefined,
            data: parseUserForResponse(user),
            success: true,
        });
    } catch (error) {
        console.error(error); // Log the error for debugging

        // Return a failure error response
        return res.status(500).json({
            error: Errors.ServerError,
            data: undefined,
            success: false,
        });
    }
});

// Edit a user
app.post('/users/edits/:userId', async (req: Request, res: Response) => {
    try {
        let userId = Number(req.params.userId);

        // Make sure all fields were provided
        const requiredKeys = ['firstName', 'lastName', 'email', 'userName'];
        const keyIsMissing = isMissingKeys(req.body, requiredKeys);

        if (keyIsMissing) {
            return res.status(400).json({
                errors: Errors.ValidationError,
                data: undefined,
                success: false
            });
        }

        // Get the user by id
        const userToUpdate = await prisma.user.findFirst({ where: { id: userId } });
        if (!userToUpdate) {
            return res.status(404).json({
                error: Errors.UserNotFound,
                data: undefined,
                success: false
            });
        }

        // If username is already taken (but allow the current user to keep their username)
        const existingUsername = await prisma.user.findFirst({
            where: { userName: req.body.userName }
        });
        if (existingUsername && userToUpdate.id !== existingUsername.id) {
            return res.status(409).json({
                error: Errors.UsernameAlreadyTaken,
                data: undefined,
                success: false
            });
        }

        // If email already in use (but allow the current user to keep their email)
        const existingEmail = await prisma.user.findFirst({
            where: { email: req.body.email }
        });
        if (existingEmail && userToUpdate.id !== existingEmail.id) {
            return res.status(409).json({
                error: Errors.EmailAlreadyInUse,
                data: undefined,
                success: false
            });
        }

        const userData = req.body;
        const user = await prisma.user.update({ where: { id: userId }, data: userData });

        return res.status(200).json({ error: undefined, data: parseUserForResponse(user), success: true });

    } catch (error) {
        console.error(error); // Log the error for debugging

        return res.status(500).json({
            error: Errors.ServerError,
            data: undefined,
            success: false,
        });
    }
});


// Get a user by email
app.get('/users', async (req: Request, res: Response) => {
    try {
        const email = req.query.email as string;
        
        const user = await prisma.user.findFirst({ where: { email } });
        if (!user) {
            return res.status(404).json({
                error: Errors.UserNotFound,
                data: undefined,
                success: false
            })
        }
        
        return res.status(200).json({
            error: undefined,
            data: parseUserForResponse(user),
            success: true
        })
    }
    catch (error) {
        return res.status(500).json({
            error: Errors.ServerError,
            data: undefined,
            success: false
        })
    }
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})