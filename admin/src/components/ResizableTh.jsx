import React, { useState, useRef, useEffect } from 'react';

const ResizableTh = ({ children, className, ...props }) => {
    const [width, setWidth] = useState('auto');
    const thRef = useRef(null);
    const startOffset = useRef(0);
    const startWidth = useRef(0);

    const onMouseDown = (e) => {
        e.preventDefault();
        startOffset.current = e.pageX;
        startWidth.current = thRef.current.offsetWidth;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        // Add resizing class to body to prevent cursor flickering
        document.body.style.cursor = 'col-resize';
    };

    const onMouseMove = (e) => {
        const newWidth = startWidth.current + (e.pageX - startOffset.current);
        if (newWidth > 50) { // Minimum width constraint
            setWidth(newWidth);
        }
    };

    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = 'default';
    };

    // Initialize width on mount if needed, though 'auto' usually works until interaction
    useEffect(() => {
        if (thRef.current) {
            // We don't necessarily need to set explicit width initially, just let it be natural
            // unti user resizes.
        }
    }, []);

    return (
        <th
            ref={thRef}
            className={`relative group ${className}`}
            style={{ width: width === 'auto' ? 'auto' : `${width}px` }}
            {...props}
        >
            <div className="flex items-center h-full w-full">
                {children}
            </div>
            <div
                onMouseDown={onMouseDown}
                className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 group-hover:bg-blue-200 transition-colors z-10"
                style={{ touchAction: 'none' }} // Prevent scrolling on touch devices while resizing
            />
        </th>
    );
};

export default ResizableTh;
