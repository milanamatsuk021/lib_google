import React from 'react';
import { View } from '../types';

/**
 * Компонент BottomNav.
 * Отображает нижнюю панель навигации для переключения между основными экранами приложения.
 * @param {object} props - Свойства компонента.
 * @param {View} props.activeView - Текущий активный экран.
 * @param {(view: View) => void} props.setView - Функция для установки нового активного экрана.
 * @returns {React.FC} JSX-элемент навигационной панели.
 */
export const BottomNav: React.FC<{
  activeView: View;
  setView: (view: View) => void;
}> = ({ activeView, setView }) => {
  /**
   * Внутренний компонент для отдельного элемента навигации.
   * @param {object} props - Свойства элемента навигации.
   * @returns {React.FC} JSX-элемент кнопки навигации.
   */
  const NavItem: React.FC<{
    emoji: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }> = ({ emoji, label, isActive, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center w-full pt-2 pb-1 text-sm transition-colors duration-200">
      <span className={`text-2xl mb-1 transition-transform duration-200 ${isActive ? 'scale-110' : 'opacity-70'}`}>{emoji}</span>
      <span className={`transition-opacity ${isActive ? 'text-blue-500 font-semibold' : 'text-gray-500'}`}>{label}</span>
    </button>
  );

  const navItems = [
    { view: View.LIBRARY, emoji: '📚', label: 'Библиотека' },
    { view: View.SEARCH, emoji: '🔍', label: 'Поиск' },
    { view: View.RECOMMENDATIONS, emoji: '✨', label: 'Для Вас' },
    { view: View.WISHLIST, emoji: '❤️', label: 'Желания' },
    { view: View.COLLECTION, emoji: '📋', label: 'Коллекция' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 shadow-[0_-2px_5px_rgba(0,0,0,0.05)] flex justify-around z-20">
      {navItems.map((item) => (
        <NavItem
          key={item.view}
          emoji={item.emoji}
          label={item.label}
          isActive={activeView === item.view}
          onClick={() => setView(item.view)}
        />
      ))}
    </div>
  );
};