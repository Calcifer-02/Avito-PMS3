import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTaskById } from "../api/tasks";
import type { TaskDetails } from "../types/taskDetails";
import styles from "../styles/Task.module.css";

export default function TaskPage() {
   const { id } = useParams<{ id: string }>();
   const [task, setTask] = useState<TaskDetails | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const fetchTask = async () => {
         const taskId = parseInt(id || "", 10);
         if (isNaN(taskId)) {
            setError("Некорректный ID задачи");
            setLoading(false);
            return;
         }

         try {
            const data = await getTaskById(taskId);
            setTask(data);
            setLoading(false);
         } catch (err) {
            setError(err instanceof Error ? err.message : "Неизвестная ошибка");
            setLoading(false);
         }
      };

      fetchTask();
   }, [id]);

   if (loading) return <div className={styles.page}>Загрузка...</div>;
   if (error) return <div className={styles.page}>{error}</div>;
   if (!task)
      return <div className={styles.page}>Данные задачи не загружены</div>;

   return (
      <div className={styles.page}>
         <h1 className={styles.title}>{task.title}</h1>
         <p className={styles.description}>{task.description}</p>

         <div className={styles.info}>
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
