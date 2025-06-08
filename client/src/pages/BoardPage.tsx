// src/pages/BoardPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { updateTaskStatus } from "../api/tasks";
import { getBoardTasks } from "../api/boards";
import styles from "../styles/Board.module.css";
import type { Task } from "../types/task";
import ModalTaskForm from "../components/ModalTaskForm";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function BoardPage() {
   const { id } = useParams<{ id: string }>();

   const [boardName, setBoardName] = useState("Загрузка...");
   const [tasks, setTasks] = useState<Task[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [showModal, setShowModal] = useState(false);
   const [selectedTask, setSelectedTask] = useState<Task | null>(null);

   const fetchBoardTasks = async () => {
      try {
         const boardId = parseInt(id || "0", 10);
         if (isNaN(boardId)) {
            throw new Error("Неверный формат ID доски");
         }

         const data = await getBoardTasks(boardId);

         setTasks(data);
         setBoardName(data[0]?.boardName || `Доска ${boardId}`);
         setLoading(false);
      } catch (err: any) {
         setError(err.message);
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchBoardTasks();
   }, [id]);

   const handleTaskClick = (task: Task) => {
      setSelectedTask(task); // Просто передаём сам объект задачи
      setShowModal(true);
   };

   const handleDragEnd = async (result: any) => {
      const { destination, source, draggableId } = result;

      if (!destination) return;
      if (
         destination.droppableId === source.droppableId &&
         destination.index === source.index
      ) {
         return;
      }

      const taskId = parseInt(draggableId);
      const newStatus = destination.droppableId as
         | "Backlog"
         | "InProgress"
         | "Done";
      const sourceStatus = source.droppableId as
         | "Backlog"
         | "InProgress"
         | "Done";
      const sameColumn = sourceStatus === newStatus;

      try {
         // 1. Обновление статуса на сервере
         if (!sameColumn) {
            await updateTaskStatus(taskId, newStatus);
         }

         // 2. Обновление локального состояния
         setTasks((prev) => {
            const movedTask = prev.find((task) => task.id === taskId);
            if (!movedTask) return prev;

            // ✅ Обновите статус задачи локально
            const updatedMovedTask = { ...movedTask, status: newStatus };

            // ❌ Убираем из старой колонки
            const filtered = prev.filter((task) => task.id !== taskId);

            // ✅ Формируем новую колонку и остальные задачи
            const targetColumn = filtered.filter(
               (task) => task.status === newStatus
            );
            const otherTasks = filtered.filter(
               (task) => task.status !== newStatus
            );

            // ✅ Вставляем задачу в новую колонку
            const reorderedTarget = [...targetColumn];
            reorderedTarget.splice(destination.index, 0, updatedMovedTask);

            // ✅ Объединяем с остальными задачами
            return [...otherTasks, ...reorderedTarget];
         });
      } catch (err: any) {
         alert(`Ошибка обновления статуса: ${err.message}`);
         // 🔄 При ошибке можно перезагрузить задачи
         fetchBoardTasks();
      }
   };

   const filteredTasks = {
      Backlog: tasks.filter((task) => task.status === "Backlog"),
      InProgress: tasks.filter((task) => task.status === "InProgress"),
      Done: tasks.filter((task) => task.status === "Done"),
   };
   if (loading) return <div className={styles.wrapper}>Загрузка...</div>;
   if (error) return <div className={styles.wrapper}>{error}</div>;

   return (
      <DragDropContext onDragEnd={handleDragEnd}>
         <div className={styles.wrapper}>
            <h1 className={styles.title}>Проект {boardName}</h1>

            <div className={styles.board}>
               {/* Backlog */}
               <Droppable droppableId="Backlog">
                  {(provided) => (
                     <div
                        className={styles.columnWrapper}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                     >
                        <div className={styles.columnTitle}>Backlog</div>
                        <div
                           className={styles.column}
                           ref={provided.innerRef}
                           {...provided.droppableProps}
                        >
                           {filteredTasks.Backlog.map((task, index) => (
                              <Draggable
                                 key={task.id}
                                 draggableId={task.id.toString()}
                                 index={index}
                              >
                                 {(provided) => (
                                    <div
                                       ref={provided.innerRef}
                                       {...provided.draggableProps}
                                       {...provided.dragHandleProps}
                                       className={styles.taskCard}
                                       onClick={() => handleTaskClick(task)}
                                       style={{
                                          cursor: "pointer",
                                          ...provided.draggableProps.style,
                                       }}
                                    >
                                       <div className={styles.taskTitle}>
                                          {task.title}
                                       </div>
                                       <div className={styles.taskStatus}>
                                          Статус: {task.status}
                                       </div>
                                       <div className={styles.taskAssignee}>
                                          Исполнитель:{" "}
                                          {task.assignee?.fullName ||
                                             "Не назначен"}
                                       </div>
                                    </div>
                                 )}
                              </Draggable>
                           ))}
                           {provided.placeholder}
                        </div>
                     </div>
                  )}
               </Droppable>

               {/* InProgress */}
               <Droppable droppableId="InProgress">
                  {(provided) => (
                     <div
                        className={styles.columnWrapper}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                     >
                        <div className={styles.columnTitle}>In Progress</div>
                        <div
                           className={styles.column}
                           ref={provided.innerRef}
                           {...provided.droppableProps}
                        >
                           {filteredTasks.InProgress.map((task, index) => (
                              <Draggable
                                 key={task.id}
                                 draggableId={task.id.toString()}
                                 index={index}
                              >
                                 {(provided) => (
                                    <div
                                       ref={provided.innerRef}
                                       {...provided.draggableProps}
                                       {...provided.dragHandleProps}
                                       className={styles.taskCard}
                                       onClick={() => handleTaskClick(task)}
                                       style={{
                                          cursor: "pointer",
                                          ...provided.draggableProps.style,
                                       }}
                                    >
                                       <div className={styles.taskTitle}>
                                          {task.title}
                                       </div>
                                       <div className={styles.taskStatus}>
                                          Статус: {task.status}
                                       </div>
                                       <div className={styles.taskAssignee}>
                                          Исполнитель: {task.assignee.fullName}
                                       </div>
                                    </div>
                                 )}
                              </Draggable>
                           ))}
                           {provided.placeholder}
                        </div>
                     </div>
                  )}
               </Droppable>

               {/* Done */}
               <Droppable droppableId="Done">
                  {(provided) => (
                     <div
                        className={styles.columnWrapper}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                     >
                        <div className={styles.columnTitle}>Done</div>
                        <div
                           className={styles.column}
                           ref={provided.innerRef}
                           {...provided.droppableProps}
                        >
                           {filteredTasks.Done.map((task, index) => (
                              <Draggable
                                 key={task.id}
                                 draggableId={task.id.toString()}
                                 index={index}
                              >
                                 {(provided) => (
                                    <div
                                       ref={provided.innerRef}
                                       {...provided.draggableProps}
                                       {...provided.dragHandleProps}
                                       className={styles.taskCard}
                                       onClick={() => handleTaskClick(task)}
                                       style={{
                                          cursor: "pointer",
                                          ...provided.draggableProps.style,
                                       }}
                                    >
                                       <div className={styles.taskTitle}>
                                          {task.title}
                                       </div>
                                       <div className={styles.taskStatus}>
                                          Статус: {task.status}
                                       </div>
                                       <div className={styles.taskAssignee}>
                                          Исполнитель: {task.assignee.fullName}
                                       </div>
                                    </div>
                                 )}
                              </Draggable>
                           ))}
                           {provided.placeholder}
                        </div>
                     </div>
                  )}
               </Droppable>
            </div>
         </div>

         {/* Модальное окно редактирования задачи */}
         {selectedTask && (
            <ModalTaskForm
               isOpen={showModal}
               onClose={() => setShowModal(false)}
               onSubmit={fetchBoardTasks}
               initialData={{
                  ...selectedTask, // Все свойства задачи
                  assigneeId: selectedTask.assignee.id, // Явно передаём assigneeId
               }}
               isBoardContext={true}
            />
         )}
      </DragDropContext>
   );
}
