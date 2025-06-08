// src/pages/BoardsPage.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBoards } from "../api/boards";
import type { Board } from "../types/board";
import styles from "../styles/Boards.module.css";

export default function BoardsPage() {
   const [boards, setBoards] = useState<Board[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const fetchBoards = async () => {
         try {
            const data = await getBoards();
            setBoards(data);
            setLoading(false);
         } catch (err) {
            setError("Ошибка загрузки досок");
            setLoading(false);
         }
      };
      fetchBoards();
   }, []);

   if (loading) return <div className={styles.page}>Загрузка...</div>;
   if (error) return <div className={styles.page}>{error}</div>;

   return (
      <div className={styles.page}>
         <div className={styles.boardsList}>
            <h1 className={styles.title}>Доски</h1>
            <div className={styles.boardList}>
               {boards.map((board) => (
                  <div key={board.id} className={styles.boardItem}>
                     <div className={styles.boardContent}>
                        <div>
                           <h2 className={styles.boardName}>{board.name}</h2>
                           <p className={styles.boardDescription}>
                              {board.description}
                           </p>
                        </div>
                        <Link
                           to={`/board/${board.id}`}
                           className={styles.boardButton}
                        >
                           Открыть
                        </Link>
                     </div>
                     <p>Количество задач: {board.taskCount}</p>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
}
