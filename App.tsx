import React, { useState, useEffect } from 'react';
import { Book, BookCategory, PhysicalStatus, View, RawBook, RecommendedBook, RecommendedBookWithStatus } from './types';
import { searchBooks } from './services/googleBooksService';
import { getRecommendationsFromGemini } from './services/geminiService';
import { dbService } from './services/dbService';

import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Spinner } from './components/Spinner';
import { BookCard } from './components/BookCard';
import { SearchResultCard } from './components/SearchResultCard';
import { RecommendationCard } from './components/RecommendationCard';
import { ManualAddBookModal } from './components/ManualAddBookModal';
import { AddBookModal } from './components/AddBookModal';
import { BookDetailsModal } from './components/BookDetailsModal';


/**
 * Главный компонент приложения "Моя Книжная Полка".
 * Управляет состоянием всего приложения, включая:
 * - Текущий отображаемый экран (view)
 * - Список книг пользователя (загружается из IndexedDB)
 * - Логику поиска и отображения результатов
 * - Логику получения и отображения рекомендаций
 * - Управление модальными окнами для добавления и редактирования книг.
 * @returns {React.FC} Корневой JSX-элемент приложения.
 */
const App: React.FC = () => {
  // --- СОСТОЯНИЯ (STATES) ---
  const [activeView, setActiveView] = useState<View>(View.LIBRARY);
  const [activeTab, setActiveTab] = useState<BookCategory>(BookCategory.READING);
  
  // Состояние для всех книг, загружается из IndexedDB
  const [books, setBooks] = useState<Book[]>([]);

  // Состояния для поиска
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RawBook[]>([]);
  const [isLoading, setIsLoading] = useState(true); // true initially for db load
  const [searchInAuthor, setSearchInAuthor] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Состояния для рекомендаций
  const [recommendations, setRecommendations] = useState<RecommendedBookWithStatus[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  
  // Состояния для модальных окон
  const [modalBook, setModalBook] = useState<RawBook | null>(null);
  const [detailsBook, setDetailsBook] = useState<Book | null>(null);
  const [isManualAddModalOpen, setIsManualAddModalOpen] = useState(false);
  
  // --- ЭФФЕКТЫ (EFFECTS) ---
  // Загрузка книг из IndexedDB при первом запуске
  useEffect(() => {
    const loadBooks = async () => {
      setIsLoading(true);
      try {
        await dbService.initDB();
        const allBooks = await dbService.getAllBooks();
        setBooks(allBooks);
      } catch (error) {
        console.error("Не удалось загрузить книги из базы данных", error);
        setSearchError("Не удалось загрузить вашу библиотеку.");
      } finally {
        setIsLoading(false);
      }
    };
    loadBooks();
  }, []);


  // --- ФУНКЦИИ-ОБРАБОТЧИКИ ---
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setSearchResults([]);
    setSearchError(null);
    try {
        setSearchResults(await searchBooks(searchQuery, searchInAuthor));
    } catch (error) {
        setSearchError((error as Error).message);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleResetSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
    setSearchInAuthor(false);
  };

  const addBookToLibrary = async (bookToAdd: Book) => {
    if (!books.some(b => b.id === bookToAdd.id)) {
        try {
            await dbService.addBook(bookToAdd);
            setBooks(prev => [...prev, bookToAdd]);
        } catch(error) {
            console.error("Не удалось добавить книгу:", error);
        }
    }
    setModalBook(null);
  };

  const updateBookInLibrary = async (updatedBook: Book) => {
    try {
        await dbService.updateBook(updatedBook);
        setBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
    } catch(error) {
        console.error("Не удалось обновить книгу:", error);
    }
  };

  const deleteBookFromLibrary = async (bookId: string) => {
    try {
        await dbService.deleteBook(bookId);
        setBooks(prev => prev.filter(b => b.id !== bookId));
        setDetailsBook(null);
    } catch(error) {
        console.error("Не удалось удалить книгу:", error);
    }
  };

  const handleManualAdd = (book: RawBook) => {
    setModalBook(book);
    setIsManualAddModalOpen(false);
  };

  const handleGetRecommendations = async () => {
    setIsLoadingRecommendations(true);
    setRecommendations([]);
    setRecommendationError(null);

    const booksForAnalysis = books.filter(
        (b) => b.category === BookCategory.READ || b.category === BookCategory.READING
    );

    if (booksForAnalysis.length < 1) {
        setRecommendationError("Добавьте хотя бы одну книгу в 'Читаю' или 'Прочитано' для получения рекомендаций.");
        setIsLoadingRecommendations(false);
        return;
    }

    try {
        const recommendedBooks = await getRecommendationsFromGemini(booksForAnalysis);
        setRecommendations(recommendedBooks);
    } catch (error) {
        console.error("Ошибка при получении рекомендаций:", error);
        setRecommendationError("Не удалось получить рекомендации. Попробуйте позже.");
    } finally {
        setIsLoadingRecommendations(false);
    }
  };
  
  const handleAddRecommendationToWantToRead = (rec: RecommendedBook) => {
    const bookId = `ai-${rec.title.replace(/\s/g, '')}`;
    const existingBook = books.find(b => b.id === bookId);

    if (!existingBook) {
      const newBook: Book = {
        id: bookId,
        title: rec.title,
        author: rec.author,
        description: rec.reason,
        publisher: 'Не указан',
        series: '',
        category: BookCategory.WANT_TO_READ,
      };
      addBookToLibrary(newBook);
    }
    
    setRecommendations(prev => 
        prev.map(r => r.title === rec.title ? { ...r, isAddedToWantToRead: true } : r)
    );
  };

  // --- ЛОГИКА ОТОБРАЖЕНИЯ ---
  const headerTitle = {
    [View.LIBRARY]: 'Моя библиотека',
    [View.SEARCH]: 'Поиск книг',
    [View.RECOMMENDATIONS]: 'Книги для Вас',
    [View.WISHLIST]: 'Список желаний',
    [View.COLLECTION]: 'Моя коллекция',
  }[activeView];

  const renderView = () => {
    switch (activeView) {
      case View.SEARCH:
        const showReset = searchQuery || searchResults.length > 0 || searchError;
        return (
          <div className="p-4 space-y-4">
            <form onSubmit={handleSearch}>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Название или автор..." className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900" />
              <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <input type="checkbox" id="author-search" checked={searchInAuthor} onChange={(e) => setSearchInAuthor(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <label htmlFor="author-search" className="ml-2 block text-sm text-gray-700">Искать только в авторах</label>
                  </div>
                  {showReset && <button type="button" onClick={handleResetSearch} className="text-sm text-blue-500 hover:underline">Сбросить</button>}
              </div>
            </form>
            {isLoading && <Spinner />}
            {searchError && <p className="text-center text-red-500 p-4 bg-red-50 rounded-lg">{searchError}</p>}
            <div className="space-y-4">{searchResults.map((book) => <SearchResultCard key={book.id} book={book} onAdd={setModalBook} />)}</div>
            {!isLoading && !searchError && searchResults.length === 0 && searchQuery && <p className="text-center text-gray-500">Ничего не найдено.</p>}
            <button onClick={() => setIsManualAddModalOpen(true)} className="fixed bottom-20 right-4 bg-blue-500 text-white rounded-full h-14 w-14 flex items-center justify-center shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" aria-label="Добавить книгу вручную">
              <span className="text-3xl font-light leading-none">+</span>
            </button>
          </div>
        );
      case View.RECOMMENDATIONS:
        return (
            <div className="p-4 space-y-4">
                {isLoadingRecommendations && <Spinner />}
                {recommendationError && <p className="text-center text-red-500 p-4 bg-red-50 rounded-lg">{recommendationError}</p>}

                {recommendations.length > 0 && (
                  <>
                    <div className="space-y-4">
                        {recommendations.map((rec, index) => (
                            <RecommendationCard 
                              key={`${rec.title}-${index}`} 
                              book={rec} 
                              onAddToWantToRead={handleAddRecommendationToWantToRead}
                            />
                        ))}
                    </div>
                     <div className="pt-4">
                        <button 
                            onClick={handleGetRecommendations}
                            disabled={isLoadingRecommendations}
                            className="w-full flex items-center justify-center bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                        >
                            <span className={`inline-block mr-2 ${isLoadingRecommendations ? 'animate-spin' : ''}`}>🔄</span>
                            {isLoadingRecommendations ? 'Ищем новые...' : 'Показать другие'}
                        </button>
                    </div>
                  </>
                )}
                
                {!isLoadingRecommendations && recommendations.length === 0 && !recommendationError && (
                    <div className="text-center p-8 flex flex-col items-center">
                        <span className="text-6xl mb-4">✨</span>
                        <h2 className="text-xl font-bold text-gray-800">Откройте для себя новые книги</h2>
                        <p className="text-gray-600 mt-2 max-w-sm">
                            Искусственный интеллект проанализирует вашу библиотеку и подберёт книги, которые вам точно понравятся.
                        </p>
                        <button 
                            onClick={handleGetRecommendations}
                            className="mt-6 bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-600 transition-transform transform hover:scale-105"
                        >
                            Найти книги для меня
                        </button>
                    </div>
                )}
            </div>
        );
      case View.WISHLIST:
        const wishlistBooks = books.filter(b => b.physicalStatus === PhysicalStatus.WANT_TO_BUY);
        return (
          <div className="p-4 grid grid-cols-2 gap-4">{wishlistBooks.length > 0 ? wishlistBooks.map(book => <BookCard key={book.id} book={book} onSelect={setDetailsBook}/>) : <p className="text-center text-gray-500 col-span-2">Ваш список желаний пуст.</p>}</div>
        );
      case View.COLLECTION:
        const collectionBooks = books.filter(b => b.physicalStatus === PhysicalStatus.OWNED);
        return (
          <div className="p-4 grid grid-cols-2 gap-4">{collectionBooks.length > 0 ? collectionBooks.map(book => <BookCard key={book.id} book={book} onSelect={setDetailsBook}/>) : <p className="text-center text-gray-500 col-span-2">Ваша коллекция пуста.</p>}</div>
        );
      default:
        const filteredBooks = books.filter(b => b.category === activeTab);
        return (
          <div>
            <div className="flex border-b border-gray-200">{Object.values(BookCategory).map(cat => <button key={cat} onClick={() => setActiveTab(cat)} className={`flex-1 py-3 text-sm font-medium ${activeTab === cat ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}>{cat}</button>)}</div>
            {isLoading ? <Spinner /> : <div className="p-4 grid grid-cols-2 gap-4">{filteredBooks.length > 0 ? filteredBooks.map(book => <BookCard key={book.id} book={book} onSelect={setDetailsBook}/>) : <p className="text-center text-gray-500 pt-8 col-span-2">В этой категории пока нет книг.</p>}</div>}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-16">
      <Header title={headerTitle} />
      <main className="max-w-4xl mx-auto">{renderView()}</main>
      <BottomNav activeView={activeView} setView={setActiveView} />
      {isManualAddModalOpen && <ManualAddBookModal onClose={() => setIsManualAddModalOpen(false)} onAdd={handleManualAdd} />}
      {modalBook && <AddBookModal book={modalBook} onAddBook={addBookToLibrary} onClose={() => setModalBook(null)} />}
      {detailsBook && <BookDetailsModal book={detailsBook} onClose={() => setDetailsBook(null)} onUpdate={updateBookInLibrary} onDelete={deleteBookFromLibrary} />}
    </div>
  );
};

export default App;
