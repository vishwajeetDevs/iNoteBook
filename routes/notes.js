const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser'); // Middleware to fetch user details
const Note = require('../model/Note'); // Importing the Note model
const { body, validationResult } = require('express-validator'); // Importing express-validator for input validation

// Route 1: Get all notes of the logged-in user
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        // Fetch all notes that belong to the logged-in user
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route 2: Add a new note for the logged-in user
router.post('/addnote', fetchuser, [
    // Validating request body fields
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be at least 5 characters long').isLength({ min: 5 }),
], async (req, res) => {
    try {
        const { title, description, tag } = req.body;

        // Validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Create a new note instance
        const note = new Note({
            title,
            description,
            tag,
            user: req.user.id
        });

        // Save the note to the database
        const savedNote = await note.save();
        res.json(savedNote);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route 3: Update an existing note
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;

    // Create an object for the updated note
    const newNote = {};
    if (title) newNote.title = title;
    if (description) newNote.description = description;
    if (tag) newNote.tag = tag;

    try {
        // Find the note to be updated
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not Found");
        }

        // Check if the user owns this note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        // Update the note
        note = await Note.findByIdAndUpdate(
            req.params.id,
            { $set: newNote },
            { new: true } // Return the updated note
        );

        res.json(note);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route 4: Delete an existing note and return the deleted note details
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        // Find the note to be deleted
        let note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ error: "Note Not Found" });
        }

        // Allow deletion only if the user owns it
        if (note.user.toString() !== req.user.id) {
            return res.status(401).json({ error: "Not Allowed" });
        }

        // Delete the note and return its details
        const deletedNote = await Note.findByIdAndDelete(req.params.id);

        res.json({ success: "Note has been deleted", deletedNote });
    } catch (err) {
        console.error("Error in Delete Route:", err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
