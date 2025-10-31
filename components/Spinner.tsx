import React from 'react';

/**
 * Компонент Spinner.
 * Отображает анимированный индикатор загрузки.
 * Используется для визуальной обратной связи во время асинхронных операций (например, поиск).
 * @returns {React.FC} JSX-элемент спиннера.
 */
export const Spinner: React.FC = () => (
  <div className="flex justify-center items-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);