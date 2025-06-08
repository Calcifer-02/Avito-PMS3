// src/types/task.ts

export interface Task {
   assigneeId: number;
   assignee: {
      id: number;
      fullName: string;
      email: string;
      avatarUrl: string;
   };
   boardId: number;
   boardName: string;
   description: string;
   id: number;
   priority: "Low" | "Medium" | "High";
   status: "Backlog" | "InProgress" | "Done";
   title: string;
}

export interface CreateTaskRequest {
   title: string;
   description: string;
   assigneeId: number;
   boardId: number;
   priority?: "Low" | "Medium" | "High";
}

export interface CreateTaskResponse {
   id: number;
}

export interface TaskFormValues {
   id?: number;
   title: string;
   description: string;
   assigneeId: number;
   boardId: number;
   boardName?: string;
   priority?: "Low" | "Medium" | "High";
   status?: "Backlog" | "InProgress" | "Done";
}

export interface Assignee {
   id: number;
   fullName: string;
   email: string;
   avatarUrl: string;
}

export interface UpdateTaskRequest {
   title: string;
   description: string;
   assigneeId: number;
   boardId: number;
   priority?: "Low" | "Medium" | "High";
   status?: "Backlog" | "InProgress" | "Done";
}

export interface UpdateTaskStatusRequest {
   status: "Backlog" | "InProgress" | "Done";
}

export interface UpdateTaskStatusResponse {
   message: string;
}
