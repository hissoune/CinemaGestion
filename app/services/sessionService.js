const Session = require('../models/Session');
const Movie = require('../models/Movie');
const Room = require('../models/Room');
const Reservation = require('../models/Reservation');

exports.createSession = async (movieId, roomId, dateTime, price, creator) => {
  const movieExists = await Movie.findById(movieId);
  const roomExists = await Room.findById(roomId);

  if (!movieExists || !roomExists) {
    throw new Error('Movie or Room not found');
  }

  const newSession = new Session({
    movie: movieId,
    room: roomId,
    dateTime,
    price,
    creator, 
  });

  return await newSession.save();
};

exports.getAllSessions = async () => {
  const sessions = await Session.find()
    .populate({
      path: 'movie',
      populate: { path: 'creator', select: 'name email' } 
    })
    .populate({
      path: 'room',
      populate: { path: 'creator', select: 'name email' } 
    })
    .populate('creator', 'name email') 
    .exec();

  return sessions;
};

exports.getSessionById = async (sessionId) => {
  // Fetch session by ID and populate movie, room, and creator details
  const session = await Session.findById(sessionId)
    .populate({
      path: 'movie',
      populate: { path: 'creator', select: 'name email' } // Populating movie's creator details
    })
    .populate({
      path: 'room',
      populate: { path: 'creator', select: 'name email' } // Populating room's creator details
    })
    .populate('creator', 'name email') // Populate session's creator
    .exec();

  if (!session) {
    throw new Error('Session not found');
  }

  return session;
};

exports.updateSession = async (sessionId, movieId, roomId, dateTime, price, userId) => {
  // Check if the session exists and if the current user is the creator
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  // Only the session's creator can update it
  if (session.creator.toString() !== userId) {
    throw new Error('You are not authorized to update this session');
  }

  // Update the session
  const updatedSession = await Session.findByIdAndUpdate(
    sessionId,
    { movie: movieId, room: roomId, dateTime, price },
    { new: true }
  )
    .populate({
      path: 'movie',
      populate: { path: 'creator', select: 'name email' } // Populating movie's creator details
    })
    .populate({
      path: 'room',
      populate: { path: 'creator', select: 'name email' } // Populating room's creator details
    })
    .populate('creator', 'name email') // Populate session's creator
    .exec();

  return updatedSession;
};

exports.deleteSession = async (sessionId, userId) => {
  // Check if there are any reservations for this session
  const reservations = await Reservation.find({ session: sessionId });
  
  if (reservations.length > 0) {
    throw new Error('Cannot delete a session with reservations');
  }

  // Find the session and populate its room
  const session = await Session.findById(sessionId)
    .populate({
      path: 'room',
      populate: { path: 'creator', select: 'name email' }
    })
    .populate('creator', 'name email');

  if (!session) {
    throw new Error('Session not found');
  }

  // Only the session creator can delete it
  if (session.creator.toString() !== userId) {
    throw new Error('You are not authorized to delete this session');
  }

  // Soft delete the session by marking it as isDeleted
  session.isDeleted = true;
  await session.save();

  return { msg: 'Session deleted successfully' };
};

exports.getAllSessionsPublic = async() => {
   const sessions = await Session.find()
    .populate({
      path: 'movie',
      populate: { path: 'creator', select: 'name email' } 
    })
    .populate({
      path: 'room',
      populate: { path: 'creator', select: 'name email' } 
    })
    .populate('creator', 'name email') 
    .exec();

  return sessions;
}
exports.getSessionsForMovie = async (moviId) => {

  
  const sessions = await Session.find({ movie: moviId }).populate({
      path: 'movie',
      populate: { path: 'creator', select: 'name email' } 
    })
    .populate({
      path: 'room',
      populate: { path: 'creator', select: 'name email' } 
    })
    .populate('creator', 'name email') 
    .exec();
  return sessions;
}
