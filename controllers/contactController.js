import Contact from "../models/contact.js";

export async function createContact(req, res) {
  try {

    const { name, email, message } = req.body;

    const contact = new Contact({
      name,
      email,
      message,
    });

    await contact.save();

    res.json({
      message: "Message sent successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to send message",
    });

  }
}

export async function getContacts(req, res) {

  if (!isAdmin(req)) {
    return res.status(403).json({
      message: "Not authorized",
    });
  }

  try {

    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.json(contacts);

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch messages",
    });

  }
}

export async function deleteContact(req, res) {

  if (!isAdmin(req)) {
    return res.status(403).json({
      message: "Not authorized",
    });
  }

  try {

    const id = req.params.id;

    await Contact.findByIdAndDelete(id);

    res.json({
      message: "Message deleted",
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to delete message",
    });

  }
}