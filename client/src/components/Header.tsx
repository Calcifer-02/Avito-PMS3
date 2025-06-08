// src/components/Header.tsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "../styles/Header.module.css";
import ModalTaskForm from "./ModalTaskForm"; // ✅ Импортируем форму

const Header = () => {
   const location = useLocation();
   const pathName = location.pathname;

   const [showModal, setShowModal] = useState(false);

   // Извлекаем boardId из пути, если это /board/:id
   const boardMatch = pathName.match(/^\/board\/(\d+)$/);
   const boardIdFromPath = boardMatch ? parseInt(boardMatch[1], 10) : 0;

   const isBoardContext = !!boardIdFromPath;

   const handleTaskCreated = () => {
      // Можно добавить логику обновления данных на странице
      // или просто закрыть модальное окно
   };

   return (
      <>
         <header className={styles.headerWrapper}>
            <div className={styles.container}>
               {/* Верхняя часть: путь */}
               <div className={styles.pathBlock}>
                  <span className={styles.path}>{pathName}</span>
                  <div className={styles.border}></div>
               </div>

               {/* Нижняя часть: навигация */}
               <div className={styles.navBlock}>
                  <div className={styles.leftSide}>
                     <Link
                        to="/issues"
                        className={`${styles.navLink} ${
                           pathName === "/issues" ? styles.activeLink : ""
                        }`}
                     >
                        Все задачи
                     </Link>
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

                  <button
                     onClick={() => setShowModal(true)}
                     className={styles.navButton}
                  >
                     Создать задачу
                  </button>
               </div>
            </div>
         </header>

         {/* Модальное окно */}
         {showModal && (
            <ModalTaskForm
               isOpen={showModal}
               onClose={() => setShowModal(false)}
               onSubmit={handleTaskCreated}
               initialData={{
                  title: "",
                  description: "",
                  assigneeId: 0,
                  boardId: boardIdFromPath,
                  priority: "Medium",
               }}
               isBoardContext={isBoardContext}
            />
         )}
      </>
   );
};

export default Header;
