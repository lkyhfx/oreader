import { Icon } from '@iconify/react';
import { Book } from "@prisma/client";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import { useRef, useState } from "react";
import { useToast } from "~/hooks/use-toast";
import { prisma } from "~/services/db";
import * as R from 'remeda'
import SettingsDialog from '~/components/SettingsDialog';

interface LoaderData {
    books: Book[];
}

const HomePage = () => {
    const { books, translationPrompt, dictionaryPrompt,
        targetLanguage, apiKey, apiBaseUrl, chatModelName, embedModelName } = useLoaderData<{
            books: Book[], translationPrompt: string, dictionaryPrompt: string,
            targetLanguage: string, apiKey: string, apiBaseUrl: string, chatModelName: string, embedModelName: string
        }>();
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append("book", file);

            try {
                setIsUploading(true);
                const response = await fetch("/bookManage", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    toast({
                        title: "Error uploading file",
                        description: response.statusText,
                        variant: "destructive",
                    });
                }
                window.location.reload();
            } catch (error) {
                toast({
                    title: "Error uploading file",
                    description: error instanceof Error ? error.message : 'Unknown error',
                    variant: "destructive",
                });
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleBookSelect = (book: Book) => {
        setSelectedBook(book);
        if (book) {
            navigate(`/reader/${encodeURIComponent(book.fileName)}`);
        }
    };

    const handleClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'copy';
    };

    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
        setIsDragging(false);
        event.preventDefault();
        event.stopPropagation();
        const file = event.dataTransfer.files[0];
        if (file) {
            setIsUploading(true);
            const formData = new FormData();
            formData.append("book", file);

            try {
                const response = await fetch("/bookManage", {
                    method: "POST",
                    body: formData,
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    window.location.reload();
                } else {
                    toast({
                        title: "Error uploading file",
                        description: data.error || response.statusText,
                        variant: "destructive",
                    });
                }
            } catch (error) {
                toast({
                    title: "Error uploading file",
                    description: error instanceof Error ? error.message : 'Unknown error',
                    variant: "destructive",
                });
            } finally {
                setIsUploading(false);
            }
        }
    };

    return (
        <div className="flex flex-col h-screen w-screen">
            <div className="top-0 left-0 right-0 bg-white text-black flex justify-end">
                <button className="text-black hover:bg-gray-100 p-1 rounded-md" onClick={() => setIsSettingsVisible(true)}>
                    <Icon icon="material-symbols:settings" width="24" height="24" />
                </button>
            </div>
            <div className="flex-grow p-5"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnter={handleDragEnter}
            >

                {isDragging && (
                    <div className="absolute inset-0 bg-black opacity-25 z-10"
                        onDragLeave={handleDragLeave}
                    ></div>
                )}
                {isUploading && (
                    <div className="absolute inset-0 bg-black opacity-25 z-10">
                        <div className="flex flex-col items-center justify-center h-full">
                            <h1 className="text-white text-2xl">Uploading...</h1>
                        </div>
                    </div>
                )}
                <div className="flex flex-wrap justify-start items-stretch gap-3">
                    {books.map((book, index) => (
                        <div
                            key={index}
                            className="relative border-gray-300 p-3 rounded-lg cursor-pointer flex flex-col items-center justify-between w-[180px] h-[290px] group"
                            onClick={() => handleBookSelect(book)}
                        >
                            <div><img
                                src={book.coverBase64 ? `data:image/png;base64,${book.coverBase64}` : undefined}
                                alt={book.title ? book.title : 'No Title'}
                                className="object-cover w-[170px] h-[240px]"
                            />
                            </div>
                            <div><h3 className=" font-semibold">{book.title}</h3></div>
                            <div><p className=" text-gray-500">{book.author}</p></div>

                            <Form method="get" action={`/bookManage/${encodeURIComponent(book.fileName)}/remove`} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button type="submit" className="text-red-500 opacity-0 hover:opacity-100 p-1">
                                    <Icon icon="material-symbols:delete-outline" width="24" height="24" />
                                </button>
                            </Form>
                        </div>
                    ))}

                    <div
                        className="flex flex-col p-3 items-center justify-between w-[180px] h-[290px]"
                    >
                        <div
                            className="border-dashed border-2 border-black rounded-lg cursor-pointer flex flex-col items-center justify-center w-[170px] h-[240px]"
                            onClick={handleClick}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </div>
                        <div><h3 className=" font-semibold">{' '} </h3> </div>
                        <div><p className=" text-gray-500">{' '} </p></div>
                    </div>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
            <SettingsDialog isSettingsVisible={isSettingsVisible} setIsSettingsVisible={setIsSettingsVisible}
                translationPrompt={translationPrompt} dictionaryPrompt={dictionaryPrompt} targetLanguage={targetLanguage}
                apiKey={apiKey} apiBaseUrl={apiBaseUrl} chatModelName={chatModelName} embedModelName={embedModelName} />
        </div>
    );
};

export default HomePage;

export const loader = async () => {
    const books = await prisma.book.findMany();
    const settings = await prisma.setting.findMany(
        {
            where: {
                type: {
                    in: ['translationPrompt', 'dictionaryPrompt', 'targetLanguage', 'apiKey',
                        'apiBaseUrl', 'chatModelName', 'embedModelName']
                }
            }
        }
    )
    const settingsGrouped = R.groupBy(settings, setting => setting.type)
    const translationPrompt = settingsGrouped.translationPrompt[0].content
    const dictionaryPrompt = settingsGrouped.dictionaryPrompt[0].content
    const targetLanguage = settingsGrouped.targetLanguage[0].content
    const apiKey = settingsGrouped.apiKey[0].content
    const apiBaseUrl = settingsGrouped.apiBaseUrl[0].content
    const chatModelName = settingsGrouped.chatModelName[0].content
    const embedModelName = settingsGrouped.embedModelName[0].content


    return { books, translationPrompt, dictionaryPrompt, targetLanguage, apiKey, apiBaseUrl, chatModelName, embedModelName };
};
