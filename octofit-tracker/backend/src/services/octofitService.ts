import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().sort({ occurredAt: -1 }).lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Activity payload is required'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as {
    userId?: string;
    teamId?: string;
    type?: string;
    minutes?: number | string;
  };

  if (!mongoose.isValidObjectId(userId)) {
    throw Object.assign(new Error('userId must be a valid user id'), { status: 400 });
  }
  if (!mongoose.isValidObjectId(teamId)) {
    throw Object.assign(new Error('teamId must be a valid team id'), { status: 400 });
  }
  if (!type || typeof type !== 'string' || !type.trim()) {
    throw Object.assign(new Error('type is required'), { status: 400 });
  }
  const minuteValue = Number(minutes);
  if (!Number.isFinite(minuteValue) || minuteValue <= 0) {
    throw Object.assign(new Error('minutes must be a positive number'), { status: 400 });
  }

  const user = await User.findById(userId);
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }
  const team = await Team.findById(teamId);
  if (!team) {
    throw Object.assign(new Error('Team not found'), { status: 404 });
  }

  const activity = await Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes: minuteValue,
    points: Math.max(1, Math.round(minuteValue)),
    occurredAt: new Date(),
  });

  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Team payload is required'), { status: 400 });
  }

  const { name, mascot, members } = input as {
    name?: string;
    mascot?: string;
    members?: unknown;
  };

  if (!name || typeof name !== 'string' || !name.trim()) {
    throw Object.assign(new Error('name is required'), { status: 400 });
  }
  if (!mascot || typeof mascot !== 'string' || !mascot.trim()) {
    throw Object.assign(new Error('mascot is required'), { status: 400 });
  }

  const memberIds = Array.isArray(members)
    ? members.filter((member): member is string => typeof member === 'string')
    : [];

  const cleanedMembers = memberIds.filter((memberId) => mongoose.isValidObjectId(memberId));

  const team = await Team.create({
    name: name.trim(),
    mascot: mascot.trim(),
    members: cleanedMembers,
  });

  return team.toObject();
}

export async function getLeaderboard() {
  const leaderboard = await Activity.aggregate([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $sort: { totalPoints: -1, _id: 1 } },
  ]);

  if (leaderboard.length === 0) {
    return [];
  }

  const teamIds = leaderboard.map((entry) => entry._id);
  const teams = await Team.find({ _id: { $in: teamIds } }).lean();
  const teamMap = new Map(teams.map((team) => [team._id.toString(), team.name]));

  return leaderboard.map((entry, index) => ({
    teamName: teamMap.get(entry._id.toString()) ?? 'Unknown Team',
    totalPoints: Number(entry.totalPoints ?? 0),
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.toLowerCase() }).lean();
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const mostRecentActivity = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(1).lean();
  const focusPreference = user.fitnessGoal || (mostRecentActivity[0]?.type ? mostRecentActivity[0].type : 'endurance');
  const candidateFocus = focusPreference === 'strength' || focusPreference === 'endurance'
    ? focusPreference
    : mostRecentActivity[0]?.type === 'strength'
      ? 'strength'
      : 'endurance';

  const workouts = await Workout.find({ focus: candidateFocus }).sort({ minutes: 1 }).lean();
  const suggestions = (workouts.length ? workouts : await Workout.find().sort({ minutes: 1 }).lean()).map((workout) => ({
    ...workout,
    reason: `Your recent ${mostRecentActivity[0]?.type ?? candidateFocus} activity and goal focus on ${workout.focus}.`,
  }));

  return suggestions;
}

export { User };
