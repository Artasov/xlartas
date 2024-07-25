import React, {useState, useEffect, useCallback} from 'react';
import axiosInstance from "../../auth/axiosConfig";
import "./Search.css"
import debounce from "../../../../services/base/debounce";

const SearchComponent = ({searchUrl, processResults, className = ''}) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    const search = async (searchQuery) => {
        try {
            const response = await axiosInstance.get(`${searchUrl}?query=${searchQuery}`);
            setResults(processResults(response.data));
        } catch (error) {
            console.error('Ошибка поиска:', error);
        }
    };

    const debouncedSearch = useCallback(debounce((searchQuery) => {
        if (searchQuery.length > 0) {
            search(searchQuery).then(r => {
            });
        } else {
            setResults([]);
        }
    }, 300), []);
    useEffect(() => {
        debouncedSearch(query);

        // Очистка таймаута
        return () => {
            if (debouncedSearch.cancel) {
                debouncedSearch.cancel();
            }
        };
    }, [query, debouncedSearch]);
    return (
        <div className={`${className} search-field`}>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск..."
            />
            <ul>
                {results.map((result, index) => (
                    <li key={index}>{result}</li>
                ))}
            </ul>
        </div>
    );
};

export default SearchComponent;