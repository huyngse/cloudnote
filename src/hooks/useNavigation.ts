// useNavigation.ts
import { useEffect, useState, useCallback } from 'react';

export const useNavigation = () => {
    const [path, setPath] = useState(() => window.location.pathname);
    console.log(path)
    useEffect(() => {
        const handlePop = () => setPath(window.location.pathname);
        window.addEventListener('popstate', handlePop);
        return () => window.removeEventListener('popstate', handlePop);
    }, []);

    const navigate = useCallback((newPath: string) => {
        if (newPath !== path) {
            window.history.pushState({}, '', newPath);
            setPath(newPath);
        }
    }, [path]);

    return { path, navigate };
};
