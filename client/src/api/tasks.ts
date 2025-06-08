// src/api/tasks.ts
import axios from "axios";
import type {
   Task,
   TaskFormValues,
   UpdateTaskRequest,
   UpdateTaskStatusResponse,
} from "../types/task";
import type { TaskDetails } from "../types/taskDetails";

const API_URL = "http://localhost:8080/api/v1/tasks";

interface ApiResponse {
   data: Task[];
}

export const getTasks = async (): Promise<Task[]> => {
   const response = await axios.get<ApiResponse>(API_URL);
   return response.data.data; // Достаем массив задач из поля data
};

export const getTaskById = async (taskId: number): Promise<TaskDetails> => {
   try {
      const response = await axios.get(`${API_URL}/${taskId}`);
      return response.data.data || response.data;
   } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
         if (error.response?.status === 400) {
            throw new Error("Некорректный ID задачи");
         } else if (error.response?.status === 404) {
            throw new Error("Задача не найдена");
         }
      }
      throw new Error("Ошибка сервера");
   }
};

export const createTask = async (
   taskData: TaskFormValues
): Promise<{ id: number }> => {
   try {
      const response = await axios.post(`${API_URL}/create`, taskData);
      return { id: response.data.data.id };
   } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
         if (error.response?.status === 400) {
            throw new Error("Некорректные данные для создания задачи");
         } else if (error.response?.status === 404) {
            throw new Error("Доска или пользователь не найдены");
         }
      }
      throw new Error("Ошибка сервера при создании задачи");
   }
};
export const updateTask = async (
   taskId: number,
   taskData: UpdateTaskRequest
): Promise<{ message: string }> => {
   try {
      const response = await axios.put(`${API_URL}/update/${taskId}`, taskData);
      return response.data;
   } catch (error: any) {
      if (error.response?.status === 400) {
         throw new Error("Некорректные данные для обновления задачи");
      } else if (error.response?.status === 404) {
         throw new Error("Задача не найдена");
      } else {
         throw new Error("Ошибка сервера при обновлении задачи");
      }
   }
};

export const updateTaskStatus = async (
   taskId: number,
   status: "Backlog" | "InProgress" | "Done"
): Promise<UpdateTaskStatusResponse> => {
   try {
      const response = await axios.put(`${API_URL}/updateStatus/${taskId}`, {
         status,
      });
      return response.data;
   } catch (error: any) {
      if (error.response?.status === 400) {
         throw new Error("Некорректные данные");
      } else if (error.response?.status === 404) {
         throw new Error("Задача не найдена");
      } else {
         throw new Error("Ошибка сервера при обновлении статуса");
      }
   }
};
