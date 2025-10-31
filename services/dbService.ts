import { Book } from '../types';

const DB_NAME = 'MyBookShelfDB';
const DB_VERSION = 1;
const STORE_NAME = 'books';

let db: IDBDatabase;

/**
 * Промис-обертка для IDBRequest для удобной работы с async/await.
 * @param request - Запрос к IndexedDB.
 * @returns Промис, который разрешается с результатом запроса или отклоняется с ошибкой.
 */
const requestToPromise = <T>(request: IDBRequest<T>): Promise<T> => {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Открывает (или создает) базу данных IndexedDB.
 * @returns Промис, который разрешается с экземпляром IDBDatabase.
 */
const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        // Если база данных уже открыта, возвращаем существующий экземпляр
        if (db) {
            return resolve(db);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('Database error:', request.error);
            reject('Ошибка при открытии базы данных');
        };

        request.onsuccess = (event) => {
            db = (event.target as IDBOpenDBRequest).result;
            resolve(db);
        };

        // Этот обработчик вызывается только при создании новой БД или увеличении версии
        request.onupgradeneeded = (event) => {
            const tempDb = (event.target as IDBOpenDBRequest).result;
            if (!tempDb.objectStoreNames.contains(STORE_NAME)) {
                tempDb.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
};

/**
 * Заполняет базу данных начальными данными из файла initial-books.json, если она пуста.
 * @param database - Экземпляр IDBDatabase.
 */
const populateInitialData = async (database: IDBDatabase) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const countRequest = store.count();
    const count = await requestToPromise(countRequest);

    if (count === 0) {
        console.log('База данных пуста, заполняем начальными данными...');
        try {
            const response = await fetch('./initial-books.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const initialBooks: Book[] = await response.json();
            
            const writeTransaction = database.transaction(STORE_NAME, 'readwrite');
            const writeStore = writeTransaction.objectStore(STORE_NAME);
            initialBooks.forEach(book => writeStore.add(book));
            
            return new Promise<void>((resolve, reject) => {
                writeTransaction.oncomplete = () => resolve();
                writeTransaction.onerror = () => reject(writeTransaction.error);
            });
        } catch (error) {
            console.error("Не удалось получить или заполнить начальные данные:", error);
        }
    }
};

/**
 * Объект `dbService` предоставляет удобный интерфейс для работы с IndexedDB.
 */
export const dbService = {
    /**
     * Инициализирует базу данных: открывает соединение и заполняет начальными данными при необходимости.
     */
    async initDB() {
        const database = await openDB();
        await populateInitialData(database);
    },

    /**
     * Получает все книги из базы данных.
     * @returns Промис, который разрешается с массивом всех книг.
     */
    async getAllBooks(): Promise<Book[]> {
        const database = await openDB();
        const transaction = database.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        return await requestToPromise(request);
    },

    /**
     * Добавляет новую книгу в базу данных.
     * @param book - Объект книги для добавления.
     * @returns Промис, который разрешается с ID добавленной книги.
     */
    async addBook(book: Book): Promise<string> {
        const database = await openDB();
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(book);
        return (await requestToPromise(request)) as string;
    },

    /**
     * Обновляет существующую книгу в базе данных.
     * @param book - Объект книги с обновленными данными.
     * @returns Промис, который разрешается с ID обновленной книги.
     */
    async updateBook(book: Book): Promise<string> {
        const database = await openDB();
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(book);
        return (await requestToPromise(request)) as string;
    },

    /**
     * Удаляет книгу из базы данных по ее ID.
     * @param id - ID книги для удаления.
     */
    async deleteBook(id: string): Promise<void> {
        const database = await openDB();
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);
        await requestToPromise(request);
    }
};
