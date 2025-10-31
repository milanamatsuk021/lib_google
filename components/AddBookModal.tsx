import React, { useState } from 'react';
import { RawBook, Book, BookCategory, PhysicalStatus, SelectOption } from '../types';
import { Select } from './ui/Select';

/**
 * Компонент AddBookModal.
 * Модальное окно, которое появляется после выбора книги в результатах поиска.
 * Позволяет пользователю выбрать категорию и физический статус перед добавлением книги в библиотеку.
 * @param {object} props - Свойства компонента.
 * @param {RawBook} props.book - Книга, выбранная из поиска, для которой настраиваются параметры.
 * @param {(book: Book) => void} props.onAddBook - Функция для добавления книги в библиотеку с выбранными параметрами.
 * @param {() => void} props.onClose - Функция для закрытия модального окна.
 * @returns {React.FC} JSX-элемент модального окна.
 */
export const AddBookModal: React.FC<{ book: RawBook, onAddBook: (book: Book) => void, onClose: () => void }> = ({ book, onAddBook, onClose }) => {
    const [category, setCategory] = useState<BookCategory>(BookCategory.WANT_TO_READ);
    const [physicalStatus, setPhysicalStatus] = useState<string>('');

    const categoryOptions: SelectOption[] = Object.values(BookCategory).map(cat => ({ value: cat, label: cat }));
    const statusOptions: SelectOption[] = Object.values(PhysicalStatus).map(stat => ({ value: stat, label: stat }));

    const handleAdd = () => {
        onAddBook({ 
            ...book, 
            category, 
            physicalStatus: physicalStatus as PhysicalStatus || undefined 
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Добавить книгу</h2>
                    <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                </div>
                
                <Select
                    label="Категория"
                    value={category}
                    onChange={(value) => setCategory(value as BookCategory)}
                    options={categoryOptions}
                />
                
                <Select
                    label="Физический статус"
                    value={physicalStatus}
                    onChange={setPhysicalStatus}
                    options={statusOptions}
                    placeholder="Не выбрано"
                />

                <button onClick={handleAdd} className="w-full bg-blue-500 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-600 mt-2">
                    Добавить в библиотеку
                </button>
            </div>
        </div>
    );
};
