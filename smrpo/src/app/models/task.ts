export class Task {
    id: number;
    description: string;
    timeEstimateHrs: number; //size
    idAssignedUser: number; //user
    idSprintStory: number;
    userConfirmed: boolean;
    isReady: boolean;
    isActive: boolean;
    assignedUser: any;
  }
