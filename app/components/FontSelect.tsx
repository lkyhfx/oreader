
import React from 'react';

interface FontSelectProps {
    selectedFont: string;
    handleFontChange: (font: string) => void;
}

const fonts = ['Helvetica', 'Tahoma', 'Georgia', 'Noto Serif SC'];

const FontSelect: React.FC<FontSelectProps> = ({ selectedFont, handleFontChange }) => {

    return (
        <div className="font-select text-sm flex flex-col">
            {fonts.map((font) => (
                <div
                    key={font}
                    className={`font-item flex flex-row items-end`}
                    onClick={() => {
                        handleFontChange(font)
                    }}
                    style={{ fontFamily: font, cursor: 'pointer', padding: '5px' }}
                >
                    <span className={selectedFont === font ? 'opacity-100' : 'opacity-0'}>✔</span>
                    {font}
                </div>
            ))}
        </div>
    );
};

export default FontSelect;