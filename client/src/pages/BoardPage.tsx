// src/pages/BoardPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Хук для извлечения параметров маршрута (ID доски)
import { updateTaskStatus } from "../api/tasks"; // Функция для обновления статуса задачи
import { getBoardTasks } from "../api/boards"; // Функция для получения задач доски
import styles from "../styles/Board.module.css"; // Стили для страницы доски
import type { Task } from "../types/task"; // Тип задачи
import ModalTaskForm from "../components/ModalTaskForm"; // Компонент для модального окна редактирования задачи

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"; // Импортируем необходимые компоненты для перетаскивания задач

export default function BoardPage() {
   const { id } = useParams<{ id: string }>(); // Извлекаем ID доски из параметров маршрута

   // Состояние для имени доски, задач, состояния загрузки и ошибок
   const [boardName, setBoardName] = useState("Загрузка...");
   const [tasks, setTasks] = useState<Task[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [showModal, setShowModal] = useState(false); // Для отображения модального окна
   const [selectedTask, setSelectedTask] = useState<Task | null>(null); // Для выбранной задачи, которую нужно редактировать

   // Функция для получения задач доски по ID
   const fetchBoardTasks = async () => {
      try {
         const boardId = parseInt(id || "0", 10); // Преобразуем ID в число
         if (isNaN(boardId)) {
            throw new Error("Неверный формат ID доски");
         }

         // Получаем задачи для доски с API
         const data = await getBoardTasks(boardId);

         setTasks(data); // Сохраняем задачи в состояние
         setBoardName(data[0]?.boardName || `Доска ${boardId}`); // Устанавливаем имя доски
         setLoading(false); // Завершаем загрузку
      } catch (err: any) {
         setError(err.message); // Если произошла ошибка, сохраняем её в состояние
         setLoading(false); // Завершаем загрузку с ошибкой
      }
   };

   useEffect(() => {
      fetchBoardTasks(); // При монтировании компонента получаем задачи
   }, [id]); // Перезапускаем при изменении ID доски

   // Обработчик клика по задаче — открываем модальное окно для редактирования
   const handleTaskClick = (task: Task) => {
      setSelectedTask(task); // Передаем выбранную задачу в состояние
      setShowModal(true); // Показываем модальное окно
   };

   // Обработчик завершения перетаскивания задачи
   const handleDragEnd = async (result: any) => {
      const { destination, source, draggableId } = result;

      if (!destination) return; // Если задача не была перемещена, ничего не делаем
      if (
         destination.droppableId === source.droppableId &&
         destination.index === source.index
      ) {
         return; // Если задача осталась в той же колонке, ничего не меняем
      }

      const taskId = parseInt(draggableId); // Получаем ID задачи
      const newStatus = destination.droppableId as
         | "Backlog"
         | "InProgress"
         | "Done"; // Новый статус задачи
      const sourceStatus = source.droppableId as
         | "Backlog"
         | "InProgress"
         | "Done"; // Статус задачи до перемещения
      const sameColumn = sourceStatus === newStatus; // Проверяем, не осталась ли задача в той же колонке

      try {
         // 1. Обновление статуса задачи на сервере (если статус изменился)
         if (!sameColumn) {
            await updateTaskStatus(taskId, newStatus);
         }

         // 2. Обновление задач в локальном состоянии
         setTasks((prev) => {
            const movedTask = prev.find((task) => task.id === taskId); // Находим задачу, которую перетаскивают
            if (!movedTask) return prev;

            const updatedMovedTask = { ...movedTask, status: newStatus }; // Обновляем статус задачи

            // Убираем задачу из старой колонки
            const filtered = prev.filter((task) => task.id !== taskId);

            // Формируем новые колонки с обновленными задачами
            const targetColumn = filtered.filter(
               (task) => task.status === newStatus
            );
            const otherTasks = filtered.filter(
               (task) => task.status !== newStatus
            );

            // Вставляем задачу в новую колонку
            const reorderedTarget = [...targetColumn];
            reorderedTarget.splice(destination.index, 0, updatedMovedTask);

            // Объединяем все задачи в новое состояние
            return [...otherTasks, ...reorderedTarget];
         });
      } catch (err: any) {
         alert(`Ошибка обновления статуса: ${err.message}`);
         // 🔄 При ошибке можно перезагрузить задачи
         fetchBoardTasks();
      }
   };

   // Разделяем задачи по статусам
   const filteredTasks = {
      Backlog: tasks.filter((task) => task.status === "Backlog"),
      InProgress: tasks.filter((task) => task.status === "InProgress"),
      Done: tasks.filter((task) => task.status === "Done"),
   };

   if (loading) return <div className={styles.wrapper}>Загрузка...</div>; // Если загрузка, отображаем сообщение
   if (error) return <div className={styles.wrapper}>{error}</div>; // Если ошибка, отображаем её

   return (
      <DragDropContext onDragEnd={handleDragEnd}>
         {" "}
         {/* Контекст для перетаскивания */}
         <div className={styles.wrapper}>
            <h1 className={styles.title}>Проект {boardName}</h1>

            <div className={styles.board}>
               {/* Колонка для задач с состоянием "Backlog" */}
               <Droppable droppableId="Backlog">
                  {(provided) => (
                     <div
                        className={styles.columnWrapper}
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
                                       onClick={() => handleTaskClick(task)} // Клик по задаче для редактирования
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

               {/* Колонка для задач в статусе "InProgress" */}
               <Droppable droppableId="InProgress">
                  {(provided) => (
                     <div
                        className={styles.columnWrapper}
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
                                       onClick={() => handleTaskClick(task)} // Клик для редактирования
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

               {/* Колонка для задач с состоянием "Done" */}
               <Droppable droppableId="Done">
                  {(provided) => (
                     <div
                        className={styles.columnWrapper}
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
                                       onClick={() => handleTaskClick(task)} // Клик для редактирования
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
               onClose={() => setShowModal(false)} // Закрыть модальное окно
               onSubmit={fetchBoardTasks} // Обновить задачи после изменения
               initialData={{
                  ...selectedTask, // Все свойства задачи
                  assigneeId: selectedTask.assignee.id, // Явно передаём assigneeId
               }}
               isBoardContext={true} // Флаг для контекста доски
            />
         )}
      </DragDropContext>
   );
}
