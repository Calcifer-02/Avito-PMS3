// src/pages/BoardsPage.tsx
import { useEffect, useState } from "react"; // Импортируем хуки для работы с состоянием и эффектами
import { Link } from "react-router-dom"; // Импортируем компонент Link для навигации между страницами
import { getBoards } from "../api/boards"; // Функция для получения списка досок с API
import type { Board } from "../types/board"; // Тип данных для доски
import styles from "../styles/Boards.module.css"; // Стили для страницы досок

export default function BoardsPage() {
   // Состояние для хранения списка досок
   const [boards, setBoards] = useState<Board[]>([]);
   // Состояние для индикатора загрузки данных
   const [loading, setLoading] = useState(true);
   // Состояние для хранения ошибок
   const [error, setError] = useState<string | null>(null);

   // Хук useEffect, который вызывается при монтировании компонента
   useEffect(() => {
      // Асинхронная функция для получения данных о досках
      const fetchBoards = async () => {
         try {
            // Получаем данные о досках через API
            const data = await getBoards();
            setBoards(data); // Устанавливаем полученные доски в состояние
            setLoading(false); // Завершаем загрузку
         } catch (err) {
            setError("Ошибка загрузки досок"); // Если ошибка, устанавливаем сообщение об ошибке
            setLoading(false); // Завершаем загрузку
         }
      };
      fetchBoards(); // Вызываем функцию получения данных
   }, []); // Пустой массив зависимостей означает, что эффект выполнится только один раз при монтировании компонента

   // Если идет загрузка, отображаем индикатор загрузки
   if (loading) return <div className={styles.page}>Загрузка...</div>;
   // Если произошла ошибка, отображаем сообщение об ошибке
   if (error) return <div className={styles.page}>{error}</div>;

   return (
      <div className={styles.page}>
         <div className={styles.boardsList}>
            <h1 className={styles.title}>Доски</h1>
            <div className={styles.boardList}>
               {/* Перебираем все доски и отображаем их */}
               {boards.map((board) => (
                  <div key={board.id} className={styles.boardItem}>
                     <div className={styles.boardContent}>
                        <div>
                           {/* Название доски */}
                           <h2 className={styles.boardName}>{board.name}</h2>
                           {/* Описание доски */}
                           <p className={styles.boardDescription}>
                              {board.description}
                           </p>
                        </div>
                        {/* Ссылка на страницу конкретной доски */}
                        <Link
                           to={`/board/${board.id}`} // Переход на страницу с задачами доски
                           className={styles.boardButton}
                        >
                           Открыть
                        </Link>
                     </div>
                     {/* Количество задач на доске */}
                     <p>Количество задач: {board.taskCount}</p>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
}
