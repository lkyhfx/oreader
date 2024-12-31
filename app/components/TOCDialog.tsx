import { Cross1Icon } from '@radix-ui/react-icons';
import { NavItem } from 'epubjs';
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { ScrollArea } from '~/components/ui/scroll-area';
interface TOCDialogProps {
    toc: NavItem[];
    isTOCVisible: boolean;
    onItemClick: (navItem: NavItem) => void;
    setIsTOCVisible: (visible: boolean) => void;
}

const TOCDialog: React.FC<TOCDialogProps> = ({ toc, onItemClick, isTOCVisible, setIsTOCVisible }) => {
    return (
        <Dialog open={isTOCVisible} onOpenChange={setIsTOCVisible}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Table of Contents</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-72">
<ul>
                    {toc.map((item, index) => (
                        <li key={index} className="mb-2">
                            <button
                                className="text-blue-500 hover:underline"
                                onClick={() => onItemClick(item)}
                            >
                                {item.label}
                            </button>
                        </li>
                    ))}
                </ul>
                </ScrollArea>
                
            </DialogContent>
        </Dialog>
    )
    // return (
    //     <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
    //         <div className="bg-white p-4 rounded shadow-lg max-h-full overflow-y-auto relative">
    //             <button
    //                 className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
    //                 onClick={onClose}
    //             >
    //                 <Cross1Icon />
    //             </button>
    //             <h2 className="text-lg font-bold mb-4">Table of Contents</h2>
    //             <ul>
    //                 {toc.map((item, index) => (
    //                     <li key={index} className="mb-2">
    //                         <button
    //                             className="text-blue-500 hover:underline"
    //                             onClick={() => onItemClick(item)}
    //                         >
    //                             {item.label}
    //                         </button>
    //                     </li>
    //                 ))}
    //             </ul>
    //         </div>
    //     </div>
    // );
};

export default TOCDialog; 