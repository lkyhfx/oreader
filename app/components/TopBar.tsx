import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import ColorPicker from '~/components/ColorPicker';
import FontSelect from '~/components/FontSelect';
import { Label } from '~/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { Switch } from '~/components/ui/switch';

interface TopBarProps {
    isVisible: boolean;
    textColor: { background: string; color: string };
    handleColorChange: (color: { background: string; color: string }) => void;
    onOpenSettings: () => void;
    selectedFont: string;
    handleFontChange: (font: string) => void;
    translationEnabled: boolean;
    handleTranslateActiveChange: (enabled: boolean) => void;
    onOpenTOC: () => void;
    onOpenChat: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ isVisible,
    onOpenTOC, onOpenSettings, textColor, handleColorChange, selectedFont, handleFontChange,
    translationEnabled, handleTranslateActiveChange, onOpenChat }) => {
    const { t } = useTranslation();
    return (
        <div
            className={`absolute left-0 right-0 top-0  h-[4%] bg-white shadow-md flex items-center justify-between duration-300 ${isVisible ? 'visible' : 'invisible'}`}
        >
            <button className="border-none bg-none cursor-pointer hover:bg-gray-100 hover:rounded-md" onClick={onOpenTOC}>
                <Icon icon="mdi:table-of-contents" width="24" height="24" />
            </button>
            <div className="flex items-center justify-between">
                <button onClick={onOpenChat} className="hover:bg-gray-100 hover:rounded-md mr-2">
                    <Icon icon="mynaui:chat" width="24" height="24" />
                </button>
                <button onClick={onOpenSettings} className="hover:bg-gray-100 hover:rounded-md">
                    <Icon icon="material-symbols:settings" width="24" height="24" />
                </button>
                <Popover>
                    <PopoverTrigger asChild>
                        <button className="ml-2 border-none bg-none cursor-pointer hover:bg-gray-100 hover:rounded-md">
                            <Icon icon="mdi:format-size" width="24" height="24" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="bg-white shadow-md p-2 rounded w-40 flex flex-col items-center">
                        <ColorPicker selectedColor={textColor} handleColorChange={handleColorChange} />
                        <div className="border-t my-2 border-gray-300 w-full"></div>
                        {/* <FontAdjuster onFontSizeChange={handleFontSizeChange} /> */}
                        <FontSelect selectedFont={selectedFont} handleFontChange={handleFontChange} />
                        <div className="border-t my-2 border-gray-300 w-full"></div>
                        <div className="flex items-center space-x-2">
                            <Switch id="translation-enabled" checked={translationEnabled} onCheckedChange={handleTranslateActiveChange} />
                            <Label htmlFor="translation-enabled">{t('translationSwitch.label')}</Label>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
};

export default TopBar; 