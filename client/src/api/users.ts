// src/api/users.ts
import axios from "axios";

const API_URL = "http://localhost:8080/api/v1";

export interface Assignee {
   id: number;
   fullName: string;
   email: string;
   avatarUrl: string;
}

export const getUsers = async (): Promise<Assignee[]> => {
   try {
      const response = await axios.get(`${API_URL}/users`);

      // Извлекаем массив пользователей из нужного поля
      const usersData =
         response.data?.items || response.data?.data || response.data;

      if (!Array.isArray(usersData)) {
         throw new Error("Неверный формат данных: ожидался массив");
      }

      return usersData.map((user: any) => ({
         id: user.id,
         fullName: user.fullName,
         email: user.email,
         avatarUrl: user.avatarUrl,
      }));
   } catch (error: any) {
      console.error("Ошибка при загрузке пользователей:", error);

      if (error.response?.status === 404) {
         throw new Error("Пользователи не найдены");
      } else if (error.response?.status >= 500) {
         throw new Error("Внутренняя ошибка сервера");
      } else {
         throw new Error("Ошибка загрузки пользователей");
      }
   }
};
