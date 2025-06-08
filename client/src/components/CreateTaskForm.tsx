// src/components/CreateTaskForm.tsx
import React, { useState } from "react";
import { createTask } from "../api/tasks";
import { useNavigate } from "react-router-dom";
import styles from "../styles/CreateTaskForm.module.css";

interface CreateTaskFormProps {
   boardId: number;
   onTaskCreated: () => void;
}

export default function CreateTaskForm({
   boardId,
   onTaskCreated,
}: CreateTaskFormProps) {
   const [title, setTitle] = useState("");
   const [description, setDescription] = useState("");
   const [assigneeId, setAssigneeId] = useState<number>(0);
   const [priority, setPriority] = useState<"Low" | "Medium" | "High">(
      "Medium"
   );
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const navigate = useNavigate();

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      try {
         const taskData = { title, description, assigneeId, boardId, priority };
         const result = await createTask(taskData);
         setLoading(false);
         onTaskCreated();
         navigate(`/task/${result.id}`);
      } catch (err: any) {
         setLoading(false);
         setError(err.message);
      }
   };

   return (
      <form className={styles.form} onSubmit={handleSubmit}>
         <h2>Создать задачу</h2>

         {error && <div className={styles.error}>{error}</div>}

         <label>
            Название:
            <input
               type="text"
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               required
            />
         </label>

         <label>
            Описание:
            <textarea
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               required
            />
         </label>

         <label>
            ID исполнителя:
            <input
               type="number"
               value={assigneeId}
               onChange={(e) => setAssigneeId(Number(e.target.value))}
               required
            />
         </label>

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

         <button type="submit" disabled={loading}>
            {loading ? "Создание..." : "Создать задачу"}
         </button>
      </form>
   );
}
