// Modules/Core/components/elements/PaginatedList.tsx

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {FC, FCCC} from "WideLayout/Layouts";
import CircularProgress from "Core/components/elements/CircularProgress";

interface PaginatedListProps<T> {
    loadData: (page: number) => Promise<T[]>;
    renderItem: (item: T, index: number) => React.ReactNode;
    pageSize?: number;
    className?: string;
    style?: React.CSSProperties;
    resetTrigger?: any;
    loadMoreAtTop?: boolean;
    renderEmpty?: () => React.ReactNode;
}

const PaginatedList = <T extends unknown>(
    {
        loadData,
        renderItem,
        pageSize = 10,
        className,
        style,
        resetTrigger,
        loadMoreAtTop = false,
        renderEmpty,
    }: PaginatedListProps<T>) => {
    const [data, setData] = useState<T[]>([]);
    const [page, setPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const observer = useRef<IntersectionObserver | null>(null);
    const targetRef = useRef<HTMLDivElement | null>(null);

    const loadMoreData = useCallback(async () => {
        if (loading || !hasMore) return;
        setLoading(true);
        try {
            const newData = await loadData(page);
            setData(prev => loadMoreAtTop ? [...newData, ...prev] : [...prev, ...newData]);
            setHasMore(newData.length === pageSize);
            setPage(prev => prev + 1);
        } catch (error) {
            console.error(error);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [loadData, page, hasMore, loading, pageSize, loadMoreAtTop]);

    useEffect(() => {
        setData([]);
        setPage(1);
        setHasMore(true);
        setLoading(false);
    }, [resetTrigger]);

    useEffect(() => {
        if (observer.current) observer.current.disconnect();

        const options = {
            root: null,
            rootMargin: loadMoreAtTop ? '200px 0px 0px 0px' : '0px 0px 200px 0px',
            threshold: 0.1,
        };

        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !loading) {
                loadMoreData();
            }
        }, options);

        const currentObserver = observer.current;

        if (targetRef.current) {
            currentObserver.observe(targetRef.current);
        }

        return () => {
            currentObserver.disconnect();
        };
    }, [loadMoreData, hasMore, loading, loadMoreAtTop]);

    useEffect(() => {
        if (observer.current && targetRef.current) {
            observer.current.observe(targetRef.current);
        }
    }, [data, loadMoreAtTop]);

    return (
        <FC cls={className} sx={style}>
            {data.length === 0 && !loading && renderEmpty ? renderEmpty() : null}
            {loadMoreAtTop && hasMore && !loading && <div ref={targetRef}></div>}
            {data.map((item, index) => (
                <React.Fragment key={index}>
                    {renderItem(item, index)}
                </React.Fragment>
            ))}
            {!loadMoreAtTop && hasMore && <div ref={targetRef}></div>}
            {loading && <FCCC mt={4}><CircularProgress size={'120px'}/></FCCC>}
        </FC>
    );
};

export default PaginatedList;
