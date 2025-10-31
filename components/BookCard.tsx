import React from 'react';
import { Book, PhysicalStatus } from '../types';

/**
 * Компонент BookCard.
 * Отображает карточку книги в списках (библиотека, коллекция, желания).
 * Показывает название, автора, категорию и физический статус.
 * @param {object} props - Свойства компонента.
 * @param {Book} props.book - Объект книги для отображения.
 * @param {(book: Book) => void} props.onSelect - Функция обратного вызова при клике на карточку.
 * @returns {React.FC} JSX-элемент карточки книги.
 */
export const BookCard: React.FC<{
  book: Book;
  onSelect: (book: Book) => void;
}> = ({ book, onSelect }) => (
  <div 
    className="bg-white rounded-lg shadow p-4 cursor-pointer transition-transform duration-200 hover:scale-105 flex flex-col justify-between"
    onClick={() => onSelect(book)}
  >
    <div>
      <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{book.title}</h3>
      <p className="text-sm text-gray-600 mt-1">{book.author}</p>
    </div>
    <div className="mt-4 flex items-center justify-between">
       <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{book.category}</span>
       {book.physicalStatus && (
         <span className={`text-xs px-2 py-1 rounded-full ${
            book.physicalStatus === PhysicalStatus.OWNED 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
         }`}>
            {book.physicalStatus}
         </span>
       )}
    </div>
  </div>
);