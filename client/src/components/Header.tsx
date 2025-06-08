// src/components/Header.tsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom"; // Импортируем компоненты для навигации
import styles from "../styles/Header.module.css"; // Подключаем стили для хедера
import ModalTaskForm from "./ModalTaskForm"; // ✅ Импортируем форму для создания задачи

const Header = () => {
   // Получаем текущий путь из хука useLocation
   const location = useLocation();
   const pathName = location.pathname;

   // Состояние для отображения модального окна
   const [showModal, setShowModal] = useState(false);

   // Извлекаем boardId из пути, если это /board/:id
   const boardMatch = pathName.match(/^\/board\/(\d+)$/);
   // Если путь совпадает с /board/:id, то извлекаем ID доски
   const boardIdFromPath = boardMatch ? parseInt(boardMatch[1], 10) : 0;

   // Проверка, находимся ли мы в контексте доски (есть ли boardId в пути)
   const isBoardContext = !!boardIdFromPath;

   // Функция, которая будет вызываться после создания задачи (пока не реализована)
   const handleTaskCreated = () => {};

   return (
      <>
         <header className={styles.headerWrapper}>
            <div className={styles.container}>
               {/* Верхняя часть хедера: отображаем текущий путь */}
               <div className={styles.pathBlock}>
                  <span className={styles.path}>{pathName}</span> {/* Путь */}
                  <div className={styles.border}></div>{" "}
                  {/* Горизонтальная линия */}
               </div>

               {/* Нижняя часть хедера: навигационные ссылки и кнопка */}
               <div className={styles.navBlock}>
                  <div className={styles.leftSide}>
                     {/* Ссылка на страницу с задачами */}
                     <Link
                        to="/issues"
                        className={`${styles.navLink} ${
                           pathName === "/issues" ? styles.activeLink : ""
                        }`}
                     >
                        Все задачи
                     </Link>

                     {/* Ссылка на страницу с проектами */}
                     <Link
                        to="/boards"
                        className={`${styles.navLink} ${
                           pathName.startsWith("/boards") ||
                           pathName.startsWith("/board/")
                              ? styles.activeLink
                              : ""
                        }`}
                     >
                        Проекты
                     </Link>
                  </div>

                  {/* Кнопка для открытия модального окна создания задачи */}
                  <button
                     onClick={() => setShowModal(true)} // По клику показываем модальное окно
                     className={styles.navButton}
                  >
                     Создать задачу
                  </button>
               </div>
            </div>
         </header>

         {/* Модальное окно для создания задачи */}
         {showModal && (
            <ModalTaskForm
               isOpen={showModal} // Передаем флаг для отображения модального окна
               onClose={() => setShowModal(false)} // Закрытие модального окна
               onSubmit={handleTaskCreated} // Функция, которая будет вызвана при создании задачи
               initialData={{
                  title: "", // Начальные данные для формы (пустые значения)
                  description: "",
                  assigneeId: 0,
                  boardId: boardIdFromPath, // ID доски (извлеченный из пути)
                  priority: "Medium", // Приоритет по умолчанию
               }}
               isBoardContext={isBoardContext} // Флаг, указывающий на контекст доски
            />
         )}
      </>
   );
};

export default Header;
