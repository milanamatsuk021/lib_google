import React, { useState } from 'react';
import { RawBook } from '../types';

/**
 * Компонент ManualAddBookModal.
 * Представляет собой модальное окно с формой для ручного добавления книги в библиотеку.
 * @param {object} props - Свойства компонента.
 * @param {() => void} props.onClose - Функция для закрытия модального окна.
 * @param {(book: RawBook) => void} props.onAdd - Функция, вызываемая при добавлении книги с данными из формы.
 * @returns {React.FC} JSX-элемент модального окна.
 */
export const ManualAddBookModal: React.FC<{
    onClose: () => void;
    onAdd: (book: RawBook) => void;
}> = ({ onClose, onAdd }) => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [publisher, setPublisher] = useState('');
    const [series, setSeries] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!title.trim() || !author.trim()) {
            setError('Название и автор обязательны для заполнения.');
            return;
        }
        setError('');
        onAdd({
            id: `manual-${Date.now()}`,
            title: title.trim(),
            author: author.trim(),
            description: description.trim() || 'Описание отсутствует.',
            publisher: publisher.trim() || 'Издатель не указан',
            series: series.trim(),
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Добавить книгу вручную</h2>
                    <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                </div>
                {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">{error}</p>}
                <div><label className="block text-sm font-medium text-gray-700">Название*</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"/></div>
                <div><label className="block text-sm font-medium text-gray-700">Автор*</label><input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"/></div>
                <div><label className="block text-sm font-medium text-gray-700">Описание</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"></textarea></div>
                <div><label className="block text-sm font-medium text-gray-700">Издатель</label><input type="text" value={publisher} onChange={(e) => setPublisher(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"/></div>
                <div><label className="block text-sm font-medium text-gray-700">Серия</label><input type="text" value={series} onChange={(e) => setSeries(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"/></div>
                <button onClick={handleSubmit} className="w-full bg-blue-500 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-600">Продолжить</button>
            </div>
        </div>
    );
};