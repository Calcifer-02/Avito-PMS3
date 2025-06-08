// src/pages/TaskPage.tsx
import { useEffect, useState } from "react"; // Импортируем хуки для работы с состоянием и эффектами
import { useParams } from "react-router-dom"; // Хук для получения параметров маршрута
import { getTaskById } from "../api/tasks"; // Функция для получения задачи по ID с API
import type { TaskDetails } from "../types/taskDetails"; // Тип данных для подробной информации о задаче
import styles from "../styles/Task.module.css"; // Стили для страницы задачи

export default function TaskPage() {
   // Получаем ID задачи из параметров URL
   const { id } = useParams<{ id: string }>();
   // Состояние для хранения данных задачи
   const [task, setTask] = useState<TaskDetails | null>(null);
   // Состояние для индикатора загрузки данных
   const [loading, setLoading] = useState(true);
   // Состояние для хранения ошибок
   const [error, setError] = useState<string | null>(null);

   // Хук useEffect, который вызывается при монтировании компонента
   useEffect(() => {
      // Асинхронная функция для получения данных задачи
      const fetchTask = async () => {
         const taskId = parseInt(id || "", 10); // Преобразуем ID задачи в число
         if (isNaN(taskId)) {
            // Проверка на некорректный ID
            setError("Некорректный ID задачи"); // Устанавливаем ошибку, если ID некорректен
            setLoading(false); // Завершаем загрузку
            return;
         }

         try {
            // Получаем данные о задаче через API
            const data = await getTaskById(taskId);
            setTask(data); // Сохраняем данные задачи в состояние
            setLoading(false); // Завершаем загрузку
         } catch (err) {
            // Обрабатываем ошибки
            setError(err instanceof Error ? err.message : "Неизвестная ошибка");
            setLoading(false); // Завершаем загрузку
         }
      };

      fetchTask(); // Вызываем функцию для получения данных задачи
   }, [id]); // Хук с зависимостью от ID, он будет перезапускаться при изменении ID

   // Если идет загрузка, отображаем индикатор загрузки
   if (loading) return <div className={styles.page}>Загрузка...</div>;
   // Если произошла ошибка, отображаем сообщение об ошибке
   if (error) return <div className={styles.page}>{error}</div>;
   // Если задача не загружена, отображаем сообщение
   if (!task)
      return <div className={styles.page}>Данные задачи не загружены</div>;

   return (
      <div className={styles.page}>
         {/* Название задачи */}
         <h1 className={styles.title}>{task.title}</h1>
         {/* Описание задачи */}
         <p className={styles.description}>{task.description}</p>

         <div className={styles.info}>
            {/* Информация о задаче */}
            <div className={styles.row}>
               <strong>Статус:</strong> {task.status}
            </div>
            <div className={styles.row}>
               <strong>Приоритет:</strong> {task.priority}
            </div>
            <div className={styles.row}>
               <strong>Доска:</strong> {task.boardName}
            </div>
            <div className={styles.row}>
               <strong>Исполнитель:</strong> {task.assignee.fullName}
            </div>
            <div className={styles.row}>
               <strong>Email исполнителя:</strong> {task.assignee.email}
            </div>
         </div>
      </div>
   );
}
