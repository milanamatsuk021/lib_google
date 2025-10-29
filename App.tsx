import React, { useState, useEffect } from 'react';

// --- ТИПЫ ДАННЫХ ---
// Перечисления (Enums) для категорий и статусов книг
export enum BookCategory {
  READING = 'Читаю',
  READ = 'Прочитано',
  WANT_TO_READ = 'Хочу прочитать',
}

export enum PhysicalStatus {
  OWNED = 'В коллекции',
  WANT_TO_BUY = 'Хочу купить',
}

// Интерфейс для книги в библиотеке
export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  publisher: string;
  series: string;
  category: BookCategory;
  physicalStatus?: PhysicalStatus;
}

// "Сырой" тип книги, получаемый из поиска (без категорий)
export type RawBook = Omit<Book, 'category' | 'physicalStatus'>;

// Перечисление для навигации по экранам
export enum View {
  LIBRARY,
  SEARCH,
  WISHLIST,
  COLLECTION,
}


// --- КОМПОНЕНТЫ ИКОНОК ---
const BookOpenIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-9-5.996h18m-18 0a9 9 0 0118 0m-18 0a9 9 0 0018 0" />
  </svg>
);

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const HeartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.757l1.318-1.439a4.5 4.5 0 016.364 6.364l-7.682 7.682a.5.5 0 01-.707 0L4.318 12.682a4.5 4.5 0 010-6.364z" />
  </svg>
);

const CollectionIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0v-16m0 16a2 2 0 002 2h8a2 2 0 002-2m-10 0v-1" />
  </svg>
);

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ---

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

const Header: React.FC<{ title: string }> = ({ title }) => (
    <header className="sticky top-0 z-10 bg-white shadow-sm w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-16">
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            </div>
        </div>
    </header>
);

const BottomNav: React.FC<{
  activeView: View;
  setView: (view: View) => void;
}> = ({ activeView, setView }) => {
  const NavItem: React.FC<{
    icon: React.ElementType;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }> = ({ icon: Icon, label, isActive, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center w-full pt-2 pb-1 text-sm transition-colors duration-200">
      <Icon className={`h-6 w-6 mb-1 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
      <span className={`transition-opacity ${isActive ? 'text-blue-500 font-semibold' : 'text-gray-500'}`}>{label}</span>
    </button>
  );

  const navItems = [
    { view: View.LIBRARY, icon: BookOpenIcon, label: 'Библиотека' },
    { view: View.SEARCH, icon: SearchIcon, label: 'Поиск' },
    { view: View.WISHLIST, icon: HeartIcon, label: 'Желания' },
    { view: View.COLLECTION, icon: CollectionIcon, label: 'Коллекция' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 shadow-[0_-2px_5px_rgba(0,0,0,0.05)] flex justify-around">
      {navItems.map((item) => (
        <NavItem
          key={item.view}
          icon={item.icon}
          label={item.label}
          isActive={activeView === item.view}
          onClick={() => setView(item.view)}
        />
      ))}
    </div>
  );
};

const BookCard: React.FC<{
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

const ManualAddBookModal: React.FC<{
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
                    <button onClick={onClose}><XIcon className="w-6 h-6 text-gray-500" /></button>
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

const SearchResultCard: React.FC<{ book: RawBook, onAdd: (book: RawBook) => void }> = ({ book, onAdd }) => (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col">
        <div>
            <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{book.title}</h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-1">{book.author}</p>
            <p className="text-xs text-gray-500 mt-2 line-clamp-3">{book.description}</p>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
            <button onClick={() => onAdd(book)} className="w-full bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 flex items-center justify-center">
                <PlusIcon className="w-4 h-4 mr-1" />Добавить
            </button>
        </div>
    </div>
);

const AddBookModal: React.FC<{ book: RawBook, onAddBook: (book: Book) => void, onClose: () => void }> = ({ book, onAddBook, onClose }) => {
    const [category, setCategory] = useState<BookCategory>(BookCategory.WANT_TO_READ);
    const [physicalStatus, setPhysicalStatus] = useState<PhysicalStatus | undefined>(undefined);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-gray-900">Добавить книгу</h2><button onClick={onClose}><XIcon className="w-6 h-6 text-gray-500" /></button></div>
                <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-2">Категория</label><select value={category} onChange={(e) => setCategory(e.target.value as BookCategory)} className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900">{Object.values(BookCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                <div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-2">Физический статус</label><select value={physicalStatus || ''} onChange={(e) => setPhysicalStatus(e.target.value as PhysicalStatus || undefined)} className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"><option value="">Не выбрано</option>{Object.values(PhysicalStatus).map(stat => <option key={stat} value={stat}>{stat}</option>)}</select></div>
                <button onClick={() => onAddBook({ ...book, category, physicalStatus })} className="w-full bg-blue-500 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-600">Добавить в библиотеку</button>
            </div>
        </div>
    );
};

const BookDetailsModal: React.FC<{ book: Book | null, onClose: () => void, onUpdate: (updatedBook: Book) => void, onDelete: (bookId: string) => void }> = ({ book, onClose, onUpdate, onDelete }) => {
    if (!book) return null;

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => onUpdate({ ...book, category: e.target.value as BookCategory });
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => onUpdate({ ...book, physicalStatus: e.target.value as PhysicalStatus || undefined });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6"><div className="flex justify-end"><button onClick={onClose}><XIcon className="w-6 h-6 text-gray-500" /></button></div><div className="text-center"><h2 className="text-2xl font-bold text-gray-900">{book.title}</h2><p className="text-lg text-gray-600 mt-1">{book.author}</p><p className="text-sm text-gray-500 mt-2">{book.publisher}{book.series && `, ${book.series}`}</p></div></div>
                <div className="px-6 py-4 bg-gray-50"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Категория</label><select value={book.category} onChange={handleCategoryChange} className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900">{Object.values(BookCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Статус</label><select value={book.physicalStatus || ''} onChange={handleStatusChange} className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"><option value="">Не выбрано</option>{Object.values(PhysicalStatus).map(stat => <option key={stat} value={stat}>{stat}</option>)}</select></div></div><p className="text-sm text-gray-600 mt-4">{book.description}</p></div>
                <div className="px-6 py-4"><button onClick={() => onDelete(book.id)} className="w-full bg-red-500 text-white py-2 px-4 rounded-md font-semibold hover:bg-red-600">Удалить из библиотеки</button></div>
            </div>
        </div>
    );
};

// --- СЕРВИС ПОИСКА ---
const searchBooks = async (query: string, searchInAuthor: boolean): Promise<RawBook[]> => {
  if (!query.trim()) return [];
  
  const q = searchInAuthor ? `inauthor:"${query}"` : query;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=10&lang=ru`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Сервис поиска временно недоступен. Попробуйте позже.');
    
    const data = await response.json();
    if (!data.items) return [];

    return data.items.map((item: any): RawBook | null => {
      if (!item.volumeInfo?.title || !item.id) return null;
      return {
        id: item.id,
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors?.join(', ') || 'Автор не указан',
        description: item.volumeInfo.description || 'Описание отсутствует.',
        publisher: item.volumeInfo.publisher || 'Издатель не указан',
        series: '', // Google Books API не предоставляет надежного поля для серии
      };
    }).filter((book): book is RawBook => book !== null);

  } catch (error) {
    console.error("Ошибка при поиске книг:", error);
    throw new Error('Не удалось выполнить поиск. Проверьте подключение к интернету.');
  }
};


// --- ГЛАВНЫЙ КОМПОНЕНТ ПРИЛОЖЕНИЯ ---
const App: React.FC = () => {
  // --- СОСТОЯНИЯ (STATES) ---
  const [activeView, setActiveView] = useState<View>(View.LIBRARY);
  const [activeTab, setActiveTab] = useState<BookCategory>(BookCategory.READING);
  
  // Состояние для всех книг, с логикой сохранения в localStorage
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const item = window.localStorage.getItem('books');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error("Ошибка чтения из localStorage:", error);
      return [];
    }
  });

  // Эффект для записи в localStorage при изменении списка книг
  useEffect(() => {
    try {
      window.localStorage.setItem('books', JSON.stringify(books));
    } catch (error) {
      console.error("Ошибка записи в localStorage:", error);
    }
  }, [books]);

  // Состояния для поиска
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RawBook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInAuthor, setSearchInAuthor] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Состояния для модальных окон
  const [modalBook, setModalBook] = useState<RawBook | null>(null);
  const [detailsBook, setDetailsBook] = useState<Book | null>(null);
  const [isManualAddModalOpen, setIsManualAddModalOpen] = useState(false);


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

  const addBookToLibrary = (bookToAdd: Book) => {
    if (!books.some(b => b.id === bookToAdd.id)) {
      setBooks(prev => [...prev, bookToAdd]);
    }
    setModalBook(null);
  };

  const updateBookInLibrary = (updatedBook: Book) => {
    setBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
  };



  const deleteBookFromLibrary = (bookId: string) => {
    setBooks(prev => prev.filter(b => b.id !== bookId));
    setDetailsBook(null);
  };

  const handleManualAdd = (book: RawBook) => {
    setModalBook(book);
    setIsManualAddModalOpen(false);
  };

  // --- ЛОГИКА ОТОБРАЖЕНИЯ ---
  const headerTitle = {
    [View.LIBRARY]: 'Моя библиотека',
    [View.SEARCH]: 'Поиск книг',
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
            <button onClick={() => setIsManualAddModalOpen(true)} className="fixed bottom-20 right-4 bg-blue-500 text-white rounded-full p-4 shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" aria-label="Добавить книгу вручную"><PlusIcon className="w-6 h-6" /></button>
          </div>
        );
      case View.WISHLIST:
        const wishlistBooks = books.filter(b => b.physicalStatus === PhysicalStatus.WANT_TO_BUY);
        return (
          <div className="p-4 space-y-4">{wishlistBooks.length > 0 ? wishlistBooks.map(book => <BookCard key={book.id} book={book} onSelect={setDetailsBook}/>) : <p className="text-center text-gray-500">Ваш список желаний пуст.</p>}</div>
        );
      case View.COLLECTION:
        const collectionBooks = books.filter(b => b.physicalStatus === PhysicalStatus.OWNED);
        return (
          <div className="p-4 space-y-4">{collectionBooks.length > 0 ? collectionBooks.map(book => <BookCard key={book.id} book={book} onSelect={setDetailsBook}/>) : <p className="text-center text-gray-500">Ваша коллекция пуста.</p>}</div>
        );
      default:
        const filteredBooks = books.filter(b => b.category === activeTab);
        return (
          <div>
            <div className="flex border-b border-gray-200">{Object.values(BookCategory).map(cat => <button key={cat} onClick={() => setActiveTab(cat)} className={`flex-1 py-3 text-sm font-medium ${activeTab === cat ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}>{cat}</button>)}</div>
            <div className="p-4 space-y-4">{filteredBooks.length > 0 ? filteredBooks.map(book => <BookCard key={book.id} book={book} onSelect={setDetailsBook}/>) : <p className="text-center text-gray-500 pt-8">В этой категории пока нет книг.</p>}</div>
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
