const express = require("express");
const router = express.Router();
const fetchUser = require("../middleware/fetchUser");
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");
//ROUTE 1:Fetch all users data GET "/api/notes/fetchallnotes". Login Required
router.get("/fetchallnotes", fetchUser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
});
//ROUTE 2: Add a new note using POST "api/notes/addnote". Login Required
router.post(
  "/addnote",
  fetchUser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Enter a valid description").isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body; //Using destructuring method of javascript

      //If there are any bad requests return bad requests and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });
      //saving the notes
      const savedNote = await note.save();
      //returning the notes as a response
      res.json(savedNote);
    } catch (error) {
      //If any unknown error occurs in the try block, catch block will catch it and show it here
      console.log(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);
// ROUTE 3: Update an existing note using PUT "/api/notes/updatenote/:id"
router.put('/updatenote/:id', fetchUser, async (req, res) => {
  const { title, description, tag } = req.body;
  try {
      // Create a newNote object
      const newNote = {};
      if (title) { newNote.title = title };
      if (description) { newNote.description = description };
      if (tag) { newNote.tag = tag };

      // Find the note to be updated and update it
      let note = await Notes.findById(req.params.id);
      if (!note) { return res.status(404).send("Not Found") }

      if (note.user && note.user.toString() !== req.user.id) {
          return res.status(401).send("Not Allowed");
      }
      
        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });
      
      
  } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
  }
})


//ROUTE 4: Delete an existing note using DELETE "/api/notes/deletenote/:id"
router.delete('/deletenote/:id', fetchUser, async (req, res) => {
  const { title, description, tag } = req.body;
  try {
      // Create a newNote object
      const newNote = {};

      // Find the note to be deleted and delete it
      let note = await Notes.findById(req.params.id);
      if (!note) { return res.status(404).send("Not Found") }

      if (note.user && note.user.toString() !== req.user.id) {
          return res.status(401).send("Not Allowed");
      }
      
        note = await Notes.findByIdAndDelete(req.params.id);
        res.json({"Success": "Note has been deleted"});
      
      
  } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
  }
})
module.exports = router;
