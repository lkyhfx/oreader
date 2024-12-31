import React from 'react';
import { ScrollArea } from '~/components/ui/scroll-area';

interface PopupProps {
    text: string;
    position: { x: number; y: number };
}

const Popup: React.FC<PopupProps> = ({ text, position }) => {
    return (
        <div className="absolute shadow-lg" style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
        }}
        >
            <ScrollArea className="w-48 h-72 rounded-md border bg-white p-2">
                {text}
            </ScrollArea>
        </div>
    );
};

export default Popup; 