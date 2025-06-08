// src/api/boards.ts
import axios from "axios";
import type { Board } from "../types/board";
import type { Task } from "../types/task";

const API_URL = "http://localhost:8080/api/v1/boards";

export const getBoards = async (): Promise<Board[]> => {
   const response = await axios.get(API_URL);

   return (
      response.data.boards || response.data.items || response.data.data || []
   );
};

export const getBoardTasks = async (boardId: number): Promise<Task[]> => {
   try {
      const response = await axios.get(`${API_URL}/${boardId}`);
      const tasksData =
         response.data.data || response.data.tasks || response.data;

      if (!Array.isArray(tasksData)) {
         throw new Error("Неверный формат задач");
      }

      return tasksData.map((task: any) => ({
         id: task.id,
         title: task.title,
         description: task.description,
         assigneeId: task.assignee.id,
         boardId: task.boardId,
         boardName: task.boardName,
         priority: task.priority,
         status: task.status,
         assignee: {
            id: task.assignee.id,
            fullName: task.assignee.fullName,
            email: task.assignee.email,
            avatarUrl: task.assignee.avatarUrl,
         },
      }));
   } catch (error: any) {
      console.error("Ошибка при загрузке задач:", error);
      return [];
   }
};
