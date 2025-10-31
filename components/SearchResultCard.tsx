import React from 'react';
import { RawBook } from '../types';

/**
 * Компонент SearchResultCard.
 * Отображает карточку книги в результатах поиска.
 * Показывает название, автора, описание и кнопку для добавления в библиотеку.
 * @param {object} props - Свойства компонента.
 * @param {RawBook} props.book - Объект найденной книги.
 * @param {(book: RawBook) => void} props.onAdd - Функция, вызываемая при нажатии кнопки "Добавить".
 * @returns {React.FC} JSX-элемент карточки результата поиска.
 */
export const SearchResultCard: React.FC<{ book: RawBook, onAdd: (book: RawBook) => void }> = ({ book, onAdd }) => (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col">
        <div>
            <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{book.title}</h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-1">{book.author}</p>
            <p className="text-xs text-gray-500 mt-2 line-clamp-3">{book.description}</p>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
            <button onClick={() => onAdd(book)} className="w-full bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 flex items-center justify-center">
                <span className="mr-1 font-bold text-lg">+</span>Добавить
            </button>
        </div>
    </div>
);