// src/components/CreateTaskForm.tsx
import React, { useState } from "react";
import { createTask } from "../api/tasks"; // Импортируем функцию для создания задачи через API
import { useNavigate } from "react-router-dom"; // Импортируем хук для навигации между страницами
import styles from "../styles/CreateTaskForm.module.css"; // Подключаем стили для формы создания задачи

// Интерфейс для пропсов компонента, который ожидает boardId и функцию onTaskCreated
interface CreateTaskFormProps {
   boardId: number; // ID доски, для которой создается задача
   onTaskCreated: () => void; // Функция, которая будет вызвана после создания задачи
}

export default function CreateTaskForm({
   boardId, // Получаем boardId из пропсов
   onTaskCreated, // Получаем функцию onTaskCreated из пропсов
}: CreateTaskFormProps) {
   // Состояния для каждого поля формы и индикатора загрузки
   const [title, setTitle] = useState(""); // Заголовок задачи
   const [description, setDescription] = useState(""); // Описание задачи
   const [assigneeId, setAssigneeId] = useState<number>(0); // ID исполнителя задачи
   const [priority, setPriority] = useState<"Low" | "Medium" | "High">(
      "Medium"
   ); // Приоритет задачи
   const [loading, setLoading] = useState(false); // Состояние загрузки
   const [error, setError] = useState<string | null>(null); // Ошибка, если она возникнет при создании задачи

   // Хук для навигации
   const navigate = useNavigate();

   // Обработчик отправки формы
   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault(); // Предотвращаем стандартное поведение формы
      setLoading(true); // Включаем индикатор загрузки
      setError(null); // Сбрасываем предыдущие ошибки

      try {
         // Подготовка данных для отправки в API
         const taskData = { title, description, assigneeId, boardId, priority };
         // Отправка данных в API для создания задачи
         const result = await createTask(taskData);
         setLoading(false); // Отключаем индикатор загрузки
         onTaskCreated(); // Вызываем функцию onTaskCreated после успешного создания задачи
         navigate(`/task/${result.id}`); // Перенаправляем на страницу задачи, используя её ID
      } catch (err: any) {
         // В случае ошибки
         setLoading(false); // Отключаем индикатор загрузки
         setError(err.message); // Устанавливаем сообщение об ошибке
      }
   };

   return (
      <form className={styles.form} onSubmit={handleSubmit}>
         <h2>Создать задачу</h2>

         {/* Если есть ошибка, отображаем её */}
         {error && <div className={styles.error}>{error}</div>}

         {/* Поле для ввода названия задачи */}
         <label>
            Название:
            <input
               type="text"
               value={title} // Значение из состояния title
               onChange={(e) => setTitle(e.target.value)} // Обновляем состояние при изменении
               required // Поле обязательно для заполнения
            />
         </label>

         {/* Поле для ввода описания задачи */}
         <label>
            Описание:
            <textarea
               value={description} // Значение из состояния description
               onChange={(e) => setDescription(e.target.value)} // Обновляем состояние при изменении
               required // Поле обязательно для заполнения
            />
         </label>

         {/* Поле для ввода ID исполнителя */}
         <label>
            ID исполнителя:
            <input
               type="number"
               value={assigneeId} // Значение из состояния assigneeId
               onChange={(e) => setAssigneeId(Number(e.target.value))} // Обновляем состояние при изменении
               required // Поле обязательно для заполнения
            />
         </label>

         {/* Селектор для выбора приоритета задачи */}
         <label>
            Приоритет:
            <select
               value={priority} // Значение из состояния priority
               onChange={(e) => setPriority(e.target.value as any)} // Обновляем состояние при изменении
            >
               <option value="Low">Low</option>
               <option value="Medium">Medium</option>
               <option value="High">High</option>
            </select>
         </label>

         {/* Кнопка для отправки формы */}
         <button type="submit" disabled={loading}>
            {loading ? "Создание..." : "Создать задачу"}{" "}
            {/* Показ текста в зависимости от состояния загрузки */}
         </button>
      </form>
   );
}
