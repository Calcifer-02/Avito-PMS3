// src/components/ModalTaskForm.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createTask, updateTask } from "../api/tasks";
import { getUsers, type Assignee } from "../api/users";
import { getBoards } from "../api/boards";
import type { TaskFormValues } from "../types/task";
import styles from "../styles/ModalTaskForm.module.css";

export default function ModalTaskForm({
   isOpen,
   onClose,
   onSubmit,
   initialData,
   isBoardContext = false,
}: {
   isOpen: boolean;
   onClose: () => void;
   onSubmit: () => void;
   initialData?: TaskFormValues;
   isBoardContext?: boolean;
}) {
   const navigate = useNavigate();

   const isEditMode = !!initialData?.id;

   // Используем локальное состояние
   const [title, setTitle] = useState(initialData?.title || "");
   const [description, setDescription] = useState(
      initialData?.description || ""
   );
   const [assigneeId, setAssigneeId] = useState<number>(
      initialData?.assigneeId || 0
   );
   const [boardId, setBoardId] = useState<number>(initialData?.boardId || 0);
   const [, setBoardName] = useState<string>(initialData?.boardName || "");
   const [priority, setPriority] = useState<"Low" | "Medium" | "High">(
      initialData?.priority || "Medium"
   );
   const [status, setStatus] = useState<"Backlog" | "InProgress" | "Done">(
      initialData?.status || "Backlog"
   );
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const [assignees, setAssignees] = useState<Assignee[]>([]);
   const [boards, setBoards] = useState<{ id: number; name: string }[]>([]);

   // Обновление состояния при изменении initialData
   useEffect(() => {
      if (initialData) {
         setTitle(initialData.title || "");
         setDescription(initialData.description || "");
         setAssigneeId(initialData.assigneeId || 0);
         setBoardId(initialData.boardId || 0);
         setBoardName(initialData.boardName || "");
         setPriority(initialData.priority || "Medium");
         setStatus(initialData.status || "Backlog");
      } else {
         setTitle("");
         setDescription("");
         setAssigneeId(0);
         setBoardId(0);
         setBoardName("");
         setPriority("Medium");
         setStatus("Backlog");
      }
   }, [initialData]);

   // Загрузка пользователей и досок
   useEffect(() => {
      const fetchData = async () => {
         try {
            const assigneesData = await getUsers();
            setAssignees(assigneesData);

            if (!isBoardContext) {
               const boardsData = await getBoards();
               setBoards(boardsData);
            }
         } catch (err: any) {
            setError(err.message);
         }
      };

      fetchData();
   }, []);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      // Валидация
      if (!title.trim()) {
         setError("Название задачи не может быть пустым");
         setLoading(false);
         return;
      }
      if (!assigneeId) {
         setError("Выберите исполнителя");
         setLoading(false);
         return;
      }
      if (!boardId) {
         setError("Выберите доску");
         setLoading(false);
         return;
      }

      const taskData = {
         title,
         description,
         assigneeId,
         boardId: isEditMode ? initialData?.boardId || boardId : boardId, // Защита от изменения boardId
         priority,
         status,
      };

      try {
         if (isEditMode) {
            await updateTask(initialData.id!, taskData);
         } else {
            await createTask(taskData);
         }
         onSubmit();
         onClose();
         window.location.reload();
      } catch (err: any) {
         setError(err.message || "Ошибка при сохранении задачи");
      } finally {
         setLoading(false);
      }
   };

   if (!isOpen) return null;

   return (
      <div className={styles.overlay} onClick={onClose}>
         <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={onClose}>
               &times;
            </button>

            <h2>{isEditMode ? "Редактирование задачи" : "Создание задачи"}</h2>

            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit}>
               {/* Название задачи */}
               <label>
                  Название задачи:
                  <input
                     type="text"
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                     required
                  />
               </label>

               {/* Описание задачи */}
               <label>
                  Описание задачи:
                  <textarea
                     value={description}
                     onChange={(e) => setDescription(e.target.value)}
                     required
                  />
               </label>

               {/* Приоритет */}
               <label>
                  Приоритет:
                  <select
                     value={priority}
                     onChange={(e) => setPriority(e.target.value as any)}
                  >
                     <option value="Low">Low</option>
                     <option value="Medium">Medium</option>
                     <option value="High">High</option>
                  </select>
               </label>

               {/* Статус (только в режиме редактирования) */}
               {isEditMode && (
                  <label>
                     Статус:
                     <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                     >
                        <option value="Backlog">Backlog</option>
                        <option value="InProgress">In Progress</option>
                        <option value="Done">Done</option>
                     </select>
                  </label>
               )}

               {/* Исполнитель */}
               <label>
                  Исполнитель:
                  <select
                     value={assigneeId}
                     onChange={(e) => setAssigneeId(Number(e.target.value))}
                     required
                  >
                     <option value={0}>Выберите исполнителя</option>
                     {assignees.map((user) => (
                        <option key={user.id} value={user.id}>
                           {user.fullName} ({user.email})
                        </option>
                     ))}
                  </select>
               </label>

               {/* Селектор досок вне контекста доски */}
               {isBoardContext && (
                  <label>
                     Доска:
                     <select
                        value={boardId}
                        onChange={(e) => setBoardId(Number(e.target.value))}
                        required
                        disabled={isEditMode}
                     >
                        <option value={0}>Выберите доску</option>
                        {boards.map((board) => (
                           <option key={board.id} value={board.id}>
                              {board.name}
                           </option>
                        ))}
                     </select>
                  </label>
               )}

               {/* Кнопка "Перейти к доске" */}
               {!isBoardContext && (
                  <button
                     type="button"
                     className={styles.boardLink}
                     onClick={() => navigate(`/board/${boardId}`)}
                     disabled={boardId <= 0}
                  >
                     Перейти к доске
                  </button>
               )}

               {/* Основная кнопка */}
               <button type="submit" disabled={loading}>
                  {loading
                     ? "Сохранение..."
                     : isEditMode
                     ? "Сохранить"
                     : "Создать задачу"}
               </button>
            </form>
         </div>
      </div>
   );
}
