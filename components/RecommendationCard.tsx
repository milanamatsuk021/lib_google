import React from 'react';
import { RecommendedBook, RecommendedBookWithStatus } from '../types';

/**
 * Компонент RecommendationCard.
 * Отображает карточку с рекомендованной книгой, полученной от AI.
 * Содержит название, автора, причину рекомендации и кнопку для добавления в "Хочу прочитать".
 * @param {object} props - Свойства компонента.
 * @param {RecommendedBookWithStatus} props.book - Объект рекомендованной книги.
 * @param {(book: RecommendedBook) => void} props.onAddToWantToRead - Функция для добавления книги в список желаний.
 * @returns {React.FC} JSX-элемент карточки рекомендации.
 */
export const RecommendationCard: React.FC<{
    book: RecommendedBookWithStatus;
    onAddToWantToRead: (book: RecommendedBook) => void;
}> = ({ book, onAddToWantToRead }) => (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col space-y-3">
        <div>
            <h3 className="font-bold text-lg text-gray-900">{book.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{book.author}</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-md flex items-start space-x-3">
            <span className="text-xl flex-shrink-0 mt-0.5">💡</span>
            <p className="text-sm text-blue-900">
                <span className="font-semibold">Почему это может вам понравиться:</span> {book.reason}
            </p>
        </div>
        <div className="pt-2">
            <button
                onClick={() => onAddToWantToRead(book)}
                disabled={book.isAddedToWantToRead}
                className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    book.isAddedToWantToRead
                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
            >
                {book.isAddedToWantToRead ? 'В списке ✓' : 'Хочу прочитать'}
            </button>
        </div>
    </div>
);