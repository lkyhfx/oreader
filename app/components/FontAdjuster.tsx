import { useState } from 'react';
import { Slider } from "~/components/ui/slider"


const FontAdjuster: React.FC<{ onFontSizeChange: (size: number) => void }> = ({ onFontSizeChange }) => {
    const [fontSize, setFontSize] = useState(16);

    const handleFontSizeChange = (value: number[]) => {
        const newSize = value[0];
        setFontSize(newSize);
        onFontSizeChange(newSize);
    };

    return (
        <div className="p-1 flex flex-col items-center">
            <label className="block mb-2 text-sm">Adjust Font Size</label>
            <Slider
                color="gray"
                value={[fontSize]}
                onValueChange={handleFontSizeChange}
                min={10}
                max={30}
                step={1}
            />
        </div>
    );
};

export default FontAdjuster; 