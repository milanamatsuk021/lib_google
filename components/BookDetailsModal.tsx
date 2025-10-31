import React from 'react';
import { Book, BookCategory, PhysicalStatus, SelectOption } from '../types';
import { Select } from './ui/Select';

/**
 * Компонент BookDetailsModal.
 * Модальное окно для просмотра и редактирования деталей уже добавленной в библиотеку книги.
 * Позволяет изменять категорию, физический статус, а также удалять книгу.
 * @param {object} props - Свойства компонента.
 * @param {Book | null} props.book - Объект выбранной книги. Если null, модальное окно не отображается.
 * @param {() => void} props.onClose - Функция для закрытия модального окна.
 * @param {(updatedBook: Book) => void} props.onUpdate - Функция для сохранения изменений в книге.
 * @param {(bookId: string) => void} props.onDelete - Функция для удаления книги из библиотеки.
 * @returns {React.FC | null} JSX-элемент модального окна или null.
 */
export const BookDetailsModal: React.FC<{ book: Book | null, onClose: () => void, onUpdate: (updatedBook: Book) => void, onDelete: (bookId: string) => void }> = ({ book, onClose, onUpdate, onDelete }) => {
    if (!book) return null;

    const categoryOptions: SelectOption[] = Object.values(BookCategory).map(cat => ({ value: cat, label: cat }));
    const statusOptions: SelectOption[] = Object.values(PhysicalStatus).map(stat => ({ value: stat, label: stat }));

    const handleCategoryChange = (value: string) => onUpdate({ ...book, category: value as BookCategory });
    const handleStatusChange = (value: string) => onUpdate({ ...book, physicalStatus: value as PhysicalStatus || undefined });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-end">
                        <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">{book.title}</h2>
                        <p className="text-lg text-gray-600 mt-1">{book.author}</p>
                        <p className="text-sm text-gray-500 mt-2">{book.publisher}{book.series && `, ${book.series}`}</p>
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <Select
                            label="Категория"
                            value={book.category}
                            onChange={handleCategoryChange}
                            options={categoryOptions}
                        />
                        <Select
                            label="Статус"
                            value={book.physicalStatus || ''}
                            onChange={handleStatusChange}
                            options={statusOptions}
                            placeholder="Не выбрано"
                        />
                    </div>
                    <p className="text-sm text-gray-600 mt-4">{book.description}</p>
                </div>
                <div className="px-6 py-4">
                    <button onClick={() => onDelete(book.id)} className="w-full bg-red-500 text-white py-2 px-4 rounded-md font-semibold hover:bg-red-600">Удалить из библиотеки</button>
                </div>
            </div>
        </div>
    );
};
