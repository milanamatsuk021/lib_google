import React from 'react';

/**
 * Компонент Header.
 * Отображает "липкую" шапку приложения с заголовком текущего экрана.
 * @param {object} props - Свойства компонента.
 * @param {string} props.title - Текст заголовка для отображения.
 * @returns {React.FC} JSX-элемент шапки.
 */
export const Header: React.FC<{ title: string }> = ({ title }) => (
    <header className="sticky top-0 z-10 bg-white shadow-sm w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-16">
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            </div>
        </div>
    </header>
);