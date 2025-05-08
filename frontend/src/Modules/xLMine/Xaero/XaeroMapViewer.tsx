// src/Modules/xLMine/components/XaeroMapViewer.tsx
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';

/* ──────────────────────────────── 81 тайл ──────────────────────────────── */
import img_0_0 from 'Static/img/xlmine/map/0_0_x-4608_z-4608.png';
import img_0_1 from 'Static/img/xlmine/map/0_1_x-4608_z-3584.png';
import img_0_2 from 'Static/img/xlmine/map/0_2_x-4608_z-2560.png';
import img_0_3 from 'Static/img/xlmine/map/0_3_x-4608_z-1536.png';
import img_0_4 from 'Static/img/xlmine/map/0_4_x-4608_z-512.png';
import img_0_5 from 'Static/img/xlmine/map/0_5_x-4608_z512.png';
import img_0_6 from 'Static/img/xlmine/map/0_6_x-4608_z1536.png';
import img_0_7 from 'Static/img/xlmine/map/0_7_x-4608_z2560.png';
import img_0_8 from 'Static/img/xlmine/map/0_8_x-4608_z3584.png';

import img_1_0 from 'Static/img/xlmine/map/1_0_x-3584_z-4608.png';
import img_1_1 from 'Static/img/xlmine/map/1_1_x-3584_z-3584.png';
import img_1_2 from 'Static/img/xlmine/map/1_2_x-3584_z-2560.png';
import img_1_3 from 'Static/img/xlmine/map/1_3_x-3584_z-1536.png';
import img_1_4 from 'Static/img/xlmine/map/1_4_x-3584_z-512.png';
import img_1_5 from 'Static/img/xlmine/map/1_5_x-3584_z512.png';
import img_1_6 from 'Static/img/xlmine/map/1_6_x-3584_z1536.png';
import img_1_7 from 'Static/img/xlmine/map/1_7_x-3584_z2560.png';
import img_1_8 from 'Static/img/xlmine/map/1_8_x-3584_z3584.png';

import img_2_0 from 'Static/img/xlmine/map/2_0_x-2560_z-4608.png';
import img_2_1 from 'Static/img/xlmine/map/2_1_x-2560_z-3584.png';
import img_2_2 from 'Static/img/xlmine/map/2_2_x-2560_z-2560.png';
import img_2_3 from 'Static/img/xlmine/map/2_3_x-2560_z-1536.png';
import img_2_4 from 'Static/img/xlmine/map/2_4_x-2560_z-512.png';
import img_2_5 from 'Static/img/xlmine/map/2_5_x-2560_z512.png';
import img_2_6 from 'Static/img/xlmine/map/2_6_x-2560_z1536.png';
import img_2_7 from 'Static/img/xlmine/map/2_7_x-2560_z2560.png';
import img_2_8 from 'Static/img/xlmine/map/2_8_x-2560_z3584.png';

import img_3_0 from 'Static/img/xlmine/map/3_0_x-1536_z-4608.png';
import img_3_1 from 'Static/img/xlmine/map/3_1_x-1536_z-3584.png';
import img_3_2 from 'Static/img/xlmine/map/3_2_x-1536_z-2560.png';
import img_3_3 from 'Static/img/xlmine/map/3_3_x-1536_z-1536.png';
import img_3_4 from 'Static/img/xlmine/map/3_4_x-1536_z-512.png';
import img_3_5 from 'Static/img/xlmine/map/3_5_x-1536_z512.png';
import img_3_6 from 'Static/img/xlmine/map/3_6_x-1536_z1536.png';
import img_3_7 from 'Static/img/xlmine/map/3_7_x-1536_z2560.png';
import img_3_8 from 'Static/img/xlmine/map/3_8_x-1536_z3584.png';

import img_4_0 from 'Static/img/xlmine/map/4_0_x-512_z-4608.png';
import img_4_1 from 'Static/img/xlmine/map/4_1_x-512_z-3584.png';
import img_4_2 from 'Static/img/xlmine/map/4_2_x-512_z-2560.png';
import img_4_3 from 'Static/img/xlmine/map/4_3_x-512_z-1536.png';
import img_4_4 from 'Static/img/xlmine/map/4_4_x-512_z-512.png';
import img_4_5 from 'Static/img/xlmine/map/4_5_x-512_z512.png';
import img_4_6 from 'Static/img/xlmine/map/4_6_x-512_z1536.png';
import img_4_7 from 'Static/img/xlmine/map/4_7_x-512_z2560.png';
import img_4_8 from 'Static/img/xlmine/map/4_8_x-512_z3584.png';

import img_5_0 from 'Static/img/xlmine/map/5_0_x512_z-4608.png';
import img_5_1 from 'Static/img/xlmine/map/5_1_x512_z-3584.png';
import img_5_2 from 'Static/img/xlmine/map/5_2_x512_z-2560.png';
import img_5_3 from 'Static/img/xlmine/map/5_3_x512_z-1536.png';
import img_5_4 from 'Static/img/xlmine/map/5_4_x512_z-512.png';
import img_5_5 from 'Static/img/xlmine/map/5_5_x512_z512.png';
import img_5_6 from 'Static/img/xlmine/map/5_6_x512_z1536.png';
import img_5_7 from 'Static/img/xlmine/map/5_7_x512_z2560.png';
import img_5_8 from 'Static/img/xlmine/map/5_8_x512_z3584.png';

import img_6_0 from 'Static/img/xlmine/map/6_0_x1536_z-4608.png';
import img_6_1 from 'Static/img/xlmine/map/6_1_x1536_z-3584.png';
import img_6_2 from 'Static/img/xlmine/map/6_2_x1536_z-2560.png';
import img_6_3 from 'Static/img/xlmine/map/6_3_x1536_z-1536.png';
import img_6_4 from 'Static/img/xlmine/map/6_4_x1536_z-512.png';
import img_6_5 from 'Static/img/xlmine/map/6_5_x1536_z512.png';
import img_6_6 from 'Static/img/xlmine/map/6_6_x1536_z1536.png';
import img_6_7 from 'Static/img/xlmine/map/6_7_x1536_z2560.png';
import img_6_8 from 'Static/img/xlmine/map/6_8_x1536_z3584.png';

import img_7_0 from 'Static/img/xlmine/map/7_0_x2560_z-4608.png';
import img_7_1 from 'Static/img/xlmine/map/7_1_x2560_z-3584.png';
import img_7_2 from 'Static/img/xlmine/map/7_2_x2560_z-2560.png';
import img_7_3 from 'Static/img/xlmine/map/7_3_x2560_z-1536.png';
import img_7_4 from 'Static/img/xlmine/map/7_4_x2560_z-512.png';
import img_7_5 from 'Static/img/xlmine/map/7_5_x2560_z512.png';
import img_7_6 from 'Static/img/xlmine/map/7_6_x2560_z1536.png';
import img_7_7 from 'Static/img/xlmine/map/7_7_x2560_z2560.png';
import img_7_8 from 'Static/img/xlmine/map/7_8_x2560_z3584.png';

import img_8_0 from 'Static/img/xlmine/map/8_0_x3584_z-4608.png';
import img_8_1 from 'Static/img/xlmine/map/8_1_x3584_z-3584.png';
import img_8_2 from 'Static/img/xlmine/map/8_2_x3584_z-2560.png';
import img_8_3 from 'Static/img/xlmine/map/8_3_x3584_z-1536.png';
import img_8_4 from 'Static/img/xlmine/map/8_4_x3584_z-512.png';
import img_8_5 from 'Static/img/xlmine/map/8_5_x3584_z512.png';
import img_8_6 from 'Static/img/xlmine/map/8_6_x3584_z1536.png';
import img_8_7 from 'Static/img/xlmine/map/8_7_x3584_z2560.png';
import img_8_8 from 'Static/img/xlmine/map/8_8_x3584_z3584.png';

/* «столбиками сверху‑вниз» ⇒ X‑колонка, Y‑строка */
const tiles: string[][] = [
    [img_0_0, img_0_1, img_0_2, img_0_3, img_0_4, img_0_5, img_0_6, img_0_7, img_0_8],
    [img_1_0, img_1_1, img_1_2, img_1_3, img_1_4, img_1_5, img_1_6, img_1_7, img_1_8],
    [img_2_0, img_2_1, img_2_2, img_2_3, img_2_4, img_2_5, img_2_6, img_2_7, img_2_8],
    [img_3_0, img_3_1, img_3_2, img_3_3, img_3_4, img_3_5, img_3_6, img_3_7, img_3_8],
    [img_4_0, img_4_1, img_4_2, img_4_3, img_4_4, img_4_5, img_4_6, img_4_7, img_4_8],
    [img_5_0, img_5_1, img_5_2, img_5_3, img_5_4, img_5_5, img_5_6, img_5_7, img_5_8],
    [img_6_0, img_6_1, img_6_2, img_6_3, img_6_4, img_6_5, img_6_6, img_6_7, img_6_8],
    [img_7_0, img_7_1, img_7_2, img_7_3, img_7_4, img_7_5, img_7_6, img_7_7, img_7_8],
    [img_8_0, img_8_1, img_8_2, img_8_3, img_8_4, img_8_5, img_8_6, img_8_7, img_8_8],
];

interface Props {
    width?: number | string;
    height?: number | string;
    initialScale?: number;
}

const BORDER = 120;          // кадрирование
const MAX_SCALE = 5;

const XaeroMapViewer: React.FC<Props> = ({
                                             width = '100%',
                                             height = 600,
                                             initialScale = 1,
                                         }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const cropRef = useRef<HTMLDivElement>(null);
    const [tileSize, setTileSize] = useState(512);
    const [scale, setScale] = useState(initialScale);
    const [translate, setTranslate] = useState({x: 0, y: 0});
    const [minScale, setMinScale] = useState(0.1);

    /* узнаём реальный размер тайла */
    useEffect(() => {
        const img = new Image();
        img.src = tiles[0][0];
        img.onload = () => setTileSize(img.width);
    }, []);

    /* пересчитываем минимальный масштаб при загрузке тайла/resize */
    const recalcMinScale = (e: any) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (!cropRef.current) return;
        const {clientWidth, clientHeight} = cropRef.current;
        const mapWidth = tiles.length * tileSize;
        const mapHeight = tiles[0].length * tileSize;
        const fitScale = Math.min(clientWidth / mapWidth, clientHeight / mapHeight);
        setMinScale(Math.min(1, fitScale));
        if (scale < fitScale) setScale(fitScale);
    };

    useLayoutEffect(() => {
        recalcMinScale(undefined);
    }, [tileSize]);

    /* обновляем при ресайзе окна */
    useEffect(() => {
        const handler = (e: any) => recalcMinScale(e);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, [tileSize, scale]);

    /* drag‑to‑pan */
    const isDragging = useRef(false);
    const start = useRef({x: 0, y: 0});
    const startTr = useRef({x: 0, y: 0});

    const onMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        isDragging.current = true;
        start.current = {x: e.clientX, y: e.clientY};
        startTr.current = {...translate};
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };
    const onMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) return;
        const dx = e.clientX - start.current.x;
        const dy = e.clientY - start.current.y;
        setTranslate({x: startTr.current.x + dx, y: startTr.current.y + dy});
    };
    const onMouseUp = () => {
        isDragging.current = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    };

    /* wheel‑zoom @ cursor */
    const onWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const delta = e.deltaY < 0 ? 1.1 : 0.9;
        const newScaleRaw = scale * delta;
        const newScale = Math.max(minScale, Math.min(MAX_SCALE, newScaleRaw));

        /* координата курсора внутри карты до зума */
        const rect = cropRef.current!.getBoundingClientRect();
        const cursorX = e.clientX - rect.left - translate.x;
        const cursorY = e.clientY - rect.top - translate.y;
        const mapX = cursorX / scale;
        const mapY = cursorY / scale;

        /* новое смещение чтобы mapX/Y остались под курсором */
        const newTranslateX = e.clientX - rect.left - mapX * newScale;
        const newTranslateY = e.clientY - rect.top - mapY * newScale;

        setScale(newScale);
        setTranslate({x: newTranslateX, y: newTranslateY});
    };

    /* размеры всей карты */
    const mapW = tiles.length * tileSize;
    const mapH = tiles[0].length * tileSize;

    return (
        <div
            ref={containerRef}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height,
                position: 'relative',
                userSelect: 'none',
                touchAction: 'none',
            }}
            onWheel={onWheel}
        >
            {/* crop wrapper */}
            <div
                ref={cropRef}
                onMouseDown={onMouseDown}
                style={{
                    position: 'absolute',
                    top: BORDER,
                    left: BORDER,
                    right: BORDER,
                    bottom: BORDER,
                    overflow: 'hidden',
                    cursor: isDragging.current ? 'grabbing' : 'grab',
                    background: '#000',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        left: translate.x,
                        top: translate.y,
                        width: mapW,
                        height: mapH,
                        transform: `scale(${scale})`,
                        transformOrigin: '0 0',
                    }}
                >
                    {tiles.map((col, cx) =>
                        col.map((src, cy) => (
                            <img
                                key={`${cx}_${cy}`}
                                src={src}
                                draggable={false}
                                style={{
                                    position: 'absolute',
                                    left: cx * tileSize,
                                    top: cy * tileSize,
                                    width: tileSize,
                                    height: tileSize,
                                    imageRendering: 'pixelated',
                                }}
                                alt=""
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default XaeroMapViewer;
