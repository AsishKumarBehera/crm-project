import Note from "../models/Note.js";

export const addNote = async (req, res) => {
  try {
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({
        message: "Note cannot be empty"
      });
    }

    const newNote = await Note.create({
      leadId: req.params.id,
      text: note.trim(),
      createdBy: req.user._id,  //adding created by and update by
    });


    const populated = await newNote.populate('createdBy', 'name');

    return res.json({
      message: "Note added",
      note: populated
    });

    } catch (err) {
    return res.status(500).json({ message: "Error adding note" });
  }
};


//  GET NOTES BY LEAD
export const getNotesByLead = async (req, res) => {
  try {
    const notes = await Note.find({
      leadId: req.params.id
    })
    .populate('createdBy', 'name')  
    .populate('updatedBy', 'name')
    .sort({ createdAt: -1 });

    res.json({ notes });

  } catch (err) {
    res.status(500).json({ message: "Error fetching notes" });
  }
};


// UpdateNote

export const updateNote = async (req, res) => {
  try {
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({ message: "Note cannot be empty" });
    }

    const updated = await Note.findByIdAndUpdate(
      req.params.id,
      {
        text: note.trim(),
        updatedBy: req.user._id
      },
      { returnDocument: 'after' }
    )
    .populate('createdBy', 'name')
    .populate('updatedBy', 'name');

    return res.json({
      message: "Note updated",
      note: updated
    });

  } catch (err) {
    return res.status(500).json({ message: "Error updating note" });
  }
};