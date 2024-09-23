const sessionService = require('../services/sessionService');

exports.createSession = async (req, res) => {
  try {
    const { movie, room, dateTime, price } = req.body;
    const newSession = await sessionService.createSession(movie, room, dateTime, price);
    res.status(201).json(newSession);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getAllSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await sessionService.getAllSessions(userId);
    res.status(200).json(sessions);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    const session = await sessionService.getSessionById(req.params.id);
    res.status(200).json(session);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const { movie, room, dateTime, price } = req.body;
    const updatedSession = await sessionService.updateSession(req.params.id, movie, room, dateTime, price);
    res.status(200).json(updatedSession);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const result = await sessionService.deleteSession(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
