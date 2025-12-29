import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center max-w-md"
      >
        <h1 className="text-3xl font-bold mb-4">
          Платформа для дизайнеров
        </h1>
        <p className="text-muted-foreground mb-8">
          Задачи, батлы, оценка навыков и менторство
        </p>
        
        <div className="grid gap-4 text-left">
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-1">Задачи</h3>
            <p className="text-sm text-muted-foreground">Решайте дизайн-задачи разного уровня сложности</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-1">Дизайн батлы</h3>
            <p className="text-sm text-muted-foreground">Соревнуйтесь с другими дизайнерами</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-1">Оценка навыков</h3>
            <p className="text-sm text-muted-foreground">Узнайте свой уровень и рекомендованную ЗП</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-1">Менторы</h3>
            <p className="text-sm text-muted-foreground">Получите консультацию от профессионалов</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
