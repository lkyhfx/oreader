import React from 'react';

interface ColorPickerProps {
    selectedColor: { background: string, color: string };
    handleColorChange: (color: { background: string, color: string }) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, handleColorChange }) => {
    const colors = [{ background: '#ffffff', color: '#000000' }, { background: '#f1e1c7', color: '#372c24' }, { background: '#4a494e', color: '#aaabb4' }];


    const getContrastColor = (color: string) => {
        // Simple algorithm to determine contrast color (black or white)
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128 ? 'black' : 'white';
    };

    return (
        <div className="flex space-x-2 p-1">
            {colors.map((color) => (
                <div
                    key={color.background}
                    onClick={() => handleColorChange(color)}
                    style={{ backgroundColor: color.background }}
                    className={`border-[1px] border-gray-300 w-6 h-6 rounded-full cursor-pointer relative`}
                >
                    {selectedColor.background === color.background && (
                        <span
                            style={{
                                color: getContrastColor(color.background),
                            }}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg leading-none"
                        >
                            ✓
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ColorPicker; 