// src/types/taskDetails.ts
export interface Assignee {
   avatarUrl: string;
   email: string;
   fullName: string;
   id: number;
}

export interface TaskDetails {
   assignee: Assignee;
   boardName: string;
   description: string;
   id: number;
   priority: "Low" | "Medium" | "High";
   status: "Backlog" | "InProgress" | "Done";
   title: string;
}
