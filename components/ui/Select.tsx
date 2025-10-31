import React from 'react';
import { SelectOption } from '../../types';

/**
 * @file Select.tsx
 * @description Универсальный переиспользуемый компонент для выпадающего списка (select).
 * Создан для устранения дублирования кода в модальных окнах.
 * @param {object} props - Свойства компонента.
 * @param {string} props.label - Метка (название) для поля select.
 * @param {string} props.value - Текущее выбранное значение.
 * @param {(value: string) => void} props.onChange - Функция обратного вызова при изменении значения.
 * @param {SelectOption[]} props.options - Массив опций для отображения в списке.
 * @param {string} [props.placeholder] - Текст для опции по умолчанию (не выбрано).
 * @returns {React.FC} JSX-элемент выпадающего списка.
 */
export const Select: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
}> = ({ label, value, onChange, options, placeholder }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        </div>
    );
};
