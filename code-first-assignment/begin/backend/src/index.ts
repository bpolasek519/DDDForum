import express, { Request, Response } from "express";
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors())

// Create a new user
app.post('/users/new', async (req: Request, res: Response) => {
    //
})

// Edit a user
app.post('users/edits/:userId', async (req: Request, res: Response) => {
    //
})

// Get a user by email
app.get('/users', async (req: Request, res: Response) => {
    //
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})