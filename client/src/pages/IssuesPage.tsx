// src/pages/IssuesPage.tsx
import { useEffect, useState } from "react";

import { getTasks } from "../api/tasks";
import { getBoards } from "../api/boards";
import type { Task } from "../types/task";
import type { Board } from "../types/board";
import styles from "../styles/Issues.module.css";
import ModalTaskForm from "../components/ModalTaskForm";

export default function IssuesPage() {
   const [tasks, setTasks] = useState<Task[]>([]);
   const [boards, setBoards] = useState<Board[]>([]);

   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [showModal, setShowModal] = useState(false);
   const [selectedTask, setSelectedTask] = useState<Task | null>(null);

   // Фильтры и поиск
   const [statusFilter, setStatusFilter] = useState<string>("");
   const [boardFilter, setBoardFilter] = useState<number>(0);
   const [assigneeFilter] = useState<number>(0);
   const [searchQuery, setSearchQuery] = useState<string>("");

   useEffect(() => {
      const fetchData = async () => {
         try {
            const tasksData = await getTasks();
            const boardsData = await getBoards();
            const normalizedTasks = tasksData.map((task) => ({
               ...task,
               assigneeId: task.assignee.id, // Добавляем assigneeId
            }));
            setTasks(normalizedTasks);
            setBoards(boardsData);
         } catch (err: any) {
            setError("Ошибка загрузки данных");
         } finally {
            setLoading(false);
         }
      };

      fetchData();
   }, []);

   // Обработчик создания задачи
   const handleTaskCreated = () => {
      getTasks().then((data) => setTasks(data));
   };

   // Фильтрация и поиск
   const filteredTasks = tasks.filter((task) => {
      const matchesStatus = !statusFilter || task.status === statusFilter;

      const matchesBoard = boardFilter === 0 || task.boardId === boardFilter;

      const matchesAssignee =
         assigneeFilter === 0 || task.assigneeId === assigneeFilter;

      const matchesSearch =
         !searchQuery ||
         task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
         task.assignee.fullName
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

      return matchesStatus && matchesBoard && matchesAssignee && matchesSearch;
   });

   if (loading) return <div className={styles.page}>Загрузка...</div>;
   if (error) return <div className={styles.page}>{error}</div>;

   return (
      <div className={styles.page}>
         {/* Поиск и фильтры */}
         <div className={styles.filtersContainer}>
            {/* Поиск */}
            <input
               type="text"
               className={styles.searchInput}
               placeholder="Поиск по названию задачи или исполнителю"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Фильтры */}
            <div className={styles.filters}>
               {/* Фильтр по статусу */}
               <select
                  className={styles.filter}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
               >
                  <option value="">Все статусы</option>
                  <option value="Backlog">Backlog</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Done">Done</option>
               </select>

               {/* Фильтр по доске */}
               <select
                  className={styles.filter}
                  value={boardFilter}
                  onChange={(e) => setBoardFilter(Number(e.target.value))}
               >
                  <option value={0}>Все доски</option>
                  {boards.map((board) => (
                     <option key={board.id} value={board.id}>
                        {board.name}
                     </option>
                  ))}
               </select>
            </div>
         </div>

         {/* Список задач */}
         <div className={styles.issuesList}>
            {filteredTasks.length > 0 ? (
               filteredTasks.map((task) => (
                  <div key={task.id} className={styles.issueItem}>
                     <div
                        onClick={() => {
                           setSelectedTask(task);
                           setShowModal(true);
                        }}
                        role="button"
                        tabIndex={0}
                     >
                        <div className={styles.issueTitle}>{task.title}</div>
                        <p className={styles.issueDescription}>
                           {task.description}
                        </p>
                        <div className={styles.issueInfo}>
                           <div className={styles.issueStatus}>
                              Статус: {task.status}
                           </div>
                           <div className={styles.issueBoard}>
                              Доска: {task.boardName}
                           </div>
                           <div className={styles.issueAssignee}>
                              Исполнитель: {task.assignee.fullName}
                           </div>
                        </div>
                     </div>
                  </div>
               ))
            ) : (
               <div className={styles.noResults}>Задачи не найдены</div>
            )}
         </div>

         {/* Кнопка создания задачи */}
         <button
            className={styles.createTaskButton}
            onClick={() => setShowModal(true)}
         >
            Создать задачу
         </button>

         {/* Модальное окно */}
         <ModalTaskForm
            isOpen={showModal}
            onClose={() => {
               setShowModal(false);
               setSelectedTask(null);
            }}
            onSubmit={handleTaskCreated}
            initialData={selectedTask || undefined}
            isBoardContext={false}
         />
      </div>
   );
}
