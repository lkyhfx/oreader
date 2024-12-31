import { useChat } from 'ai/react';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent } from '~/components/ui/dialog';

export default function ChatDialog({ fileName, isChatVisible, setIsChatVisible }: { fileName: string, isChatVisible: boolean, setIsChatVisible: (isChatVisible: boolean) => void }) {
    const { messages, input, setMessages, handleInputChange, handleSubmit } = useChat({
        body: {
            fileName: fileName
        }
    });

    return (
        <Dialog open={isChatVisible} onOpenChange={setIsChatVisible}>
            <DialogContent className="sm:max-w-[50%]">
                <div className="flex flex-col w-full max-w-md mx-auto stretch">
                    <div className="flex flex-col h-64 overflow-y-auto">
                        {messages.length > 0
                            ? messages.map(m => (
                                <div key={m.id} className="whitespace-pre-wrap">
                                    {m.role === 'user' ? 'User: ' : 'AI: '}
                                    {m.content}
                                </div>
                            ))
                            : null}
                    </div>
                    <div className="flex flex-row space-x-2 items-center">
                        <form onSubmit={handleSubmit} className="flex-grow">
                            <input
                                className="w-[100%] max-w-md p-2 border border-gray-300 rounded shadow-md"
                                value={input}
                                placeholder="Say something..."
                                onChange={handleInputChange}
                            />
                        </form>
                        <Button onClick={() => setMessages([])}>Clear</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}