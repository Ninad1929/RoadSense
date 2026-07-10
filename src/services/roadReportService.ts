import { RoadReport } from '../types/RoadReport';
import { roadReports } from '../data/roadReports';

// This file will become the single source of truth for loading road reports.
// Later, this will be replaced with Firebase Firestore calls.

export const getRoadReports = async (): Promise<RoadReport[]> => {
  // Simulate an async network request for future Firebase integration
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(roadReports);
    }, 500); // Small delay to simulate network
  });
};
